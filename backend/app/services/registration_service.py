from uuid import UUID
from typing import Optional, List, Dict
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student
from app.models.registration_link import RegistrationLink
from app.models.user import User
from app.core.enums import UserRole, AuditAction, NotificationType, RegistrationStatus
from app.core.exceptions import NotFoundError, ConflictError, BadRequestError, FloorAccessError, RoomAccessError
from app.repositories.registration_repository import RegistrationRepository
from app.repositories.student_repository import StudentRepository
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService


class RegistrationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = RegistrationRepository(db)
        self.student_repo = StudentRepository(db)
        self.audit_service = AuditService(db)
        self.notification_service = NotificationService(db)

    async def get_link_info(self, token: str) -> Dict:
        """
        Validate registration token and return assigned floor, leader info,
        and allowed rooms with live capacity & availability info (< 2 capacity).
        """
        link = await self.repo.get_by_token(token)
        if not link:
            raise NotFoundError(f"Registration link with token '{token}' not found or inactive.")

        # Determine range of allowed rooms
        rooms_list = []
        try:
            start_num = int("".join(filter(str.isdigit, link.room_start)))
            end_num = int("".join(filter(str.isdigit, link.room_end)))
            for r in range(start_num, end_num + 1):
                rooms_list.append(str(r))
        except ValueError:
            rooms_list = [link.room_start, link.room_end]

        # Calculate occupancy & availability for each room
        available_rooms = []
        for room_num in rooms_list:
            occupied = await self.repo.count_room_occupancy(link.assigned_floor, room_num)
            available_beds = max(0, 2 - occupied)
            is_available = occupied < 2
            available_rooms.append({
                "room_number": room_num,
                "occupied": occupied,
                "capacity": 2,
                "available_beds": available_beds,
                "is_available": is_available,
            })

        return {
            "registration_token": link.registration_token,
            "assigned_floor": link.assigned_floor,
            "room_start": link.room_start,
            "room_end": link.room_end,
            "wing_leader_name": link.wing_leader_name,
            "is_active": link.is_active,
            "available_rooms": available_rooms,
        }

    async def create_self_registration(
        self,
        token: str,
        data: Dict,
        ip_address: Optional[str] = None,
    ) -> Student:
        """
        Create student self-registration record via shareable Wing Leader link.
        Automatically assigns floor, enforces room capacity < 2, sets status to PENDING,
        notifies Wing Leader, and records audit log.
        """
        link = await self.repo.get_by_token(token)
        if not link:
            raise NotFoundError(f"Registration link '{token}' is invalid or expired.")

        room_num = str(data["room_number"]).strip()

        # Enforce Room Restriction (Rule 3): Room must be within wing leader's assigned rooms
        try:
            r_val = int("".join(filter(str.isdigit, room_num)))
            start_val = int("".join(filter(str.isdigit, link.room_start)))
            end_val = int("".join(filter(str.isdigit, link.room_end)))
            if not (start_val <= r_val <= end_val):
                raise BadRequestError(
                    f"Room {room_num} is outside the allowed range ({link.room_start}–{link.room_end}) for this registration link."
                )
        except ValueError:
            if not (link.room_start <= room_num <= link.room_end):
                raise BadRequestError(
                    f"Room {room_num} is outside the allowed range for this registration link."
                )

        # Enforce Room Capacity Rule (Rule 4 & 5): Max 2 students per room
        current_occupants = await self.repo.count_room_occupancy(link.assigned_floor, room_num)
        if current_occupants >= 2:
            raise ConflictError(
                f"Room {room_num} on Floor {link.assigned_floor} is already full (maximum 2 students allowed per room)."
            )

        # Check duplicate student number
        existing = await self.student_repo.get_by_student_number(data["student_number"])
        if existing:
            raise ConflictError(f"Student number '{data['student_number']}' already registered in the system.")

        # Create student with auto-filled & locked fields
        student = Student(
            full_name=data["full_name"],
            date_of_birth=data["date_of_birth"],
            student_number=data["student_number"],
            student_mobile=data["student_mobile"],
            parent_name=data.get("parent_name"),
            parent_mobile=data.get("parent_mobile"),
            college_name=data.get("college_name"),
            department=data.get("department"),
            semester_result=data.get("semester_result"),
            hobby=data.get("hobby"),
            hostel_friends=data.get("hostel_friends"),
            non_hostel_friends=data.get("non_hostel_friends"),
            floor_number=link.assigned_floor,  # AUTO-ASSIGNED FLOOR (Rule 1 & 2)
            room_number=room_num,
            profile_picture_url=data.get("profile_picture_url"),
            registration_status=RegistrationStatus.PENDING.value,
            registered_via_link=token,
            registration_source="SELF_REGISTRATION",
            created_by=link.wing_leader_id,
        )

        student = await self.student_repo.create(student)

        # Audit log (Rule 10)
        await self.audit_service.log(
            user_id=link.wing_leader_id,
            action=AuditAction.CREATE_STUDENT_REGISTRATION,
            description=f"Student self-registration submitted: {student.full_name} for Room {student.room_number} (Floor {student.floor_number})",
            ip_address=ip_address,
        )

        # Notify Wing Leader (Rule 7)
        if link.wing_leader_id:
            await self.notification_service.create_notification(
                recipient_id=link.wing_leader_id,
                notification_type=NotificationType.STUDENT_REGISTRATION_REQUEST,
                title="New Student Registration Request",
                message=f"Name: {student.full_name} | Room: {student.room_number} (Floor {student.floor_number}) | Status: Pending Approval",
                data=f'{{"student_id": "{student.id}", "student_name": "{student.full_name}", "room_number": "{student.room_number}"}}',
            )

        return student

    async def get_pending_registrations(
        self,
        user_role: str,
        user_floor: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> List[Student]:
        """
        Get pending registrations. Main leaders see all; Wing leaders see only their link/assigned rooms. (Rule 8 & 9)
        """
        if user_role in [UserRole.MAIN_LEADER.value, UserRole.MAIN_LEADER]:
            return await self.repo.get_pending_registrations()
        
        return await self.repo.get_pending_registrations(
            floor_restriction=user_floor,
            room_start=room_start,
            room_end=room_end,
        )

    async def approve_registration(
        self,
        student_id: UUID,
        approver_id: UUID,
        user_role: str,
        user_floor: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Student:
        """
        Approve a pending student self-registration. (Rule 6)
        """
        student = await self.student_repo.get_by_id(student_id)
        if not student:
            raise NotFoundError("Student registration")

        if student.registration_status == RegistrationStatus.APPROVED.value:
            return student

        # Verify access permission for Wing Leader
        if user_role not in [UserRole.MAIN_LEADER.value, UserRole.MAIN_LEADER]:
            if user_floor is not None and student.floor_number != user_floor:
                raise FloorAccessError(f"Access denied: You only manage Floor {user_floor}")

        # Check room capacity rule again before approval
        occupants = await self.repo.count_room_occupancy(student.floor_number, student.room_number)
        # Exclude this student if already counted
        if student.registration_status != RegistrationStatus.PENDING.value and occupants >= 2:
            raise ConflictError(f"Cannot approve: Room {student.room_number} has reached maximum capacity of 2 students.")

        student.registration_status = RegistrationStatus.APPROVED.value
        student.approved_by = approver_id
        student.approved_at = datetime.now(timezone.utc)

        student = await self.student_repo.update(student)

        # Log action (Rule 10)
        await self.audit_service.log(
            user_id=approver_id,
            action=AuditAction.APPROVE_STUDENT,
            description=f"Approved self-registration for {student.full_name} (Room {student.room_number})",
            ip_address=ip_address,
        )

        return student

    async def reject_registration(
        self,
        student_id: UUID,
        approver_id: UUID,
        user_role: str,
        user_floor: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Student:
        """
        Reject a pending student self-registration.
        """
        student = await self.student_repo.get_by_id(student_id)
        if not student:
            raise NotFoundError("Student registration")

        # Verify access permission
        if user_role not in [UserRole.MAIN_LEADER.value, UserRole.MAIN_LEADER]:
            if user_floor is not None and student.floor_number != user_floor:
                raise FloorAccessError(f"Access denied: You only manage Floor {user_floor}")

        student.registration_status = RegistrationStatus.REJECTED.value
        student.approved_by = approver_id
        student.approved_at = datetime.now(timezone.utc)

        student = await self.student_repo.update(student)

        # Log action (Rule 10)
        await self.audit_service.log(
            user_id=approver_id,
            action=AuditAction.REJECT_STUDENT,
            description=f"Rejected self-registration for {student.full_name} (Room {student.room_number})",
            ip_address=ip_address,
        )

        return student

    async def get_all_links() -> List[RegistrationLink]:
        """List all registration links."""
        return await self.repo.get_all()
