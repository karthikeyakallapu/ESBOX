"""add google oauth

Revision ID: d647eac6a819
Revises: feccd9a18d58
Create Date: 2026-03-01 22:16:10.913842
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision: str = 'd647eac6a819'
down_revision: Union[str, Sequence[str], None] = 'feccd9a18d58'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
   # Add provider with temporary default
    op.add_column(
        'users',
        sa.Column(
            'provider',
            sa.String(),
            nullable=False,
            server_default='local'
        )
    )

    #  Add provider_id as nullable (local users don't have one)
    op.add_column(
        'users',
        sa.Column(
            'provider_id',
            sa.String(),
            nullable=True
        )
    )

    # Make password nullable (Google users won’t have password)
    op.alter_column(
        'users',
        'password',
        existing_type=sa.VARCHAR(),
        nullable=True
    )

    #  Remove default so future inserts must explicitly set provider
    op.alter_column('users', 'provider', server_default=None)

    #  Add unique constraint ONLY for provider_id
    op.create_unique_constraint(
        'uq_users_provider_id',
        'users',
        ['provider_id']
    )


def downgrade() -> None:
    op.drop_constraint('uq_users_provider_id', 'users', type_='unique')

    op.alter_column(
        'users',
        'password',
        existing_type=sa.VARCHAR(),
        nullable=False
    )

    op.drop_column('users', 'provider_id')
    op.drop_column('users', 'provider')