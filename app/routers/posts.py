from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, UTC, timedelta, timezone
from typing import List

from app.routers.comments import comments_db
from app.schemas.post import PostCreate, PostResponse
from app.routers.auth import get_current_user
from app.models.user import User, users_db

posts_db = []

router = APIRouter()


@router.get("/posts", response_model=List[PostResponse], summary="Получить список постов")
def get_posts(limit: int = Query(5, ge=1), page: int = Query(1, ge=1), archive: bool = Query(False)):
    filtered_posts = [post for post in posts_db if post["active"] != archive]
    transformed_posts = []
    for post in filtered_posts:
        author = None
        for user in users_db:
            if user.id == post["author_id"]:
                author = {
                    "id": user.id,
                    "username": user.username,
                    "avatar": user.avatar,
                    "telegram_username": user.telegram_username
                }
                break
        if author is None:
            raise HTTPException(status_code=500, detail="Автор не найден")
        new_post = post.copy()
        new_post["author"] = author
        transformed_posts.append(new_post)
    start = (page - 1) * limit
    end = start + limit
    return transformed_posts[start:end]


@router.get("/posts/{post_id}", response_model=PostResponse, summary="Получить пост по ID")
def get_post(post_id: int):
    for post in posts_db:
        if post["id"] == post_id:
            author = None
            for user in users_db:
                if user.id == post["author_id"]:
                    author = {
                        "id": user.id,
                        "username": user.username,
                        "avatar": user.avatar,
                        "telegram_username": user.telegram_username
                    }
                    break
            if author is None:
                raise HTTPException(status_code=500, detail="Автор не найден")
            post_response = post.copy()
            post_response["author"] = author
            return post_response
    raise HTTPException(status_code=404, detail="Пост не найден")


@router.post("/posts", response_model=dict, summary="Создать пост")
def create_post(post: PostCreate, current_user: User = Depends(get_current_user)):
    if not hasattr(current_user, "role") or current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Пользователь не является продавцом")
    post_id = len(posts_db) + 1
    created_at = datetime.now(UTC)
    if post.duration == "24h":
        delta = timedelta(hours=24)
    elif post.duration == "3d":
        delta = timedelta(days=3)
    elif post.duration == "5d":
        delta = timedelta(days=5)
    else:
        raise HTTPException(status_code=400, detail="Неверное значение duration")
    time_until_locked = created_at + delta
    new_post = {
        "id": post_id,
        "title": post.title,
        "text": post.text,
        "cover": post.cover,
        "price": post.price,
        "duration": post.duration,
        "author_id": current_user.id,
        "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "time_until_locked": time_until_locked.strftime("%Y-%m-%d %H:%M:%S"),
        "active": True,
        "winner": None
    }
    posts_db.append(new_post)
    return {"status": "ok", "post_id": post_id}


@router.patch("/posts/{post_id}/winner", summary="Установить победителя для поста")
def set_winner(post_id: int,  current_user: User = Depends(get_current_user)):
    post = next((p for p in posts_db if p["id"] == post_id), None)
    if post is None:
        raise HTTPException(status_code=404, detail="Пост не найден")
    now = datetime.now(UTC)
    try:
        auction_end = datetime.strptime(post["time_until_locked"], "%Y-%m-%d %H:%M:%S").replace(
            tzinfo=timezone.utc)
    except Exception:
        raise HTTPException(status_code=500, detail="Некорректный формат времени окончания аукциона")
    if current_user.id != post["author_id"] and now < auction_end:
        raise HTTPException(status_code=409, detail="Торги ещё активны")
    bids = [c for c in comments_db if c["post_id"] == post_id and c.get("price") is not None]
    if not bids:
        raise HTTPException(status_code=400, detail="Нет ставок, победитель не может быть определён")

    max_bid = max(bids, key=lambda c: c["price"])
    post["winner"] = max_bid["user_id"]
    post["active"] = False
    system_comment = {
        "id": len(comments_db) + 1,
        "post_id": post_id,
        "user_id": None,
        "price": None,
        "created_at": datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S"),
        "system_message": f"Победитель: @{max_bid['user_id']}. Ставка: {max_bid['price']}"
    }
    comments_db.append(system_comment)
    winner = next((u for u in users_db if u.id == max_bid["user_id"]), None)
    if winner is None:
        raise HTTPException(status_code=500, detail="Победитель не найден")
    return {"status": "ok", "winner": {"id": winner.id, "username": winner.username, "price": max_bid["price"]}}