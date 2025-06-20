from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timedelta, timezone
from typing import List
from sqlalchemy import literal
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.schemas.post import PostCreate, PostResponse
from backend.app.routers.auth import get_current_user
from backend.db.db import get_session
from backend.db.models import Post, Comment, User

router = APIRouter()


@router.get(
    "/posts", response_model=List[PostResponse], summary="Получить список постов"
)
async def get_posts(
        limit: int = Query(5, ge=1),
        page: int = Query(1, ge=1),
        archive: bool = Query(False),
        session: AsyncSession = Depends(get_session),
):
    stmt = (
        select(Post)
        .options(selectinload(Post.author), selectinload(Post.winner))
        .where(Post.active != literal(archive))
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await session.execute(stmt)
    posts = result.scalars().all()
    return posts


@router.get(
    "/posts/{post_id}", response_model=PostResponse, summary="Получить пост по ID"
)
async def get_post(post_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Post)
        .options(selectinload(Post.author), selectinload(Post.winner))
        .where(Post.id == literal(post_id))
    )
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail="Пост не найден")
    return post


@router.post("/posts", response_model=dict, summary="Создать пост")
async def create_post(
        post: PostCreate = Depends(PostCreate.as_form),
        current_user=Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
):
    if current_user.role.name != "seller":
        raise HTTPException(
            status_code=403, detail="Пользователь не является продавцом"
        )
    base_dir = Path(__file__).resolve().parent.parent
    static_posts_dir = base_dir / "static" / "posts"
    static_posts_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{int(datetime.now().timestamp())}_{post.cover.filename}"
    dest_path = static_posts_dir / filename
    contents = await post.cover.read()
    with open(dest_path, "wb") as f:
        f.write(contents)
    created_at = datetime.now(timezone.utc)
    if post.duration == "24h":
        delta = timedelta(hours=24)
    elif post.duration == "3d":
        delta = timedelta(days=3)
    elif post.duration == "5d":
        delta = timedelta(days=5)
    else:
        raise HTTPException(status_code=400, detail="Неверное значение duration")
    time_until_locked = created_at + delta
    new_post = Post(
        title=post.title,
        content=post.text,
        cover=f"/static/posts/{filename}",
        price=int(post.price),
        duration=post.duration,
        time_until_locked=time_until_locked,
        author_id=current_user.id,
        created_at=created_at,
        active=True,
    )
    session.add(new_post)
    await session.commit()
    await session.refresh(new_post)
    return {"status": "ok", "post_id": new_post.id}


@router.patch("/posts/{post_id}/winner", summary="Установить победителя для поста")
async def set_winner(
        post_id: int,
        current_user=Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Post).where(Post.id == literal(post_id)))
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail="Пост не найден")
    if post.winner_id is not None:
        raise HTTPException(status_code=409, detail="Победитель уже определён")
    now = datetime.now(timezone.utc)
    if current_user.id != post.author_id and now < post.time_until_locked:
        raise HTTPException(status_code=409, detail="Торги ещё активны")
    result = await session.execute(
        select(Comment).where(
            Comment.post_id == literal(post_id), Comment.price.isnot(None)
        )
    )
    bids = result.scalars().all()
    if not bids:
        raise HTTPException(
            status_code=400, detail="Нет ставок, победитель не может быть определён"
        )
    max_bid = max(bids, key=lambda c: c.price)
    post.winner_id = max_bid.user_id
    post.active = False
    post.finished_at = now
    system_comment = Comment(
        post_id=post_id,
        user_id=None,
        price=None,
        created_at=datetime.now(timezone.utc),
        system_message=f"Победитель: @{max_bid.user_id}. Ставка: {max_bid.price}",
    )
    session.add(system_comment)
    await session.commit()
    result = await session.execute(
        select(User).where(User.id == literal(max_bid.user_id))
    )
    winner = result.scalar_one_or_none()
    if winner is None:
        raise HTTPException(status_code=500, detail="Победитель не найден")
    return {
        "status": "ok",
        "winner": {
            "id": winner.id,
            "username": winner.username,
            "price": max_bid.price,
        },
    }


@router.delete("/posts/{post_id}", summary="Удалить пост")
async def delete_post(
        post_id: int,
        current_user=Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Пост не найден")
    if post.author_id != current_user.id:
        raise HTTPException(403, "Нельзя удалять чужие лоты")
    await session.delete(post)
    await session.commit()
    return {"status": "ok"}
