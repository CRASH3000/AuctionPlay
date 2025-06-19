from typing import List, Dict
from pydantic import BaseModel
from backend.app.schemas.post import PostResponse


class PublicProfileUser(BaseModel):
    id: int
    username: str
    avatar: str
    telegram_username: str
    role: str

    class Config:
        from_attributes = True


class PublicProfileResponse(BaseModel):
    status: str
    user: PublicProfileUser
    posts: Dict[str, List[PostResponse]]

    class Config:
        from_attributes = True
