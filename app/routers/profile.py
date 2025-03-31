from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone

from sqlalchemy import literal
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import UserResponse, ProfileUpdateRequest, UserSetAvatarRequest, RoleUpdateRequest
from db.models import User, Post
from app.routers.auth import get_current_user
from db.db import get_session

router = APIRouter()


@router.get("/profile/me", response_model=UserResponse, summary="Получение информации о себе")
async def get_profile_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        firstname=current_user.firstname,
        lastname=current_user.lastname,
        email=current_user.email,
        telegram_username=current_user.telegram_username,
        avatar=current_user.avatar,
        created_at=current_user.created_at.strftime("%Y-%m-%d %H:%M:%S") if current_user.created_at else "",
        updated_at=current_user.updated_at.strftime("%Y-%m-%d %H:%M:%S") if current_user.updated_at else "")


@router.patch("/profile/update", summary="Редактирование профиля")
async def update_profile(update_req: ProfileUpdateRequest,
                         current_user: User = Depends(get_current_user),
                         session: AsyncSession = Depends(get_session)):
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
async def update_avatar(avatar_req: UserSetAvatarRequest,
                        current_user: User = Depends(get_current_user),
                        session: AsyncSession = Depends(get_session)):
    current_user.avatar = avatar_req.image
    session.add(current_user)
    await session.commit()
    return {"status": "ok", "avatar": current_user.avatar}


@router.get("/profile/{user_id}", summary="Получение публичного профиля", response_model=dict)
async def get_public_profile(user_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.id == literal(user_id)))
    target = result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    public_profile = {
        "id": target.id,
        "username": target.username,
        "avatar": target.avatar,
        "telegram_username": target.telegram_username,
        "role": target.role
    }
    result = await session.execute(select(Post).where(Post.author_id == literal(user_id)))
    posts = result.scalars().all()
    active_posts = [post for post in posts if post.active]
    archived_posts = [post for post in posts if not post.active]
    return {"status": "ok", "user": public_profile, "posts": {"active": active_posts, "archived": archived_posts}}


@router.get("/me/favorites", summary="Получение избранных постов текущего пользователя")
async def get_favorites(current_user: User = Depends(get_current_user),
                        session: AsyncSession = Depends(get_session)):
    favorite_posts = []
    for fav in current_user.favorites:
        favorite_posts.append(fav.post)
    return {"status": "ok", "favorites": favorite_posts}


@router.patch("/users/{user_id}/role", summary="Изменение роли пользователя по ID")
async def update_user_role(user_id: int,
                           role_update: RoleUpdateRequest,
                           current_user: User = Depends(get_current_user),
                           session: AsyncSession = Depends(get_session)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа: требуется администратор")
    allowed_roles = {"user", "seller", "admin"}
    new_role = role_update.role
    if new_role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Недопустимая роль")
    result = await session.execute(select(User).where(User.id == literal(user_id)))
    target = result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    target.role = new_role
    target.updated_at = datetime.now(timezone.utc)
    session.add(target)
    await session.commit()
    return {"status": "ok", "message": f"Role updated to {new_role}"}
