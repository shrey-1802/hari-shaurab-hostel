from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Request, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentListResponse
from app.services.student_service import StudentService
from app.services.storage_service import StorageService
from app.middleware.auth import get_current_user, CurrentUser, get_client_ip

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("")
async def list_students(
    search: Optional[str] = Query(None, description="Search by name, room, or student number"),
    floor: Optional[int] = Query(None, description="Filter by floor number"),
    department: Optional[str] = Query(None, description="Filter by department"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List students with search, filtering, and pagination. Floor & room restricted for wing leaders."""
    service = StudentService(db)
    result = await service.search_students(
        search=search,
        floor=floor,
        department=department,
        page=page,
        page_size=page_size,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
    )
    return result


@router.get("/rooms/occupancy")
async def get_room_occupancies(
    floor: Optional[int] = Query(None, description="Optional floor filter"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get live room occupancy data (max 2 capacity per room)."""
    service = StudentService(db)
    # If wing leader, force their assigned floor
    target_floor = current_user.floor_number if current_user.floor_number is not None else floor
    return await service.get_room_occupancies(target_floor)


@router.get("/{student_id}")
async def get_student(
    student_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single student by ID."""
    service = StudentService(db)
    student = await service.get_student(
        student_id=student_id,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
    )
    return StudentResponse.model_validate(student)


@router.post("", status_code=201)
async def create_student(
    body: StudentCreate,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new student profile."""
    service = StudentService(db)
    student = await service.create_student(
        data=body.model_dump(),
        user_id=current_user.id,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
        ip_address=get_client_ip(request),
    )
    return StudentResponse.model_validate(student)


@router.put("/{student_id}")
async def update_student(
    student_id: UUID,
    body: StudentUpdate,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a student profile."""
    service = StudentService(db)
    student = await service.update_student(
        student_id=student_id,
        data=body.model_dump(exclude_unset=True),
        user_id=current_user.id,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
        ip_address=get_client_ip(request),
    )
    return StudentResponse.model_validate(student)


@router.delete("/{student_id}")
async def delete_student(
    student_id: UUID,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a student profile."""
    service = StudentService(db)
    return await service.delete_student(
        student_id=student_id,
        user_id=current_user.id,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
        ip_address=get_client_ip(request),
    )


@router.post("/{student_id}/photo")
async def upload_student_photo(
    student_id: UUID,
    photo: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload or update a student's profile photo."""
    # Ensure current user has permission for this student
    student_service = StudentService(db)
    student = await student_service.get_student(
        student_id=student_id,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
    )

    storage = StorageService()
    file_bytes = await photo.read()
    public_url, storage_path = await storage.upload_student_photo(
        file_bytes=file_bytes,
        filename=photo.filename or "photo.jpg",
        content_type=photo.content_type or "image/jpeg",
        student_id=student_id,
    )

    updated_student = await student_service.update_student(
        student_id=student_id,
        data={
            "profile_picture_url": public_url,
            "profile_picture_path": storage_path,
        },
        user_id=current_user.id,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
    )

    return {"profile_picture_url": public_url}
