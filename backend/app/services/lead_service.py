import io
import csv
import math
import logging
from typing import Optional, List
from fastapi import BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.lead_repository import LeadRepository
from app.services.email_service import email_service
from app.services.ai_service import ai_service
from app.schemas.lead import (
    LeadCreateRequest,
    LeadCreateResponse,
    LeadResponse,
    PaginatedLeadsResponse,
    DashboardStats,
    AnalyzeResponse,
)

logger = logging.getLogger(__name__)


def _doc_to_response(doc: dict) -> LeadResponse:
    """Convert a raw MongoDB document to a LeadResponse schema."""
    return LeadResponse(
        id=str(doc.get("_id", "")),
        full_name=doc.get("full_name", ""),
        email=doc.get("email", ""),
        phone=doc.get("phone", ""),
        company=doc.get("company"),
        requirement=doc.get("requirement", ""),
        created_at=doc.get("created_at"),
        email_sent=doc.get("email_sent", False),
        email_opened=doc.get("email_opened", False),
        email_opened_at=doc.get("email_opened_at"),
        link_clicked=doc.get("link_clicked", False),
        link_clicked_at=doc.get("link_clicked_at"),
        ai_category=doc.get("ai_category"),
        ai_priority=doc.get("ai_priority"),
    )


class LeadService:
    """
    Business logic layer for lead management.
    Orchestrates between the repository, email service, and AI service.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = LeadRepository(db)

    # ─────────────────────────────────────────
    # Lead Creation
    # ─────────────────────────────────────────

    async def create_lead(
        self, data: LeadCreateRequest, background_tasks: BackgroundTasks
    ) -> LeadCreateResponse:
        """
        1. Check for duplicate email
        2. Insert lead into MongoDB
        3. Queue welcome email as background task
        4. Return success response
        """
        # Duplicate check
        existing = await self.repo.find_by_email(data.email)
        if existing:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=409,
                detail="A lead with this email address already exists.",
            )

        # Create lead document
        doc = await self.repo.create(data)
        lead_id = str(doc["_id"])

        logger.info(f"Lead created: {lead_id} ({data.email})")

        # Queue email sending as a background task (non-blocking)
        background_tasks.add_task(
            self._send_welcome_and_mark,
            lead_id=lead_id,
            to_email=data.email,
            full_name=data.full_name,
            requirement=data.requirement,
            tracking_token=doc["tracking_token"],
            click_token=doc["click_token"],
        )

        return LeadCreateResponse(
            lead_id=lead_id,
            message="Lead submitted successfully. A personalized email is on its way!",
        )

    async def _send_welcome_and_mark(
        self,
        lead_id: str,
        to_email: str,
        full_name: str,
        requirement: str,
        tracking_token: str,
        click_token: str,
    ) -> None:
        """Background task: send email and mark as sent."""
        try:
            sent = await email_service.send_welcome_email(
                lead_id=lead_id,
                to_email=to_email,
                full_name=full_name,
                requirement=requirement,
                tracking_token=tracking_token,
                click_token=click_token,
            )
            if sent:
                await self.repo.mark_email_sent(lead_id)
                logger.info(f"Email marked as sent for lead: {lead_id}")
        except Exception as e:
            logger.error(f"Background email task failed for lead {lead_id}: {e}")

    # ─────────────────────────────────────────
    # Lead Queries
    # ─────────────────────────────────────────

    async def get_leads(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        email_sent: Optional[bool] = None,
        email_opened: Optional[bool] = None,
        link_clicked: Optional[bool] = None,
    ) -> PaginatedLeadsResponse:
        """Return paginated, filtered, sorted leads."""
        sort_direction = -1 if sort_order == "desc" else 1

        leads, total = await self.repo.get_paginated(
            page=page,
            page_size=page_size,
            search=search,
            sort_by=sort_by,
            sort_order=sort_direction,
            email_sent=email_sent,
            email_opened=email_opened,
            link_clicked=link_clicked,
        )

        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return PaginatedLeadsResponse(
            leads=[_doc_to_response(doc) for doc in leads],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    # ─────────────────────────────────────────
    # Dashboard
    # ─────────────────────────────────────────

    async def get_dashboard_stats(self) -> DashboardStats:
        """Fetch and return all dashboard analytics."""
        raw = await self.repo.get_dashboard_stats()
        return DashboardStats(**raw)

    # ─────────────────────────────────────────
    # Tracking
    # ─────────────────────────────────────────

    async def handle_email_open(self, tracking_token: str) -> None:
        """Process an email open event."""
        doc = await self.repo.mark_email_opened(tracking_token)
        if doc:
            logger.info(f"Email opened: {doc.get('email')} ({tracking_token})")

    async def handle_link_click(self, click_token: str) -> None:
        """Process a link click event."""
        doc = await self.repo.mark_link_clicked(click_token)
        if doc:
            logger.info(f"Link clicked: {doc.get('email')} ({click_token})")

    # ─────────────────────────────────────────
    # AI Classification
    # ─────────────────────────────────────────

    async def analyze_leads(self) -> AnalyzeResponse:
        """
        Run AI classification on all unclassified leads.
        Updates ai_category and ai_priority for each.
        """
        unclassified = await self.repo.get_unclassified()

        if not unclassified:
            return AnalyzeResponse(
                analyzed=0,
                skipped=0,
                message="All leads are already classified.",
            )

        analyzed = 0
        skipped = 0

        for lead in unclassified:
            try:
                category, priority = await ai_service.classify_lead(
                    full_name=lead.get("full_name", ""),
                    requirement=lead.get("requirement", ""),
                    company=lead.get("company"),
                )
                await self.repo.update_ai_classification(
                    lead_id=str(lead["_id"]),
                    category=category,
                    priority=priority,
                )
                analyzed += 1
                logger.info(f"Classified lead {lead['_id']}: {category} / {priority}")
            except Exception as e:
                logger.error(f"Failed to classify lead {lead.get('_id')}: {e}")
                skipped += 1

        return AnalyzeResponse(
            analyzed=analyzed,
            skipped=skipped,
            message=f"Successfully classified {analyzed} leads. {skipped} failed.",
        )

    # ─────────────────────────────────────────
    # CSV Export
    # ─────────────────────────────────────────

    async def export_csv(self) -> str:
        """
        Export all leads as a CSV string.
        Returns the CSV content as a string for streaming.
        """
        leads = await self.repo.get_all_for_export()

        output = io.StringIO()
        fieldnames = [
            "id", "full_name", "email", "phone", "company", "requirement",
            "created_at", "email_sent", "email_opened", "email_opened_at",
            "link_clicked", "link_clicked_at", "ai_category", "ai_priority",
        ]

        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()

        for lead in leads:
            writer.writerow({
                "id": str(lead.get("_id", "")),
                "full_name": lead.get("full_name", ""),
                "email": lead.get("email", ""),
                "phone": lead.get("phone", ""),
                "company": lead.get("company", ""),
                "requirement": lead.get("requirement", ""),
                "created_at": lead.get("created_at", ""),
                "email_sent": lead.get("email_sent", False),
                "email_opened": lead.get("email_opened", False),
                "email_opened_at": lead.get("email_opened_at", ""),
                "link_clicked": lead.get("link_clicked", False),
                "link_clicked_at": lead.get("link_clicked_at", ""),
                "ai_category": lead.get("ai_category", ""),
                "ai_priority": lead.get("ai_priority", ""),
            })

        return output.getvalue()
