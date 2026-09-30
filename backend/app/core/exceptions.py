from fastapi import HTTPException, status


class HostelBaseException(HTTPException):
    """Base exception for all hostel-specific HTTP errors."""
    pass


class AuthenticationError(HostelBaseException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class AuthorizationError(HostelBaseException):
    def __init__(self, detail: str = "You do not have permission to perform this action"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class NotFoundError(HostelBaseException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found",
        )


class ConflictError(HostelBaseException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ValidationError(HostelBaseException):
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class StorageError(HostelBaseException):
    def __init__(self, detail: str = "File storage operation failed"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


class FloorAccessError(AuthorizationError):
    def __init__(self, detail: str = "You do not have access to this floor's data"):
        super().__init__(detail=detail)


class RoomAccessError(AuthorizationError):
    def __init__(self, detail: str = "You do not have access to manage students in this room"):
        super().__init__(detail=detail)
