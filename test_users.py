import asyncio
from datetime import datetime, timezone
from sqlalchemy import select, literal
from sqlalchemy.orm import selectinload

from backend.db.db import async_session
from backend.db.models import User, Role
from backend.app.core.security import get_password_hash


async def test_users():
    async with async_session() as session:
        result = await session.execute(
            select(Role).where(Role.name == literal("admin"))
        )
        admin_role = result.scalar_one_or_none()
        if admin_role is None:
            admin_role = Role(name="admin")
            session.add(admin_role)
            await session.commit()
            await session.refresh(admin_role)

        result = await session.execute(
            select(Role).where(Role.name == literal("seller"))
        )
        seller_role = result.scalar_one_or_none()
        if seller_role is None:
            seller_role = Role(name="seller")
            session.add(seller_role)
            await session.commit()
            await session.refresh(seller_role)

        admin_user = User(
            username="admin",
            email="admin@example.com",
            password=get_password_hash("admin"),
            firstname="Admin",
            lastname="Admin",
            telegram_username="admin",
            role_id=admin_role.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            active=True,
        )

        seller_user = User(
            username="seller",
            email="seller@example.com",
            password=get_password_hash("seller"),
            firstname="Seller",
            lastname="Seller",
            telegram_username="seller",
            role_id=seller_role.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            active=True,
        )

        session.add_all([admin_user, seller_user])
        await session.commit()

        test_emails = {"admin@example.com", "seller@example.com"}
        result = await session.execute(
            select(User)
            .options(selectinload(User.role))
            .where(User.email.in_(test_emails))
        )
        users = result.scalars().all()
        print("Тестовые юзеры:")
        for user in users:
            role_name = user.role.name if user.role else "N/A"
            print(
                f"ID: {user.id}, Ник: {user.username}, Пароль: тот же, что и ник, "
                f"Почта: {user.email}, Роль: {role_name}"
            )


if __name__ == "__main__":
    asyncio.run(test_users())
