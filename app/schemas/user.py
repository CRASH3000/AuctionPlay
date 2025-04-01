from fastapi import Form
from pydantic import BaseModel, EmailStr


class RegistrationRequest(BaseModel):
    username: str
    firstname: str = ""
    lastname: str = ""
    email: EmailStr
    telegram_username: str
    password: str

    @classmethod
    def as_form(
            cls,
            username: str = Form(),
            firstname: str = Form(""),
            lastname: str = Form(""),
            email: EmailStr = Form(),
            telegram_username: str = Form(),
            password: str = Form(),
    ):
        return cls(
            username=username,
            firstname=firstname,
            lastname=lastname,
            email=email,
            telegram_username=telegram_username,
            password=password,
        )


class AuthRequest(BaseModel):
    username: str
    password: str

    @classmethod
    def as_form(
            cls,
            username: str = Form(),
            password: str = Form(),
    ):
        return cls(username=username, password=password)


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

    @classmethod
    def as_form(
            cls,
            username: str = Form(),
            telegram_username: str = Form(),
            email: EmailStr = Form(),
            firstname: str = Form(""),
            lastname: str = Form(""),
    ):
        return cls(
            username=username,
            telegram_username=telegram_username,
            email=email,
            firstname=firstname,
            lastname=lastname,
        )


class SetAvatarRequest(BaseModel):
    user: int
    image: str

    @classmethod
    def as_form(
            cls,
            user: int = Form(),
            image: str = Form(),
    ):
        return cls(user=user, image=image)


class UserSetAvatarRequest(BaseModel):
    image: str

    @classmethod
    def as_form(
            cls,
            image: str = Form(),
    ):
        return cls(image=image)


class RoleUpdateRequest(BaseModel):
    role: str

    @classmethod
    def as_form(
            cls,
            role: str = Form(),
    ):
        return cls(role=role)


class AuthorResponse(BaseModel):
    id: int
    username: str
    avatar: str
    telegram_username: str
