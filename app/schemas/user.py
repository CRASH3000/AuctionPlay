from pydantic import BaseModel, EmailStr


class RegistrationRequest(BaseModel):
    username: str
    firstname: str = ""
    lastname: str = ""
    email: EmailStr
    telegram_username: str
    password: str


class AuthRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    firstname: str = ""
    lastname: str = ""
    email: EmailStr
    telegram_username: str
    avatar: str
    created_at: str
    updated_at: str


class ProfileUpdateRequest(BaseModel):
    username: str
    telegram_username: str
    email: EmailStr
    firstname: str = ""
    lastname: str = ""


class SetAvatarRequest(BaseModel):
    user: int
    image: str  # BASE64 строка или другой формат, как заглушка


class UserSetAvatarRequest(BaseModel):
    image: str


class RoleUpdateRequest(BaseModel):
    role: str


class AuthorResponse(BaseModel):
    id: int
    username: str
    avatar: str
    telegram_username: str