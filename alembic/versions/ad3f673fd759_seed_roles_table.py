"""Seed roles table

Revision ID: ad3f673fd759
Revises: e574de3ab6ff
Create Date: 2025-04-01 15:39:24.818185

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'ad3f673fd759'
down_revision: Union[str, None] = 'e574de3ab6ff'
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
