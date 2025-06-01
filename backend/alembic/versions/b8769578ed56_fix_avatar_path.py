"""Fix avatar path

Revision ID: b8769578ed56
Revises: 8d86c4692d19
Create Date: 2025-06-01 21:52:20.215928

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8769578ed56'
down_revision: Union[str, None] = '8d86c4692d19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'users',
        'avatar',
        existing_type=sa.String(length=1000),
        server_default='/static/avatars/default.png',
        existing_nullable=True
    )


def downgrade() -> None:
    op.alter_column(
        'users',
        'avatar',
        existing_type=sa.String(length=1000),
        server_default='/avatars/default.png',
        existing_nullable=True
    )
