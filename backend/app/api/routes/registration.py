from uuid import UUID
from typing import Optional, List
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.registration import (
    RegistrationLinkInfoResponse,
    StudentSelfRegistrationCreate,
    RegistrationResponse,
    PendingRegistrationListResponse,
    LinkDetailResponse,
)
from app.services.registration_service import RegistrationService
from app.middleware.auth import get_current_user, CurrentUser, get_client_ip

router = APIRouter(tags=["Registration System"])


# ============================================================
# PUBLIC ENDPOINTS (No authentication required)
# ============================================================

@router.get(
    "/registration/{token}",
    response_model=RegistrationLinkInfoResponse,
    summary="Get self-registration link details & room availability",
)
async def get_registration_link_info(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint. Validates token, returns assigned floor, Wing Leader info,
    and live list of available rooms (capacity < 2).
    """
    service = RegistrationService(db)
    return await service.get_link_info(token)


@router.post(
    "/registration/{token}",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit student self-registration form",
)
async def submit_student_self_registration(
    token: str,
    body: StudentSelfRegistrationCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint for students to register using Wing Leader's unique link.
    Auto-assigns floor, validates room capacity < 2, sets status to PENDING,
    and sends notification to assigned Wing Leader.
    """
    service = RegistrationService(db)
    student = await service.create_self_registration(
        token=token,
        data=body.model_dump(),
        ip_address=get_client_ip(request),
    )
    return RegistrationResponse.model_validate(student)


# ============================================================
# PROTECTED LEADER ENDPOINTS (Auth Required)
# ============================================================

@router.get(
    "/registrations/pending",
    response_model=PendingRegistrationListResponse,
    summary="Get pending student self-registrations",
)
async def get_pending_registrations(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Protected endpoint. Main Leaders get all pending registrations.
    Wing Leaders get pending registrations for their assigned link/floor.
    """
    service = RegistrationService(db)
    pending_list = await service.get_pending_registrations(
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
    )
    return {
        "pending_registrations": [RegistrationResponse.model_validate(s) for s in pending_list],
        "total": len(pending_list),
    }


@router.patch(
    "/registrations/{id}/approve",
    response_model=RegistrationResponse,
    summary="Approve pending student registration",
)
async def approve_student_registration(
    id: UUID,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Protected endpoint. Approve student self-registration and make resident active.
    """
    service = RegistrationService(db)
    student = await service.approve_registration(
        student_id=id,
        approver_id=current_user.id,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
        ip_address=get_client_ip(request),
    )
    return RegistrationResponse.model_validate(student)


@router.patch(
    "/registrations/{id}/reject",
    response_model=RegistrationResponse,
    summary="Reject pending student registration",
)
async def reject_student_registration(
    id: UUID,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Protected endpoint. Reject student self-registration request.
    """
    service = RegistrationService(db)
    student = await service.reject_registration(
        student_id=id,
        approver_id=current_user.id,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
        ip_address=get_client_ip(request),
    )
    return RegistrationResponse.model_validate(student)


@router.get(
    "/registration-links",
    summary="Get all Wing Leader registration links",
)
async def get_all_registration_links(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Protected endpoint. View registration links mapped to Wing Leaders.
    """
    service = RegistrationService(db)
    repo = service.repo
    links = await repo.get_all()
    
    origin = "http://localhost:5173"
    result = []
    for l in links:
        result.append({
            "id": l.id,
            "wing_leader_id": l.wing_leader_id,
            "wing_leader_name": l.wing_leader_name,
            "registration_token": l.registration_token,
            "assigned_floor": l.assigned_floor,
            "room_start": l.room_start,
            "room_end": l.room_end,
            "is_active": l.is_active,
            "created_at": l.created_at,
            "shareable_url": f"{origin}/register/{l.registration_token}",
        })
    return result


@router.get(
    "/registration-links/my-link",
    summary="Get logged-in Wing Leader's unique registration link",
)
async def get_my_registration_link(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Protected endpoint for Wing Leader to view and copy their unique registration link.
    """
    service = RegistrationService(db)
    repo = service.repo

    # Match link by user ID or floor & room_start
    link = await repo.get_by_leader_id(current_user.id)
    if not link and current_user.floor_number:
        all_links = await repo.get_all()
        for l in all_links:
            if l.assigned_floor == current_user.floor_number and l.room_start == current_user.room_start:
                link = l
                break

    if not link:
        # Fallback default token mapping based on floor / email
        token_map = {
            4: "wl-a",
            6: "wl-c",
        }
        tok = token_map.get(current_user.floor_number, "wl-a")
        link = await repo.get_by_token(tok)

    origin = "http://localhost:5173"
    if link:
        return {
            "id": link.id,
            "wing_leader_name": link.wing_leader_name,
            "registration_token": link.registration_token,
            "assigned_floor": link.assigned_floor,
            "room_start": link.room_start,
            "room_end": link.room_end,
            "is_active": link.is_active,
            "shareable_url": f"{origin}/register/{link.registration_token}",
        }

    return {
        "registration_token": "wl-a",
        "assigned_floor": current_user.floor_number or 4,
        "shareable_url": f"{origin}/register/wl-a",
    }
