from fastapi import APIRouter
from app.api.routes import auth, students, birthdays, notifications, dashboard, push, registration

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(students.router)
api_router.include_router(birthdays.router)
api_router.include_router(notifications.router)
api_router.include_router(dashboard.router)
api_router.include_router(push.router)
api_router.include_router(registration.router)
