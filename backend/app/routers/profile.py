from typing import List

from sqlalchemy import delete, update
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone

from sqlalchemy import literal, func
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.schemas.user import (
    UserResponse,
    ProfileUpdateRequest,
    UserSetAvatarRequest,
)
from backend.app.schemas.profile import PublicProfileResponse
from backend.app.schemas.post import PostResponse
from backend.db.models import User, Post, Favorite, Role, Comment
from backend.app.routers.auth import get_current_user
from backend.db.db import get_session

router = APIRouter()


@router.get(
    "/profile/me", response_model=UserResponse, summary="Получение информации о себе"
)
async def get_profile_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        firstname=current_user.firstname,
        lastname=current_user.lastname,
        email=current_user.email,
        telegram_username=current_user.telegram_username,
        avatar=current_user.avatar,
        created_at=(
            current_user.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if current_user.created_at
            else ""
        ),
        updated_at=(
            current_user.updated_at.strftime("%Y-%m-%d %H:%M:%S")
            if current_user.updated_at
            else ""
        ),
    )


@router.patch("/profile/update", summary="Редактирование профиля")
async def update_profile(
        update_req: ProfileUpdateRequest = Depends(ProfileUpdateRequest.as_form),
        current_user: User = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
):
    current_user.username = update_req.username
    current_user.telegram_username = update_req.telegram_username
    current_user.email = update_req.email
    current_user.firstname = update_req.firstname
    current_user.lastname = update_req.lastname
    current_user.updated_at = datetime.now(timezone.utc)
    session.add(current_user)
    await session.commit()
    return {"status": "ok", "message": "Profile updated"}


@router.post("/profile/avatar", summary="Обновление аватара профиля")
async def update_avatar(
        avatar_req: UserSetAvatarRequest = Depends(UserSetAvatarRequest.as_form),
        current_user: User = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
):
    current_user.avatar = avatar_req.image
    session.add(current_user)
    await session.commit()
    return {"status": "ok", "avatar": current_user.avatar}


@router.get(
    "/profile/{user_id}", summary="Получение публичного профиля", response_model=PublicProfileResponse
)
async def get_public_profile(
        user_id: int,
        session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(User)
        .options(selectinload(User.role))
        .where(User.id == literal(user_id))
    )
    target = result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    public_profile = {
        "id": target.id,
        "username": target.username,
        "avatar": target.avatar,
        "telegram_username": target.telegram_username,
        "role": target.role.name,
    }

    result = await session.execute(
        select(Post)
        .options(selectinload(Post.author), selectinload(Post.winner))
        .where(Post.author_id == literal(user_id))
    )
    all_posts: List[Post] = result.scalars().all()

    # разбиваем на active/archived
    active_posts = [p for p in all_posts if p.active]
    archived_posts = [p for p in all_posts if not p.active]

    async def annotate(posts: List[Post]):
        for p in posts:
            cnt = await session.execute(
                select(func.count(Comment.id))
                .where(Comment.post_id == literal(p.id), Comment.price.isnot(None))
            )
            p.bids_count = cnt.scalar() or 0

    # считаем
    await annotate(active_posts)
    await annotate(archived_posts)

    return {
        "status": "ok",
        "user": public_profile,
        "posts": {
            "active": [PostResponse.from_orm(p) for p in active_posts],
            "archived": [PostResponse.from_orm(p) for p in archived_posts],
        },
    }


@router.get("/me/favorites", summary="Получение избранных постов текущего пользователя")
async def get_favorites(
        current_user=Depends(get_current_user),
        session: AsyncSession = Depends(get_session)
):
    stmt = (
        select(Post)
        .join(Favorite, Favorite.post_id == Post.id)
        .where(Favorite.user_id == current_user.id)
        .options(
            selectinload(Post.author),
            selectinload(Post.winner)
        )
    )
    result = await session.execute(stmt)
    posts = result.scalars().all()
    for p in posts:
        cnt = await session.execute(
            select(func.count(Comment.id))
            .where(Comment.post_id == literal(p.id), Comment.price.isnot(None))
        )
        p.bids_count = cnt.scalar() or 0

    return {"status": "ok", "favorites": [PostResponse.from_orm(p) for p in posts]}


@router.delete("/profile/delete")
async def delete_profile(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await session.execute(
        update(Post)
        .where(Post.winner_id == current_user.id)
        .values(winner_id=None)
    )
    await session.execute(
        delete(Comment).where(Comment.user_id == current_user.id)
    )
    await session.execute(
        delete(Favorite).where(Favorite.user_id == current_user.id)
    )
    if current_user.role.name == "seller":
        await session.execute(
            delete(Comment).where(Comment.post_id.in_(
                select(Post.id).where(Post.author_id == current_user.id)
            ))
        )
        await session.execute(
            delete(Favorite).where(Favorite.post_id.in_(
                select(Post.id).where(Post.author_id == current_user.id)
            ))
        )
        await session.execute(
            delete(Post).where(Post.author_id == current_user.id)
        )
    user = await session.get(User, current_user.id)
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    await session.delete(user)
    await session.commit()
    return {"status": "ok"}


# временный эндпоинт
@router.post("/profile/become_seller", summary="Сделать текущего пользователя продавцом")
async def become_seller(
        current_user: User = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Role).where(Role.name == "seller"))
    seller_role = result.scalar_one_or_none()
    if seller_role is None:
        raise HTTPException(500, "Роль продавца не найдена")
    current_user.role_id = seller_role.id
    session.add(current_user)
    await session.commit()
    return {"status": "ok", "new_role": "seller"}
