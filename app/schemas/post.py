from pydantic import BaseModel
from typing import Optional
from app.schemas.user import AuthorResponse


class PostCreate(BaseModel):
    title: str
    text: str
    cover: str
    price: float
    duration: str  # допустимые значения: "24h", "3d", "5d"


class PostResponse(BaseModel):
    id: int
    title: str
    text: str
    cover: str
    author: AuthorResponse
    created_at: str
    time_until_locked: str
    active: bool
    winner: Optional[int] = None


