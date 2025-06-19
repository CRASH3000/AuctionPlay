from pydantic import BaseModel
from typing import Optional
from backend.app.schemas.user import AuthorResponse
from datetime import datetime
from fastapi import Form, UploadFile, File


class PostCreate(BaseModel):
    title: str
    text: str
    cover: UploadFile
    price: float
    duration: str  # допустимые значения: "24h", "3d", "5d"

    @classmethod
    def as_form(
        cls,
        title: str = Form(),
        text: str = Form(),
        cover: UploadFile = File(...),
        price: int = Form(),
        duration: str = Form(),
    ):
        return cls(title=title, text=text, cover=cover, price=price, duration=duration)


class PostResponse(BaseModel):
    id: int
    title: str
    text: str
    cover: str
    price: int
    author: AuthorResponse
    created_at: datetime
    time_until_locked: datetime
    finished_at: Optional[datetime] = None
    active: bool
    winner: Optional[AuthorResponse] = None
    bids_count: int = 0

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.strftime("%Y-%m-%d %H:%M:%S")}
