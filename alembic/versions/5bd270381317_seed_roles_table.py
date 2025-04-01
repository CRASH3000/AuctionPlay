"""Seed roles table

Revision ID: 5bd270381317
Revises: ad3f673fd759
Create Date: 2025-04-01 15:47:55.515614

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5bd270381317'
down_revision: Union[str, None] = 'ad3f673fd759'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from sqlalchemy import table, column
    from sqlalchemy import String, Integer
    roles_table = table('roles',
                        column('id', Integer),
                        column('name', String)
                        )
    op.bulk_insert(roles_table, [
        {'name': 'guest'},
        {'name': 'user'},
        {'name': 'seller'},
        {'name': 'admin'},
    ])


def downgrade() -> None:
    op.execute("DELETE FROM roles WHERE name IN ('guest', 'user', 'seller', 'admin')")
