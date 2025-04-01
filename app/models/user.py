from typing import Optional


class User:
    def __init__(
        self,
        id: int,
        username: str,
        email: str,
        telegram_username: str,
        hashed_password: str,
        jwt_access: Optional[str] = None,
        jwt_request: Optional[str] = None,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
        role: str = "admin",
        avatar: str = "/avatars/default.png",
        firstname: str = "",
        lastname: str = "",
    ):
        self.id = id
        self.username = username
        self.email = email
        self.telegram_username = telegram_username
        self.hashed_password = hashed_password
        self.jwt_access = jwt_access
        self.jwt_request = jwt_request
        self.created_at = created_at
        self.updated_at = updated_at
        self.role = role
        self.avatar = avatar
        self.firstname = firstname
        self.lastname = lastname
