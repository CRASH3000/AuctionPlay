from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone

from sqlalchemy import literal
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.comments import CommentCreate, CommentResponse
from app.routers.auth import get_current_user
from app.schemas.user import AuthorResponse
from db.models import Comment, User, Post
from db.db import get_session

router = APIRouter()


@router.post("/comments", response_model=dict, summary="Сделать ставку")
async def create_comment(
    comment: CommentCreate = Depends(CommentCreate.as_form),
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Post).where(Post.id == literal(comment.post_id))
    )
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail="Пост не найден")
    now = datetime.now(timezone.utc)
    if not post.active or now >= post.time_until_locked:
        raise HTTPException(status_code=403, detail="Аукцион уже завершен")
    if post.author_id == current_user.id:
        raise HTTPException(
            status_code=403, detail="Автор не может делать ставки под своим постом"
        )
    current_max = post.price
    result = await session.execute(
        select(Comment).where(
            Comment.post_id == literal(comment.post_id), Comment.price.isnot(None)
        )
    )
    bids = result.scalars().all()
    for bid in bids:
        if bid.price > current_max:
            current_max = bid.price
    if comment.price <= current_max:
        raise HTTPException(
            status_code=400, detail="Ставка должна быть больше текущей максимальной"
        )
    new_comment = Comment(
        post_id=comment.post_id,
        user_id=current_user.id,
        price=int(comment.price),
        created_at=datetime.now(timezone.utc),
    )
    session.add(new_comment)
    await session.commit()
    await session.refresh(new_comment)
    return {
        "status": "ok",
        "comment": {
            "id": new_comment.id,
            "post_id": new_comment.post_id,
            "price": new_comment.price,
            "created_at": new_comment.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        },
    }


@router.get("/comments", summary="Получить комментарии (ставки) под постом")
async def get_comments(
    post_id: int = Query(..., alias="id"), session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(Comment).where(Comment.post_id == literal(post_id))
    )
    comments = result.scalars().all()
    transformed = []
    for comment in comments:
        author_obj = None
        if comment.user_id is not None:
            result = await session.execute(
                select(User).where(User.id == literal(comment.user_id))
            )
            author = result.scalar_one_or_none()
            if author:
                author_obj = AuthorResponse(
                    id=author.id,
                    username=author.username,
                    avatar=author.avatar,
                    telegram_username=author.telegram_username,
                )
        comment_data = {
            "id": comment.id,
            "post_id": comment.post_id,
            "price": comment.price,
            "created_at": (
                comment.created_at.strftime("%Y-%m-%d %H:%M:%S")
                if comment.created_at
                else None
            ),
            "author": author_obj,
        }
        transformed.append(CommentResponse(**comment_data))
    return {"status": "ok", "comments": transformed}


@router.get("/comments/max_price", summary="Получить максимальную ставку для поста")
async def get_max_bid(post_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Comment).where(
            Comment.post_id == literal(post_id), Comment.price.isnot(None)
        )
    )
    comments = result.scalars().all()
    if not comments:
        return {"max_price": None, "user_id": None, "username": None}
    max_comment = max(comments, key=lambda c: c.price)
    result = await session.execute(
        select(User).where(User.id == literal(max_comment.user_id))
    )
    bidder = result.scalar_one_or_none()
    if bidder is None:
        raise HTTPException(status_code=500, detail="Данные о пользователе не найдены")
    return {
        "max_price": max_comment.price,
        "user_id": bidder.id,
        "username": bidder.username,
    }
