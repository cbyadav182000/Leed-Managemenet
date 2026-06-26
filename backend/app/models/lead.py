from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class LeadDocument(BaseModel):
    """
    Represents the full Lead document as stored in MongoDB.
    Uses string id to handle MongoDB ObjectId serialization.
    """

    id: Optional[str] = Field(None, alias="_id")
    full_name: str
    email: EmailStr
    phone: str
    company: Optional[str] = None
    requirement: str

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Email tracking
    email_sent: bool = False
    email_sent_at: Optional[datetime] = None

    # Open tracking
    email_opened: bool = False
    email_opened_at: Optional[datetime] = None

    # Click tracking
    link_clicked: bool = False
    link_clicked_at: Optional[datetime] = None

    # Tracking tokens (UUID-based, unique per lead)
    tracking_token: Optional[str] = None
    click_token: Optional[str] = None

    # AI Classification
    ai_category: Optional[str] = None
    ai_priority: Optional[str] = None
    ai_analyzed_at: Optional[datetime] = None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }
