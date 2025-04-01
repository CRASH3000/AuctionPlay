from pydantic import BaseModel
from typing import Optional
from app.schemas.user import AuthorResponse
from fastapi import Form


class CommentCreate(BaseModel):
    post_id: int
    price: float

    @classmethod
    def as_form(
        cls,
        post_id: int = Form(),
        price: int = Form(),
    ):
        return cls(post_id=post_id, price=price)


class CommentResponse(BaseModel):
    id: int
    post_id: int
    price: Optional[int] = None
    created_at: str
    author: Optional[AuthorResponse] = None
