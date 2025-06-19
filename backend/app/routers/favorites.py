from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import literal
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.routers.auth import get_current_user
from backend.db.models import Post, Favorite
from backend.db.db import get_session

router = APIRouter()


@router.post("/favorites/{post_id}", summary="Добавить пост в избранное")
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


@router.delete("/favorites/{post_id}", summary="Удалить пост из избранного")
async def remove_from_favorites(
    post_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.post_id == literal(post_id),
        )
    )
    fav = result.scalar_one_or_none()
    if not fav:
        raise HTTPException(status_code=404, detail="Пост не в избранном")
    await session.delete(fav)
    await session.commit()
