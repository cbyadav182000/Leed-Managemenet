import logging
from typing import Optional, Tuple

from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Valid AI classification categories
VALID_CATEGORIES = [
    "AI Automation",
    "Web Development",
    "Mobile App",
    "Data Analytics",
    "Machine Learning",
    "Other",
]

# Valid priority levels
VALID_PRIORITIES = ["High", "Medium", "Low"]


class AIService:
    """
    Service for AI-powered lead classification using Google Gemini.
    Gracefully degrades to rule-based classification when API key is not set.
    """

    def __init__(self):
        self._gemini_available = self._init_gemini()

    def _init_gemini(self) -> bool:
        """Initialize the Gemini client if API key is available."""
        try:
            import google.generativeai as genai

            if settings.GEMINI_API_KEY:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self._model = genai.GenerativeModel("gemini-1.5-flash")
                logger.info("Gemini AI client initialized successfully.")
                return True
            else:
                logger.warning("GEMINI_API_KEY not set — using rule-based classification.")
                return False
        except ImportError:
            logger.warning("google-generativeai not installed — using rule-based fallback.")
            return False

    async def classify_lead(
        self, full_name: str, requirement: str, company: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Classify a lead's requirement into a category and priority.

        Returns:
            Tuple of (category, priority) strings.
        """
        if self._gemini_available:
            return await self._classify_with_gemini(full_name, requirement, company)
        else:
            return self._classify_with_rules(requirement)

    async def _classify_with_gemini(
        self, full_name: str, requirement: str, company: Optional[str]
    ) -> Tuple[str, str]:
        """Use Gemini Flash to classify the lead."""
        try:
            prompt = f"""You are a lead classification system for a software development agency.

Analyze the following lead requirement and classify it:

Lead Name: {full_name}
Company: {company or 'Not provided'}
Requirement: {requirement}

Respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{{"category": "<category>", "priority": "<priority>"}}

Valid categories: {', '.join(VALID_CATEGORIES)}
Valid priorities: {', '.join(VALID_PRIORITIES)}

Priority guidelines:
- High: urgent timeline, large budget signals, enterprise company, complex system
- Medium: standard project, moderate scope
- Low: exploratory inquiry, small/simple project, vague requirement

Category guidelines:
- AI Automation: mentions AI, automation, bots, ChatGPT, LLM, agents
- Web Development: website, web app, portal, e-commerce, CMS
- Mobile App: iOS, Android, React Native, Flutter, mobile
- Data Analytics: dashboard, analytics, reporting, BI, data visualization
- Machine Learning: ML, model training, prediction, computer vision, NLP
- Other: anything that doesn't clearly fit above"""

            response = self._model.generate_content(prompt)
            text = response.text.strip()

            # Parse JSON response
            import json
            # Remove potential markdown code fences
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            data = json.loads(text)
            category = data.get("category", "Other")
            priority = data.get("priority", "Medium")

            # Validate against allowed values
            if category not in VALID_CATEGORIES:
                category = "Other"
            if priority not in VALID_PRIORITIES:
                priority = "Medium"

            logger.info(f"Gemini classified lead: category={category}, priority={priority}")
            return category, priority

        except Exception as e:
            logger.error(f"Gemini classification failed: {e}. Falling back to rules.")
            return self._classify_with_rules(requirement)

    def _classify_with_rules(self, requirement: str) -> Tuple[str, str]:
        """
        Keyword-based rule classification when Gemini is unavailable.
        Simple but effective for basic classification.
        """
        req_lower = requirement.lower()

        # Category classification
        if any(k in req_lower for k in ["ai", "automation", "bot", "chatgpt", "llm", "agent", "gpt", "openai"]):
            category = "AI Automation"
        elif any(k in req_lower for k in ["machine learning", "ml ", "prediction", "model", "train", "computer vision", "nlp"]):
            category = "Machine Learning"
        elif any(k in req_lower for k in ["mobile", "ios", "android", "react native", "flutter", "app store"]):
            category = "Mobile App"
        elif any(k in req_lower for k in ["analytics", "dashboard", "report", "bi ", "visualization", "chart", "data"]):
            category = "Data Analytics"
        elif any(k in req_lower for k in ["website", "web", "portal", "e-commerce", "ecommerce", "cms", "landing"]):
            category = "Web Development"
        else:
            category = "Other"

        # Priority classification based on requirement length and keywords
        high_signals = ["urgent", "asap", "immediate", "enterprise", "large scale", "critical", "production"]
        low_signals = ["exploring", "just looking", "small", "simple", "basic", "idea"]

        if any(k in req_lower for k in high_signals) or len(requirement) > 500:
            priority = "High"
        elif any(k in req_lower for k in low_signals) or len(requirement) < 50:
            priority = "Low"
        else:
            priority = "Medium"

        return category, priority


# Singleton instance
ai_service = AIService()
