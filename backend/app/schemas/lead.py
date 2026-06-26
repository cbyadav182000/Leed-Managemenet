import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime


# ─────────────────────────────────────────
# Request Schemas
# ─────────────────────────────────────────

class LeadCreateRequest(BaseModel):
    """Schema for creating a new lead via POST /api/leads."""

    full_name: str = Field(
        ..., min_length=2, max_length=100, description="Full name of the lead"
    )
    email: EmailStr = Field(..., description="Valid email address")
    phone: str = Field(..., description="Phone number (7-15 digits)")
    company: Optional[str] = Field(None, max_length=150, description="Company name (optional)")
    requirement: str = Field(
        ..., min_length=10, max_length=2000, description="Project requirement details"
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Allow digits, spaces, hyphens, parentheses, and optional + prefix."""
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if v.startswith("+"):
            cleaned = "+" + re.sub(r"[\s\-\(\)]", "", v[1:])
        digits_only = re.sub(r"[^\d]", "", cleaned)
        if not (7 <= len(digits_only) <= 15):
            raise ValueError("Phone number must be between 7 and 15 digits.")
        return v.strip()

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Strip and ensure name contains at least one letter."""
        stripped = v.strip()
        if not re.search(r"[a-zA-Z]", stripped):
            raise ValueError("Full name must contain at least one letter.")
        return stripped

    @field_validator("requirement")
    @classmethod
    def validate_requirement(cls, v: str) -> str:
        return v.strip()

    model_config = {"str_strip_whitespace": True}


# ─────────────────────────────────────────
# Response Schemas
# ─────────────────────────────────────────

class LeadResponse(BaseModel):
    """Schema for returning a lead in API responses."""

    id: str
    full_name: str
    email: str
    phone: str
    company: Optional[str] = None
    requirement: str
    created_at: datetime
    email_sent: bool
    email_opened: bool
    email_opened_at: Optional[datetime] = None
    link_clicked: bool
    link_clicked_at: Optional[datetime] = None
    ai_category: Optional[str] = None
    ai_priority: Optional[str] = None


class LeadCreateResponse(BaseModel):
    """Response returned after successfully creating a lead."""

    success: bool = True
    message: str = "Lead submitted successfully. You will receive an email shortly."
    lead_id: str


class PaginatedLeadsResponse(BaseModel):
    """Paginated leads list with metadata."""

    leads: List[LeadResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ─────────────────────────────────────────
# Dashboard / Analytics Schemas
# ─────────────────────────────────────────

class DailyCount(BaseModel):
    """Single data point for time-series charts."""

    date: str  # ISO date string: "2024-01-15"
    count: int


class DashboardStats(BaseModel):
    """Aggregated analytics for the dashboard."""

    total_leads: int
    emails_sent: int
    emails_opened: int
    open_rate: float  # Percentage 0.0 - 100.0
    links_clicked: int
    click_rate: float  # Percentage 0.0 - 100.0
    leads_per_day: List[DailyCount]
    open_rate_trend: List[DailyCount]
    click_rate_trend: List[DailyCount]


# ─────────────────────────────────────────
# AI Analysis Schemas
# ─────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    """Response from the AI analysis endpoint."""

    analyzed: int
    skipped: int
    message: str


# ─────────────────────────────────────────
# Generic API Response
# ─────────────────────────────────────────

class APIResponse(BaseModel):
    """Generic success/error wrapper."""

    success: bool
    message: str
    data: Optional[dict] = None
