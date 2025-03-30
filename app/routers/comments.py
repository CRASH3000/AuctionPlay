from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, UTC

from app.schemas.comments import CommentCreate
from app.routers.auth import get_current_user
from app.models.user import User, users_db

comments_db = []

router = APIRouter()


@router.post("/comments", response_model=dict, summary="Сделать ставку")
def create_comment(comment: CommentCreate, current_user: User = Depends(get_current_user)):
    from app.routers.posts import posts_db
    post = None
    for p in posts_db:
        if p["id"] == comment.post_id:
            post = p
            break
    if post is None:
        raise HTTPException(status_code=404, detail="Пост не найден")
    if post["author_id"] == current_user.id:
        raise HTTPException(status_code=403, detail="Автор не может делать ставки под своим постом")

    current_max = post["price"]
    for c in comments_db:
        if c["post_id"] == comment.post_id and c["price"] > current_max:
            current_max = c["price"]
    if comment.price <= current_max:
        raise HTTPException(status_code=400, detail="Ставка должна быть больше текущей максимальной")
    comment_id = len(comments_db) + 1
    created_at = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S")
    new_comment = {
        "id": comment_id,
        "post_id": comment.post_id,
        "user_id": current_user.id,
        "price": comment.price,
        "created_at": created_at
    }
    comments_db.append(new_comment)
    return {"status": "ok", "comment": new_comment}


@router.get("/comments", summary="Получить комментарии (ставки) под постом")
def get_comments(post_id: int = Query(..., alias="id")):
    filtered_comments = [c for c in comments_db if c["post_id"] == post_id]
    transformed = []
    for comment in filtered_comments:
        new_comment = comment.copy()
        if comment.get("user_id") is not None:
            author = next(
                (
                    {
                        "id": user.id,
                        "username": user.username,
                        "avatar": user.avatar,
                    }
                    for user in users_db
                    if user.id == comment["user_id"]
                ),
                None,
            )
            new_comment["author"] = author
        else:
            new_comment["author"] = None
        transformed.append(new_comment)
    return {"status": "ok", "comments": transformed}


@router.get("/comments/max_price", summary="Получить максимальную ставку для поста")
def get_max_bid(post_id: int):
    filtered = [c for c in comments_db if c["post_id"] == post_id and c.get("price") is not None]
    if not filtered:
        return {"max_price": None, "user_id": None, "username": None}
    max_comment = max(filtered, key=lambda c: c["price"])
    bidder = next(
        (
            {"id": user.id, "username": user.username}
            for user in users_db
            if user.id == max_comment["user_id"]
        ),
        None,
    )
    if bidder is None:
        raise HTTPException(status_code=500, detail="Данные о пользователе не найдены")
    return {"max_price": max_comment["price"], "user_id": bidder["id"], "username": bidder["username"]}
