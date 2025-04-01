from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone

from sqlalchemy import literal
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.routers.auth import get_current_user
from app.schemas.user import UserResponse, RoleUpdateRequest
from db.models import User, Role
from db.db import get_session

router = APIRouter()


@router.delete(
    "/users/{user_id}", summary="Удаление пользователя по ID", tags=["Admin"]
)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=403, detail="Нет доступа: требуется администратор"
        )
    result = await session.execute(select(User).where(User.id == literal(user_id)))
    target = result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    await session.delete(target)
    await session.commit()
    return {"status": "ok", "message": f"User with id {user_id} deleted"}


@router.get(
    "/users/{user_id}",
    summary="Получение пользователя по ID",
    response_model=UserResponse,
    tags=["Admin"],
)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=403, detail="Нет доступа: требуется администратор"
        )
    result = await session.execute(select(User).where(User.id == literal(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return UserResponse(
        id=user.id,
        username=user.username,
        firstname=user.firstname,
        lastname=user.lastname,
        email=user.email,
        telegram_username=user.telegram_username,
        avatar=user.avatar,
        created_at=(
            user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else ""
        ),
        updated_at=(
            user.updated_at.strftime("%Y-%m-%d %H:%M:%S") if user.updated_at else ""
        ),
    )


@router.get("/users", summary="Получение списка всех пользователей", tags=["Admin"])
async def get_users(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=403, detail="Нет доступа: требуется администратор"
        )
    result = await session.execute(select(User))
    users = result.scalars().all()
    users_list = [
        {"id": user.id, "username": user.username, "email": user.email}
        for user in users
    ]
    return {"status": "ok", "users": users_list}


@router.patch(
    "/users/{user_id}/role", summary="Изменение роли пользователя по ID", tags=["Admin"]
)
async def update_user_role(
    user_id: int,
    role_update: RoleUpdateRequest = Depends(RoleUpdateRequest.as_form),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=403, detail="Нет доступа: требуется администратор"
        )
    allowed_roles = {"user", "seller", "admin"}
    new_role = role_update.role
    if new_role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Недопустимая роль")
    result = await session.execute(select(User).where(User.id == literal(user_id)))
    target = result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    role_result = await session.execute(
        select(Role).where(Role.name == literal(new_role))
    )
    role_obj = role_result.scalar_one_or_none()
    if role_obj is None:
        raise HTTPException(status_code=400, detail="Роль не найдена")

    target.role = role_obj
    target.updated_at = datetime.now(timezone.utc)
    session.add(target)
    await session.commit()
    return {"status": "ok", "message": f"Role updated to {new_role}"}
