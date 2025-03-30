from fastapi import APIRouter, HTTPException, Depends, Response, Cookie
from jwt import PyJWTError
import jwt
from datetime import datetime, UTC

from app.schemas.user import RegistrationRequest, AuthRequest, UserResponse, SetAvatarRequest
from app.models.user import User, users_db
from app.core.security import create_tokens, get_password_hash, verify_password
from app.core.config import SECRET_KEY, ALGORITHM

router = APIRouter()


@router.post("/registration", summary="Регистрация пользователя")
def registration(response: Response, reg_req: RegistrationRequest):
    for user in users_db:
        if user.username == reg_req.username or user.email == reg_req.email:
            raise HTTPException(status_code=409, detail="Ник или почта уже существует")
    user_id = len(users_db) + 1
    hashed_password = get_password_hash(reg_req.password)
    now = datetime.now(UTC)
    created_at = now.strftime("%Y-%m-%d %H:%M:%S")
    updated_at = created_at
    access_token, refresh_token = create_tokens(user_id, reg_req.username)
    new_user = User(
        id=user_id,
        username=reg_req.username,
        firstname=reg_req.firstname,
        lastname=reg_req.lastname,
        email=reg_req.email,
        telegram_username=reg_req.telegram_username,
        hashed_password=hashed_password,
        jwt_access=access_token,
        jwt_request=refresh_token,
        created_at=created_at,
        updated_at=updated_at
    )
    users_db.append(new_user)
    # Позже для БД insert в таблицу юзеров
    response.set_cookie(key="jwt_access", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="jwt_request", value=refresh_token, httponly=True, samesite="lax")
    return {
        "status": "ok",
        "user": {
            "id": new_user.id,
            "jwt_access": access_token,
            "jwt_request": refresh_token
        }
    }


@router.post("/auth", summary="Вход пользователя")
def auth(response: Response, auth_req: AuthRequest):
    user_found = None
    for user in users_db:
        if user.username == auth_req.username and verify_password(auth_req.password, user.hashed_password):
            user_found = user
            break
    if not user_found:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    access_token, refresh_token = create_tokens(user_found.id, user_found.username)
    user_found.jwt_access = access_token
    user_found.jwt_request = refresh_token
    response.set_cookie(key="jwt_access", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="jwt_request", value=refresh_token, httponly=True, samesite="lax")
    return {
        "status": "ok",
        "jwt_access": access_token,
        "jwt_request": refresh_token
    }


# Зависимость для получения текущего пользователя из токена
def get_current_user(jwt_access: str = Cookie(None)):
    if jwt_access is None:
        raise HTTPException(status_code=401, detail="Пользователь не авторизован")
    try:
        payload = jwt.decode(jwt_access, SECRET_KEY, ALGORITHM)
        user_id = payload.get("user_id")
        for user in users_db:
            if user.id == user_id:
                return user
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Срок действия токена истек")
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")


@router.get("/me", summary="Получить данные текущего пользователя", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "firstname": current_user.firstname,
        "lastname": current_user.lastname,
        "email": current_user.email,
        "telegram_username": current_user.telegram_username,
        "avatar": current_user.avatar,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }


@router.post("/jwt", summary="Обновить токены")
def refresh_jwt(response: Response, jwt_request: str = Cookie(None)):
    if jwt_request is None:
        raise HTTPException(status_code=401, detail="Request token отсутствует")
    try:
        payload = jwt.decode(jwt_request, SECRET_KEY, ALGORITHM)
        user_id = payload.get("user_id")
        user_found = None
        for user in users_db:
            if user.id == user_id:
                user_found = user
                break
        if user_found is None or user_found.jwt_request != jwt_request:
            raise HTTPException(status_code=401, detail="Неверный request token")
        access_token, new_refresh_token = create_tokens(user_found.id, user_found.username)
        user_found.jwt_access = access_token
        user_found.jwt_request = new_refresh_token
        response.set_cookie(key="jwt_access", value=access_token, httponly=True, samesite="lax")
        response.set_cookie(key="jwt_request", value=new_refresh_token, httponly=True, samesite="lax")
        return {
            "status": "ok",
            "jwt_access": access_token,
            "jwt_request": new_refresh_token
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Request token истек")
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")


@router.post("/set_avatar", summary="Установка или обновление аватара")
def set_avatar(_response: Response, avatar_req: SetAvatarRequest, current_user: User = Depends(get_current_user)):
    if avatar_req.user != current_user.id:
        raise HTTPException(status_code=403, detail="Нельзя обновить аватар другого пользователя")
    current_user.avatar = avatar_req.image
    # Потом покушаю, а тут надо будет для аватарки че то в БД делать
    return {"status": "ok"}


@router.post("/logout", summary="Выход из системы")
def logout(response: Response, _current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="jwt_access")
    response.delete_cookie(key="jwt_request")
    # Тут тоже можно сброс токена сделать например когда на БД переход будет
    return {"status": "ok", "message": "Logged out successfully"}


@router.delete("/users/{user_id}", summary="Удаление пользователя по ID")
def delete_user(user_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа: требуется администратор")
    target = None
    for user in users_db:
        if user.id == user_id:
            target = user
            break
    if target is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    users_db.remove(target)
    # Ну тут DELETE может фиг знает
    return {"status": "ok", "message": f"User with id {user_id} deleted"}


@router.get("/users/{user_id}", summary="Получение пользователя по ID", response_model=UserResponse)
def get_user(user_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа: требуется администратор")
    for user in users_db:
        if user.id == user_id:
            return UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                telegram_username=user.telegram_username,
                avatar=user.avatar,
                role=user.role,
                created_at=user.created_at,
                updated_at=user.updated_at
            )
    raise HTTPException(status_code=404, detail="Пользователь не найден")


@router.get("/users", summary="Получение списка всех пользователей")
def get_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа: требуется администратор")
    users_list = []
    for user in users_db:
        users_list.append({
            "id": user.id,
            "username": user.username,
            "email": user.email
        })
    return {"status": "ok", "users": users_list}
