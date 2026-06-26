from fastapi import APIRouter, BackgroundTasks, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
import io

from app.database.connection import get_database
from app.services.lead_service import LeadService
from app.schemas.lead import (
    LeadCreateRequest,
    LeadCreateResponse,
    PaginatedLeadsResponse,
    DashboardStats,
    AnalyzeResponse,
)

router = APIRouter(prefix="/api", tags=["Leads"])


def get_lead_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> LeadService:
    """Dependency injection: creates LeadService with active DB session."""
    return LeadService(db)


# ─────────────────────────────────────────
# POST /api/leads — Create a new lead
# ─────────────────────────────────────────

@router.post(
    "/leads",
    response_model=LeadCreateResponse,
    status_code=201,
    summary="Submit a new lead",
    description="Accepts lead form data, stores in MongoDB, and sends a personalized email in the background.",
)
async def create_lead(
    data: LeadCreateRequest,
    background_tasks: BackgroundTasks,
    service: LeadService = Depends(get_lead_service),
) -> LeadCreateResponse:
    return await service.create_lead(data, background_tasks)


# ─────────────────────────────────────────
# GET /api/leads — List leads (paginated)
# ─────────────────────────────────────────

@router.get(
    "/leads",
    response_model=PaginatedLeadsResponse,
    summary="Get paginated leads",
    description="Fetch leads with pagination, search, sorting, and filtering.",
)
async def get_leads(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of leads per page"),
    search: Optional[str] = Query(None, description="Search across name, email, company, requirement"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order: 'asc' or 'desc'"),
    email_sent: Optional[bool] = Query(None, description="Filter by email sent status"),
    email_opened: Optional[bool] = Query(None, description="Filter by email opened status"),
    link_clicked: Optional[bool] = Query(None, description="Filter by link clicked status"),
    service: LeadService = Depends(get_lead_service),
) -> PaginatedLeadsResponse:
    return await service.get_leads(
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        email_sent=email_sent,
        email_opened=email_opened,
        link_clicked=link_clicked,
    )


# ─────────────────────────────────────────
# GET /api/dashboard — Analytics stats
# ─────────────────────────────────────────

@router.get(
    "/dashboard",
    response_model=DashboardStats,
    summary="Get dashboard analytics",
    description="Returns aggregated statistics for the analytics dashboard.",
)
async def get_dashboard(
    service: LeadService = Depends(get_lead_service),
) -> DashboardStats:
    return await service.get_dashboard_stats()


# ─────────────────────────────────────────
# POST /api/analyze — AI lead classification
# ─────────────────────────────────────────

@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="AI-classify unclassified leads",
    description="Runs Gemini AI classification on all leads that haven't been classified yet.",
)
async def analyze_leads(
    service: LeadService = Depends(get_lead_service),
) -> AnalyzeResponse:
    return await service.analyze_leads()


# ─────────────────────────────────────────
# GET /api/export/csv — CSV export
# ─────────────────────────────────────────

@router.get(
    "/export/csv",
    summary="Export leads to CSV",
    description="Download all leads as a CSV file.",
)
async def export_csv(
    service: LeadService = Depends(get_lead_service),
):
    csv_content = await service.export_csv()

    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads_export.csv"},
    )
