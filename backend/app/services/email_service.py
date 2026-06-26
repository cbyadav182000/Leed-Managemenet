import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Path to email templates directory
TEMPLATES_DIR = Path(__file__).parent / "templates"

# Jinja2 environment for rendering email templates
jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


class EmailService:
    """
    Service for sending transactional emails.
    Primary: Resend API
    Fallback: SMTP via smtplib (when Resend key is not set)
    """

    def __init__(self):
        self._resend_available = self._check_resend()

    def _check_resend(self) -> bool:
        """Check if Resend API key is configured and import the package."""
        try:
            import resend
            if settings.RESEND_API_KEY and not settings.RESEND_API_KEY.startswith("re_placeholder"):
                resend.api_key = settings.RESEND_API_KEY
                return True
            logger.warning("Resend API key not configured — emails will be logged only.")
            return False
        except ImportError:
            logger.warning("resend package not installed — emails will be logged only.")
            return False

    def _render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """Render a Jinja2 HTML template with the given context."""
        template = jinja_env.get_template(template_name)
        return template.render(**context)

    async def send_welcome_email(
        self,
        lead_id: str,
        to_email: str,
        full_name: str,
        requirement: str,
        tracking_token: str,
        click_token: str,
    ) -> bool:
        """
        Send a personalized welcome email to a new lead.

        Args:
            lead_id: MongoDB _id of the lead
            to_email: Recipient email address
            full_name: Lead's full name (used in greeting)
            requirement: Lead's project requirement
            tracking_token: UUID for open tracking pixel
            click_token: UUID for CTA link click tracking

        Returns:
            True if email was sent successfully, False otherwise.
        """
        tracking_pixel_url = f"{settings.API_BASE_URL}/api/open/{tracking_token}"
        click_url = f"{settings.API_BASE_URL}/api/click/{click_token}"

        html_content = self._render_template(
            "welcome.html",
            {
                "full_name": full_name,
                "requirement": requirement,
                "tracking_pixel_url": tracking_pixel_url,
                "click_url": click_url,
            },
        )

        subject = f"Thank you for reaching out, {full_name.split()[0]}! 🚀"

        if self._resend_available:
            return await self._send_via_resend(to_email, subject, html_content)
        else:
            # Development fallback: log email content
            logger.info(
                f"[EMAIL MOCK] To: {to_email} | Subject: {subject}\n"
                f"Tracking URL: {tracking_pixel_url}\n"
                f"Click URL: {click_url}"
            )
            return True  # Return True in dev mode so flow continues

    async def _send_via_resend(
        self, to_email: str, subject: str, html_content: str
    ) -> bool:
        """Send email using the Resend API."""
        try:
            import resend

            params: resend.Emails.SendParams = {
                "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            response = resend.Emails.send(params)
            logger.info(f"Email sent via Resend. ID: {response.get('id', 'unknown')}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email via Resend: {e}")
            return False


# Singleton instance
email_service = EmailService()
