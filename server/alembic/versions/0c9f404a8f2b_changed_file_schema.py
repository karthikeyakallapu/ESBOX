"""changed file  schema

Revision ID: 0c9f404a8f2b
Revises: f95c6d478d42
Create Date: 2026-03-06 12:29:07.829804

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0c9f404a8f2b'
down_revision: Union[str, Sequence[str], None] = 'f95c6d478d42'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "user_files",
        "filename",
        new_column_name="name"
    )

    op.alter_column(
        "user_files",
        "file_size",
        new_column_name="size"
    )


def downgrade() -> None:
    op.alter_column(
        "user_files",
        "name",
        new_column_name="filename"
    )

    op.alter_column(
        "user_files",
        "size",
        new_column_name="file_size"
    )