import base64
import logging
from fastapi import APIRouter, Depends
from fastapi.responses import Response, RedirectResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.connection import get_database
from app.services.lead_service import LeadService
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api", tags=["Tracking"])

# 1×1 transparent GIF pixel (base64 encoded)
TRACKING_PIXEL_BYTES = base64.b64decode(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
)


def get_lead_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> LeadService:
    return LeadService(db)


# ─────────────────────────────────────────
# GET /api/open/{tracking_token} — Email open pixel
# ─────────────────────────────────────────

@router.get(
    "/open/{tracking_token}",
    summary="Email open tracking pixel",
    description=(
        "Serves a 1×1 transparent GIF. When loaded in an email, "
        "records the open event for the lead associated with this token."
    ),
    response_class=Response,
)
async def track_email_open(
    tracking_token: str,
    service: LeadService = Depends(get_lead_service),
):
    # Process the open event in the background (don't block pixel delivery)
    try:
        await service.handle_email_open(tracking_token)
    except Exception as e:
        # Never fail — always return the pixel regardless
        logger.error(f"Error processing open event for token {tracking_token}: {e}")

    return Response(
        content=TRACKING_PIXEL_BYTES,
        media_type="image/gif",
        headers={
            # Prevent caching so every email load triggers the pixel
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )


# ─────────────────────────────────────────
# GET /api/click/{click_token} — Link click tracker
# ─────────────────────────────────────────

@router.get(
    "/click/{click_token}",
    summary="Link click tracker",
    description=(
        "Records the link click event for the lead associated with this token, "
        "then redirects to the configured destination URL."
    ),
)
async def track_link_click(
    click_token: str,
    service: LeadService = Depends(get_lead_service),
):
    try:
        await service.handle_link_click(click_token)
    except Exception as e:
        logger.error(f"Error processing click event for token {click_token}: {e}")

    # Always redirect regardless of tracking success
    return RedirectResponse(
        url=settings.CLICK_REDIRECT_URL,
        status_code=302,
    )
