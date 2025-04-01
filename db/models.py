from typing import Optional

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.dialects.postgresql import JSONB
import asyncio


class Base(DeclarativeBase):
    pass


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    registered_routes = Column(JSONB, server_default='["/admin", "/create_post"]')
    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    email = Column(String(100), unique=True)
    password = Column(String(100))
    firstname = Column(String(100))
    lastname = Column(String(100))
    telegram_username = Column(String(100))
    avatar = Column(String(1000), default="/avatars/default.png")
    jwt = Column(String(1000))
    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role", back_populates="users")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), onupdate=datetime.utcnow)
    active = Column(Boolean, default=True)
    posts = relationship("Post", back_populates="author", foreign_keys='Post.author_id')
    comments = relationship("Comment", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")


class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True)
    title = Column(String(100))
    content = Column(String(1000))
    cover = Column(String(1000))
    price = Column(Integer)
    duration = Column(String(10))
    time_until_locked = Column(DateTime(timezone=True))
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts", foreign_keys=lambda: [Post.author_id])
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    winner = relationship("User", foreign_keys=lambda: [Post.winner_id])
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), onupdate=datetime.utcnow)
    active = Column(Boolean, default=True)
    comments = relationship("Comment", back_populates="post")
    favorites = relationship("Favorite", back_populates="post")

    @property
    def text(self):
        return self.content


class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True)
    content = Column(String(500), nullable=True)
    price: Optional[int] = Column(Integer, nullable=True)
    user_id: Optional[int] = Column(Integer, ForeignKey("users.id"), nullable=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    system_message = Column(String(500), nullable=True)


class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))
    user = relationship("User", back_populates="favorites")
    post = relationship("Post", back_populates="favorites")


async def init_db():
    DATABASE_URL = "postgresql+asyncpg://postgres:123@localhost:5433/auctionplay"

    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)


if __name__ == "__main__":
    asyncio.run(init_db())
