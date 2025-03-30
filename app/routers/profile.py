from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, UTC

from app.routers.favorites import favorites_db
from app.schemas.user import UserResponse, ProfileUpdateRequest, UserSetAvatarRequest, RoleUpdateRequest
from app.models.user import User, users_db
from app.routers.auth import get_current_user

from app.routers.posts import posts_db

router = APIRouter()


@router.get("/profile/me", response_model=UserResponse, summary="Получение информации о себе")
def get_profile_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        firstname=current_user.firstname,
        lastname=current_user.lastname,
        email=current_user.email,
        telegram_username=current_user.telegram_username,
        avatar=current_user.avatar,
        role=current_user.role,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


@router.patch("/profile/update", summary="Редактирование профиля")
def update_profile(update_req: ProfileUpdateRequest, current_user: User = Depends(get_current_user)):
    current_user.username = update_req.username
    current_user.telegram_username = update_req.telegram_username
    current_user.email = update_req.email
    current_user.firstname = update_req.firstname
    current_user.lastname = update_req.lastname
    current_user.updated_at = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S")
    return {"status": "ok", "message": "Profile updated"}


@router.post("/profile/avatar", summary="Обновление аватара профиля")
def update_avatar(avatar_req: UserSetAvatarRequest, current_user: User = Depends(get_current_user)):
    current_user.avatar = avatar_req.image
    return {"status": "ok", "avatar": current_user.avatar}


@router.get("/profile/{user_id}", summary="Получение публичного профиля", response_model=dict)
def get_public_profile(user_id: int):
    target = None
    for user in users_db:
        if user.id == user_id:
            target = user
            break
    if target is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    public_profile = {
        "id": target.id,
        "username": target.username,
        "avatar": target.avatar,
        "telegram_username": target.telegram_username,
        "role": target.role
    }
    active_posts = [post for post in posts_db if post.get("author_id") == user_id and post.get("active") is True]
    archived_posts = [post for post in posts_db if post.get("author_id") == user_id and post.get("active") is False]
    return {"status": "ok", "user": public_profile, "posts": {"active": active_posts, "archived": archived_posts}}


@router.get("/me/favorites", summary="Получение избранных постов текущего пользователя")
def get_favorites(current_user: User = Depends(get_current_user)):
    favorite_ids = favorites_db.get(current_user.id, [])
    from app.routers.posts import posts_db
    favorite_posts = []
    for post in posts_db:
        if post["id"] in favorite_ids:
            author = next(
                (
                    {
                        "id": user.id,
                        "username": user.username,
                        "avatar": user.avatar,
                        "telegram_username": user.telegram_username,
                    }
                    for user in users_db
                    if user.id == post["author_id"]
                ),
                None,
            )
            if author is None:
                raise HTTPException(status_code=500, detail="Автор не найден")
            post_copy = post.copy()
            post_copy["author"] = author
            post_copy.pop("author_id", None)
            favorite_posts.append(post_copy)
    return {"status": "ok", "favorites": favorite_posts}


@router.patch("/users/{user_id}/role", summary="Изменение роли пользователя по ID")
def update_user_role(user_id: int, role_update: RoleUpdateRequest, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа: требуется администратор")
    allowed_roles = {"user", "seller", "admin"}
    new_role = role_update.role
    if new_role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Недопустимая роль")
    target = None
    for user in users_db:
        if user.id == user_id:
            target = user
            break
    if target is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    target.role = new_role
    target.updated_at = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S")
    return {"status": "ok", "message": f"Role updated to {new_role}"}
