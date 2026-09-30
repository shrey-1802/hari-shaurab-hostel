import asyncio
from datetime import date
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from loguru import logger
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.repositories.student_repository import StudentRepository
from app.repositories.birthday_log_repository import BirthdayLogRepository
from app.services.notification_service import NotificationService
from app.services.push_notification_service import PushNotificationService
from app.models.birthday_log import BirthdayLog

scheduler = AsyncIOScheduler()


async def check_birthdays():
    """
    Scheduled task: checks for today's and tomorrow's birthdays,
    creates in-app notifications and sends push notifications.
    Runs every hour. Birthday logs prevent duplicate notifications.
    """
    logger.info("🎂 Birthday scheduler running...")

    async with AsyncSessionLocal() as db:
        try:
            student_repo = StudentRepository(db)
            birthday_log_repo = BirthdayLogRepository(db)
            notification_service = NotificationService(db)
            push_service = PushNotificationService(db)

            today = date.today()

            # --- Check Today's Birthdays ---
            today_students = await student_repo.get_birthdays_today(today)
            for student in today_students:
                already_sent = await birthday_log_repo.exists(
                    student_id=student.id,
                    notification_date=today,
                    notification_type="today",
                )
                if already_sent:
                    continue

                logger.info(f"🎂 Birthday TODAY: {student.full_name}")

                # Create in-app notifications
                notifications = await notification_service.notify_birthday_today(student)

                # Send push notifications
                recipient_ids = [n.recipient_id for n in notifications]
                if recipient_ids:
                    await push_service.send_to_users(
                        user_ids=recipient_ids,
                        title="🎂 Birthday Today!",
                        body=f"Today is {student.full_name}'s birthday! Room {student.room_number}",
                        data={
                            "type": "birthday_today",
                            "student_id": str(student.id),
                        },
                    )

                # Log to prevent duplicates
                log = BirthdayLog(
                    student_id=student.id,
                    notification_date=today,
                    birthday_date=student.date_of_birth,
                    notification_type="today",
                )
                await birthday_log_repo.create(log)

            # --- Check Tomorrow's Birthdays ---
            tomorrow_students = await student_repo.get_birthdays_tomorrow(today)
            for student in tomorrow_students:
                already_sent = await birthday_log_repo.exists(
                    student_id=student.id,
                    notification_date=today,
                    notification_type="tomorrow",
                )
                if already_sent:
                    continue

                logger.info(f"🎂 Birthday TOMORROW: {student.full_name}")

                # Create in-app notifications
                notifications = await notification_service.notify_birthday_tomorrow(student)

                # Send push notifications
                recipient_ids = [n.recipient_id for n in notifications]
                if recipient_ids:
                    await push_service.send_to_users(
                        user_ids=recipient_ids,
                        title="🎂 Birthday Reminder",
                        body=f"{student.full_name}'s birthday is tomorrow. Room {student.room_number}",
                        data={
                            "type": "birthday_tomorrow",
                            "student_id": str(student.id),
                        },
                    )

                # Log to prevent duplicates
                log = BirthdayLog(
                    student_id=student.id,
                    notification_date=today,
                    birthday_date=student.date_of_birth,
                    notification_type="tomorrow",
                )
                await birthday_log_repo.create(log)

            await db.commit()
            logger.info("🎂 Birthday scheduler completed successfully")

        except Exception as e:
            await db.rollback()
            logger.error(f"🎂 Birthday scheduler error: {e}")


def start_scheduler():
    """Start the APScheduler with birthday check job."""
    scheduler.add_job(
        check_birthdays,
        trigger=IntervalTrigger(hours=settings.BIRTHDAY_CHECK_INTERVAL_HOURS),
        id="birthday_check",
        name="Check birthdays every hour",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(f"🕐 Scheduler started — checking birthdays every {settings.BIRTHDAY_CHECK_INTERVAL_HOURS} hour(s)")


def stop_scheduler():
    """Gracefully stop the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("🕐 Scheduler stopped")
