import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from app.schemas.lead import LeadCreateRequest

logger = logging.getLogger(__name__)

COLLECTION = "leads"


class LeadRepository:
    """
    Data Access Layer for the leads collection.
    All methods are async and use Motor for non-blocking I/O.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[COLLECTION]

    # ─────────────────────────────────────────
    # Write Operations
    # ─────────────────────────────────────────

    async def create(self, data: LeadCreateRequest) -> Dict[str, Any]:
        """Insert a new lead document. Returns the created document."""
        document = {
            **data.model_dump(exclude_none=True),
            "created_at": datetime.utcnow(),
            "email_sent": False,
            "email_sent_at": None,
            "email_opened": False,
            "email_opened_at": None,
            "link_clicked": False,
            "link_clicked_at": None,
            "tracking_token": str(uuid.uuid4()),
            "click_token": str(uuid.uuid4()),
            "ai_category": None,
            "ai_priority": None,
            "ai_analyzed_at": None,
        }

        result = await self.collection.insert_one(document)
        document["_id"] = str(result.inserted_id)
        return document

    async def mark_email_sent(self, lead_id: str) -> None:
        """Mark a lead's email as sent."""
        await self.collection.update_one(
            {"_id": ObjectId(lead_id)},
            {"$set": {"email_sent": True, "email_sent_at": datetime.utcnow()}},
        )

    async def mark_email_opened(self, tracking_token: str) -> Optional[Dict]:
        """Mark email as opened by tracking token. Returns updated doc."""
        result = await self.collection.find_one_and_update(
            {"tracking_token": tracking_token, "email_opened": False},
            {
                "$set": {
                    "email_opened": True,
                    "email_opened_at": datetime.utcnow(),
                }
            },
            return_document=True,
        )
        return result

    async def mark_link_clicked(self, click_token: str) -> Optional[Dict]:
        """Mark link as clicked by click token. Returns updated doc."""
        result = await self.collection.find_one_and_update(
            {"click_token": click_token},
            {
                "$set": {
                    "link_clicked": True,
                    "link_clicked_at": datetime.utcnow(),
                }
            },
            return_document=True,
        )
        return result

    async def update_ai_classification(
        self, lead_id: str, category: str, priority: str
    ) -> None:
        """Save AI classification results."""
        await self.collection.update_one(
            {"_id": ObjectId(lead_id)},
            {
                "$set": {
                    "ai_category": category,
                    "ai_priority": priority,
                    "ai_analyzed_at": datetime.utcnow(),
                }
            },
        )

    # ─────────────────────────────────────────
    # Read Operations
    # ─────────────────────────────────────────

    async def find_by_email(self, email: str) -> Optional[Dict]:
        """Check if a lead with this email already exists."""
        return await self.collection.find_one({"email": email.lower()})

    async def find_by_tracking_token(self, token: str) -> Optional[Dict]:
        return await self.collection.find_one({"tracking_token": token})

    async def find_by_click_token(self, token: str) -> Optional[Dict]:
        return await self.collection.find_one({"click_token": token})

    async def find_by_id(self, lead_id: str) -> Optional[Dict]:
        try:
            return await self.collection.find_one({"_id": ObjectId(lead_id)})
        except Exception:
            return None

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: int = -1,  # -1 = descending
        email_sent: Optional[bool] = None,
        email_opened: Optional[bool] = None,
        link_clicked: Optional[bool] = None,
    ) -> tuple[List[Dict], int]:
        """
        Paginated list of leads with optional search, sort, and filter.
        Returns (leads_list, total_count).
        """
        query: Dict[str, Any] = {}

        # Text search across name, email, company, requirement
        if search:
            query["$or"] = [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}},
                {"requirement": {"$regex": search, "$options": "i"}},
            ]

        # Boolean filters
        if email_sent is not None:
            query["email_sent"] = email_sent
        if email_opened is not None:
            query["email_opened"] = email_opened
        if link_clicked is not None:
            query["link_clicked"] = link_clicked

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size

        cursor = (
            self.collection.find(query)
            .sort(sort_by, sort_order)
            .skip(skip)
            .limit(page_size)
        )

        leads = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            leads.append(doc)

        return leads, total

    async def get_all_for_export(self) -> List[Dict]:
        """Fetch all leads for CSV export (no pagination)."""
        cursor = self.collection.find({}).sort("created_at", -1)
        leads = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            leads.append(doc)
        return leads

    async def get_unclassified(self) -> List[Dict]:
        """Fetch leads that haven't been AI-classified yet."""
        cursor = self.collection.find({"ai_category": None})
        leads = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            leads.append(doc)
        return leads

    # ─────────────────────────────────────────
    # Aggregation for Dashboard
    # ─────────────────────────────────────────

    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """
        Run aggregation pipelines to compute all dashboard metrics.
        Returns structured dict matching DashboardStats schema.
        """
        total_leads = await self.collection.count_documents({})
        emails_sent = await self.collection.count_documents({"email_sent": True})
        emails_opened = await self.collection.count_documents({"email_opened": True})
        links_clicked = await self.collection.count_documents({"link_clicked": True})

        open_rate = round((emails_opened / emails_sent * 100), 1) if emails_sent else 0.0
        click_rate = round((links_clicked / emails_sent * 100), 1) if emails_sent else 0.0

        # Daily leads for last 30 days
        leads_per_day = await self._get_daily_counts("created_at", 30)

        # Open rate trend (daily opens / daily emails sent - approximated)
        open_rate_trend = await self._get_daily_counts("email_opened_at", 30, filter_field="email_opened", filter_val=True)

        # Click rate trend
        click_rate_trend = await self._get_daily_counts("link_clicked_at", 30, filter_field="link_clicked", filter_val=True)

        return {
            "total_leads": total_leads,
            "emails_sent": emails_sent,
            "emails_opened": emails_opened,
            "open_rate": open_rate,
            "links_clicked": links_clicked,
            "click_rate": click_rate,
            "leads_per_day": leads_per_day,
            "open_rate_trend": open_rate_trend,
            "click_rate_trend": click_rate_trend,
        }

    async def _get_daily_counts(
        self,
        date_field: str,
        days: int = 30,
        filter_field: Optional[str] = None,
        filter_val: Optional[Any] = None,
    ) -> List[Dict[str, Any]]:
        """Aggregate document counts grouped by day for a date field."""
        match_stage: Dict[str, Any] = {date_field: {"$ne": None}}
        if filter_field and filter_val is not None:
            match_stage[filter_field] = filter_val

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": {
                        "year": {"$year": f"${date_field}"},
                        "month": {"$month": f"${date_field}"},
                        "day": {"$dayOfMonth": f"${date_field}"},
                    },
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}},
            {"$limit": days},
        ]

        results = []
        async for doc in self.collection.aggregate(pipeline):
            y = doc["_id"]["year"]
            m = doc["_id"]["month"]
            d = doc["_id"]["day"]
            results.append({"date": f"{y}-{m:02d}-{d:02d}", "count": doc["count"]})

        return results
