"""added telegram sessions

Revision ID: 5acbaa57540a
Revises: 2340c8e74086
Create Date: 2026-01-24 15:46:13.157954

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5acbaa57540a'
down_revision: Union[str, Sequence[str], None] = '2340c8e74086'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create telegram_sessions table
    op.create_table(
        'telegram_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('encrypted_session', sa.Text(), nullable=False),
        sa.Column('telegram_user_id', sa.BigInteger(), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.Column('first_name', sa.String(length=100), server_default='', nullable=True),
        sa.Column('last_name', sa.String(length=100), server_default='', nullable=True),
        sa.Column('username', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('has_2fa', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('last_connected', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
        sa.UniqueConstraint('telegram_user_id')
    )
    op.create_index(op.f('ix_telegram_sessions_id'), 'telegram_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_telegram_sessions_telegram_user_id'), 'telegram_sessions', ['telegram_user_id'], unique=True)
    op.create_index(op.f('ix_telegram_sessions_is_active'), 'telegram_sessions', ['is_active'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop telegram_sessions table
    op.drop_index(op.f('ix_telegram_sessions_is_active'), table_name='telegram_sessions')
    op.drop_index(op.f('ix_telegram_sessions_telegram_user_id'), table_name='telegram_sessions')
    op.drop_index(op.f('ix_telegram_sessions_id'), table_name='telegram_sessions')
    op.drop_table('telegram_sessions')
