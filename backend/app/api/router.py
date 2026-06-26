from fastapi import APIRouter
from app.api.routes import leads, tracking

# Root API router — aggregates all sub-routers
api_router = APIRouter()

api_router.include_router(leads.router)
api_router.include_router(tracking.router)
