import jwt
from datetime import datetime, timedelta, UTC
from app.core.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_tokens(user_id: int, username: str):
    access_payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    refresh_payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.now(UTC) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    }
    access_token = jwt.encode(access_payload, SECRET_KEY, ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, ALGORITHM)
    return access_token, refresh_token


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
