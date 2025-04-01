from fastapi import APIRouter, HTTPException, Depends, Response, Cookie
from jwt import PyJWTError
import jwt
from datetime import datetime, timezone
from sqlalchemy import or_, literal
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import RegistrationRequest, AuthRequest, UserResponse, SetAvatarRequest
from db.models import User, Role
from app.core.security import create_tokens, get_password_hash, verify_password
from app.core.config import SECRET_KEY, ALGORITHM
from db.db import get_session

router = APIRouter()


@router.post("/registration", summary="Регистрация пользователя")
async def registration(response: Response, reg_req: RegistrationRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(or_(User.username == reg_req.username,
                                                          User.email == reg_req.email)))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Username или email уже существует")
    role_result = await session.execute(select(Role).where(Role.name == literal('user')))
    default_role = role_result.scalar_one_or_none()
    if default_role is None:
        raise HTTPException(status_code=500, detail="Роль 'user' не найдена в базе")
    new_user = User(
        username=reg_req.username,
        firstname=reg_req.firstname,
        lastname=reg_req.lastname,
        email=reg_req.email,
        telegram_username=reg_req.telegram_username,
        password=get_password_hash(reg_req.password),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        role_id=default_role.id
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    access_token, refresh_token = create_tokens(new_user.id, new_user.username)
    new_user.jwt = access_token
    response.set_cookie(key="jwt_access", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="jwt_request", value=refresh_token, httponly=True, samesite="lax")
    return {"status": "ok", "user": {"id": new_user.id, "jwt_access": access_token, "jwt_request": refresh_token}}


@router.post("/auth", summary="Вход пользователя")
async def auth(response: Response, auth_req: AuthRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.username == literal(auth_req.username)))
    user = result.scalar_one_or_none()
    if not user or not verify_password(auth_req.password, user.password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    access_token, refresh_token = create_tokens(user.id, user.username)
    user.jwt = access_token
    await session.commit()
    response.set_cookie(key="jwt_access", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="jwt_request", value=refresh_token, httponly=True, samesite="lax")
    return {"status": "ok", "jwt_access": access_token, "jwt_request": refresh_token}


# Зависимость для получения текущего пользователя из токена
async def get_current_user(jwt_access: str = Cookie(None), session: AsyncSession = Depends(get_session)):
    if jwt_access is None:
        raise HTTPException(status_code=401, detail="Пользователь не авторизован")
    try:
        payload = jwt.decode(jwt_access, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        result = await session.execute(
            select(User)
            .options(selectinload(User.role))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Срок действия токена истек")
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")


@router.get("/me", summary="Получить данные текущего пользователя", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        firstname=current_user.firstname,
        lastname=current_user.lastname,
        email=current_user.email,
        telegram_username=current_user.telegram_username,
        avatar=current_user.avatar,
        created_at=current_user.created_at.strftime("%Y-%m-%d %H:%M:%S") if current_user.created_at else "",
        updated_at=current_user.updated_at.strftime("%Y-%m-%d %H:%M:%S") if current_user.updated_at else ""
    )


@router.post("/jwt", summary="Обновить токены")
async def refresh_jwt(response: Response, jwt_request: str = Cookie(None),
                      session: AsyncSession = Depends(get_session)):
    if jwt_request is None:
        raise HTTPException(status_code=401, detail="Refresh токен отсутствует")
    try:
        payload = jwt.decode(jwt_request, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
        access_token, new_refresh_token = create_tokens(user.id, user.username)
        user.jwt = access_token
        await session.commit()
        response.set_cookie(key="jwt_access", value=access_token, httponly=True, samesite="lax")
        response.set_cookie(key="jwt_request", value=new_refresh_token, httponly=True, samesite="lax")
        return {"status": "ok", "jwt_access": access_token, "jwt_request": new_refresh_token}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh токен истек")
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")


@router.post("/set_avatar", summary="Установка или обновление аватара")
async def set_avatar(response: Response, avatar_req: SetAvatarRequest, current_user: User = Depends(get_current_user),
                     session: AsyncSession = Depends(get_session)):
    if avatar_req.user != current_user.id:
        raise HTTPException(status_code=403, detail="Нельзя обновить аватар другого пользователя")
    current_user.avatar = avatar_req.image
    session.add(current_user)
    await session.commit()
    return {"status": "ok"}


@router.post("/logout", summary="Выход из системы")
async def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="jwt_access")
    response.delete_cookie(key="jwt_request")
    return {"status": "ok", "message": "Logged out successfully"}


@router.delete("/users/{user_id}", summary="Удаление пользователя по ID")
async def delete_user(user_id: int, current_user: User = Depends(get_current_user),
                      session: AsyncSession = Depends(get_session)):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа: требуется администратор")
    result = await session.execute(select(User).where(User.id == literal(user_id)))
    target = result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    await session.delete(target)
    await session.commit()
    return {"status": "ok", "message": f"User with id {user_id} deleted"}


@router.get("/users/{user_id}", summary="Получение пользователя по ID", response_model=UserResponse)
async def get_user(user_id: int, current_user: User = Depends(get_current_user),
                   session: AsyncSession = Depends(get_session)):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа: требуется администратор")
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
        created_at=user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else "",
        updated_at=user.updated_at.strftime("%Y-%m-%d %H:%M:%S") if user.updated_at else ""
    )


@router.get("/users", summary="Получение списка всех пользователей")
async def get_users(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа: требуется администратор")
    result = await session.execute(select(User))
    users = result.scalars().all()
    users_list = [{"id": user.id, "username": user.username, "email": user.email} for user in users]
    return {"status": "ok", "users": users_list}
