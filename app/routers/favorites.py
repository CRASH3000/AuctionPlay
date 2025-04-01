from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import literal
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.routers.auth import get_current_user
from db.models import Post, Favorite
from db.db import get_session

router = APIRouter()


@router.post("/favorites", summary="Добавить пост в избранное")
async def add_to_favorites(
    post_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Post).where(Post.id == literal(post_id)))
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail="Пост не найден")
    result = await session.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id, Favorite.post_id == literal(post_id)
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return {"status": "ok", "message": "Пост уже в избранном"}
    favorite = Favorite(user_id=current_user.id, post_id=post_id)
    session.add(favorite)
    await session.commit()
    return {"status": "ok"}
