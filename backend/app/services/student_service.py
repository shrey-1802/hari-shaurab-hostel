import math
from uuid import UUID
from typing import Optional, Tuple, List
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.student import Student
from app.core.enums import UserRole, AuditAction, NotificationType
from app.core.exceptions import NotFoundError, ConflictError, FloorAccessError, RoomAccessError
from app.repositories.student_repository import StudentRepository
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService


class StudentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = StudentRepository(db)
        self.audit_service = AuditService(db)
        self.notification_service = NotificationService(db)

    def _check_access(
        self,
        student_floor: int,
        student_room: str,
        user_role: str,
        user_floor: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ):
        """Raise error if a Wing Leader cannot access the given floor/room."""
        if user_role == UserRole.MAIN_LEADER.value or user_role == UserRole.MAIN_LEADER:
            return

        # Check floor restriction
        if user_floor is not None and student_floor != user_floor:
            raise FloorAccessError(f"Access denied: You only have access to Floor {user_floor}")

        # Check room range restriction (e.g. 401..409 vs 410..418)
        if room_start and room_end and student_room:
            try:
                s_room_num = int("".join(filter(str.isdigit, student_room)))
                r_start_num = int("".join(filter(str.isdigit, room_start)))
                r_end_num = int("".join(filter(str.isdigit, room_end)))
                if not (r_start_num <= s_room_num <= r_end_num):
                    raise RoomAccessError(
                        f"Access denied: You are assigned to rooms {room_start}–{room_end} on Floor {user_floor}"
                    )
            except ValueError:
                if not (room_start <= student_room <= room_end):
                    raise RoomAccessError(
                        f"Access denied: You are assigned to rooms {room_start}–{room_end} on Floor {user_floor}"
                    )

    async def create_student(
        self,
        data: dict,
        user_id: UUID,
        user_role: str,
        user_floor: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Student:
        """Create a new student with floor and room range validation and max 2 capacity check."""
        self._check_access(
            student_floor=data["floor_number"],
            student_room=data["room_number"],
            user_role=user_role,
            user_floor=user_floor,
            room_start=room_start,
            room_end=room_end,
        )

        # Check duplicate student number
        existing = await self.repo.get_by_student_number(data["student_number"])
        if existing:
            raise ConflictError(f"Student number {data['student_number']} already exists")

        # Check room capacity (maximum 2 students per room)
        current_occupants = await self.repo.count_students_in_room(
            floor_number=data["floor_number"],
            room_number=data["room_number"],
        )
        if current_occupants >= 2:
            raise ConflictError(
                f"Room {data['room_number']} on Floor {data['floor_number']} is at full capacity (maximum 2 students allowed per room)."
            )

        student = Student(**data, created_by=user_id)
        student = await self.repo.create(student)

        # Log the action
        await self.audit_service.log(
            user_id=user_id,
            action=AuditAction.CREATE_STUDENT,
            description=f"Created student: {student.full_name} (Room {student.room_number}, Floor {student.floor_number})",
            ip_address=ip_address,
        )

        # Send notification
        await self.notification_service.notify_new_student(student, user_id)

        return student

    async def get_student(
        self,
        student_id: UUID,
        user_role: str,
        user_floor: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> Student:
        """Get a single student by ID, enforcing floor and room scope."""
        student = await self.repo.get_by_id(student_id)
        if not student:
            raise NotFoundError("Student")

        self._check_access(
            student_floor=student.floor_number,
            student_room=student.room_number,
            user_role=user_role,
            user_floor=user_floor,
            room_start=room_start,
            room_end=room_end,
        )
        return student

    async def update_student(
        self,
        student_id: UUID,
        data: dict,
        user_id: UUID,
        user_role: str,
        user_floor: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Student:
        """Update a student, enforcing floor and room scope on current and new room/floor and capacity <= 2."""
        student = await self.repo.get_by_id(student_id)
        if not student:
            raise NotFoundError("Student")

        # Check access to current student
        self._check_access(
            student_floor=student.floor_number,
            student_room=student.room_number,
            user_role=user_role,
            user_floor=user_floor,
            room_start=room_start,
            room_end=room_end,
        )

        # If changing floor or room, check access to the target room/floor too
        new_floor = data.get("floor_number", student.floor_number)
        new_room = data.get("room_number", student.room_number)
        if new_floor != student.floor_number or new_room != student.room_number:
            self._check_access(
                student_floor=new_floor,
                student_room=new_room,
                user_role=user_role,
                user_floor=user_floor,
                room_start=room_start,
                room_end=room_end,
            )

            # Check capacity in destination room
            current_occupants = await self.repo.count_students_in_room(
                floor_number=new_floor,
                room_number=new_room,
                exclude_student_id=student.id,
            )
            if current_occupants >= 2:
                raise ConflictError(
                    f"Room {new_room} on Floor {new_floor} is at full capacity (maximum 2 students allowed per room)."
                )

        # Apply updates
        for key, value in data.items():
            if value is not None:
                setattr(student, key, value)

        student = await self.repo.update(student)

        await self.audit_service.log(
            user_id=user_id,
            action=AuditAction.UPDATE_STUDENT,
            description=f"Updated student: {student.full_name} (Room {student.room_number})",
            ip_address=ip_address,
        )

        return student

    async def get_room_occupancies(self, floor_number: Optional[int] = None) -> dict:
        """Get current room occupancies (max capacity 2 per room)."""
        return await self.repo.get_room_occupancies(floor_number)

    async def delete_student(
        self,
        student_id: UUID,
        user_id: UUID,
        user_role: str,
        user_floor: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> dict:
        """Delete a student, enforcing floor and room scope."""
        student = await self.repo.get_by_id(student_id)
        if not student:
            raise NotFoundError("Student")

        self._check_access(
            student_floor=student.floor_number,
            student_room=student.room_number,
            user_role=user_role,
            user_floor=user_floor,
            room_start=room_start,
            room_end=room_end,
        )

        student_name = student.full_name
        await self.repo.delete(student)

        await self.audit_service.log(
            user_id=user_id,
            action=AuditAction.DELETE_STUDENT,
            description=f"Deleted student: {student_name}",
            ip_address=ip_address,
        )

        return {"message": f"Student '{student_name}' deleted successfully"}

    async def search_students(
        self,
        search: Optional[str] = None,
        floor: Optional[int] = None,
        department: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        user_role: str = "MAIN_LEADER",
        user_floor: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> dict:
        """Search students with pagination and floor/room access control."""
        floor_restriction = user_floor if user_role == UserRole.WING_LEADER.value or user_role == UserRole.WING_LEADER else None
        r_start = room_start if floor_restriction is not None else None
        r_end = room_end if floor_restriction is not None else None

        # If wing leader explicitly filters by an unauthorized floor
        if floor_restriction is not None and floor is not None and floor != floor_restriction:
            raise FloorAccessError(f"Access denied: You only have access to Floor {floor_restriction}")

        students, total = await self.repo.search(
            search=search,
            floor=floor,
            department=department,
            page=page,
            page_size=page_size,
            floor_restriction=floor_restriction,
            room_start=r_start,
            room_end=r_end,
        )

        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return {
            "students": students,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }
