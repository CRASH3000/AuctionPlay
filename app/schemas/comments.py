from pydantic import BaseModel
from typing import Optional
from app.schemas.user import AuthorResponse


class CommentCreate(BaseModel):
    post_id: int
    price: float


class CommentResponse(BaseModel):
    id: int
    post_id: int
    price: Optional[int] = None
    created_at: str
    author: Optional[AuthorResponse] = None
