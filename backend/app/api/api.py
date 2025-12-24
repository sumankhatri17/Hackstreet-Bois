"""
API router configuration
"""
from fastapi import APIRouter
from app.api.routes import auth, users, assessments, schools, progress

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(schools.router, prefix="/schools", tags=["schools"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
