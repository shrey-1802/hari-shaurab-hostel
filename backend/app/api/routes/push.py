from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.notification import PushSubscriptionCreate, PushSubscriptionResponse
from app.services.push_notification_service import PushNotificationService
from app.middleware.auth import get_current_user, CurrentUser, get_user_agent
from app.core.config import settings

router = APIRouter(prefix="/push", tags=["Push Notifications"])


@router.get("/vapid-public-key")
async def get_vapid_public_key():
    """Return the VAPID public key so the frontend can subscribe."""
    return {"public_key": settings.VAPID_PUBLIC_KEY}


@router.post("/subscribe")
async def subscribe(
    body: PushSubscriptionCreate,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register a browser push subscription."""
    service = PushNotificationService(db)
    subscription = await service.subscribe(
        user_id=current_user.id,
        endpoint=body.endpoint,
        p256dh=body.p256dh,
        auth=body.auth,
        user_agent=get_user_agent(request),
    )
    return PushSubscriptionResponse.model_validate(subscription)


@router.post("/unsubscribe")
async def unsubscribe(
    body: dict,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a browser push subscription."""
    service = PushNotificationService(db)
    result = await service.unsubscribe(body.get("endpoint", ""))
    return {"message": "Unsubscribed" if result else "Subscription not found"}


@router.post("/test")
async def test_push(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a test push notification to the current user."""
    service = PushNotificationService(db)
    await service.send_to_user(
        user_id=current_user.id,
        title="🔔 Test Notification",
        body="Push notifications are working!",
        data={"type": "test"},
    )
    return {"message": "Test notification sent"}
