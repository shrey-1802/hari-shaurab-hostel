import io
import uuid
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import ValidationError, StorageError
from app.db.supabase_client import get_supabase_client
from loguru import logger


class StorageService:
    """Handles profile image uploads to Supabase Storage."""

    BUCKET = settings.SUPABASE_STORAGE_BUCKET
    MAX_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024  # bytes

    async def upload_profile_image(self, file: UploadFile, student_id: str) -> dict:
        """
        Upload a student's profile picture to Supabase Storage.
        Returns the public URL and storage path.
        """
        # Validate content type
        if file.content_type not in settings.allowed_image_types_list:
            raise ValidationError(
                f"Invalid image type: {file.content_type}. "
                f"Allowed: {', '.join(settings.allowed_image_types_list)}"
            )

        # Read and validate size
        content = await file.read()
        if len(content) > self.MAX_SIZE:
            raise ValidationError(
                f"File size exceeds maximum of {settings.MAX_UPLOAD_SIZE_MB}MB"
            )

        # Generate unique filename
        ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
        filename = f"{student_id}/{uuid.uuid4().hex}.{ext}"

        try:
            client = get_supabase_client()
            # Upload to Supabase Storage
            client.storage.from_(self.BUCKET).upload(
                path=filename,
                file=content,
                file_options={"content-type": file.content_type},
            )

            # Get public URL
            public_url = client.storage.from_(self.BUCKET).get_public_url(filename)

            return {
                "url": public_url,
                "path": filename,
            }
        except Exception as e:
            logger.error(f"Failed to upload image: {e}")
            raise StorageError(f"Failed to upload image: {str(e)}")

    async def delete_profile_image(self, path: str) -> bool:
        """Delete a profile image from Supabase Storage."""
        try:
            client = get_supabase_client()
            client.storage.from_(self.BUCKET).remove([path])
            return True
        except Exception as e:
            logger.error(f"Failed to delete image: {e}")
            return False
