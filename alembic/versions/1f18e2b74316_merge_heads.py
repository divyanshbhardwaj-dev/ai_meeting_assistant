"""merge heads

Revision ID: 1f18e2b74316
Revises: 0340aa11b3df, dc687fee8a00
Create Date: 2026-05-04 10:09:45.832113

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1f18e2b74316'
down_revision: Union[str, Sequence[str], None] = ('0340aa11b3df', 'dc687fee8a00')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
