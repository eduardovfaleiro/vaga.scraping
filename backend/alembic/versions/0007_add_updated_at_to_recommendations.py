"""add updated_at to recommendations

Revision ID: 0007
Revises: 0006
Create Date: 2026-05-04

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import datetime

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add updated_at
    op.add_column("recommendations", sa.Column("updated_at", sa.DateTime(), nullable=True))
    op.execute("UPDATE recommendations SET updated_at = created_at")
    
    # Update foreign key to include CASCADE
    # For SQLite, this is complex (requires batch mode or recreate table), 
    # but for Postgres we can drop and add constraint.
    # Given the project uses Postgres (from .env.example), we'll do it the Postgres way.
    op.drop_constraint("recommendations_job_id_fkey", "recommendations", type_="foreignkey")
    op.create_foreign_key(
        "recommendations_job_id_fkey",
        "recommendations", "jobs",
        ["job_id"], ["id"],
        ondelete="CASCADE"
    )


def downgrade() -> None:
    op.drop_constraint("recommendations_job_id_fkey", "recommendations", type_="foreignkey")
    op.create_foreign_key(
        "recommendations_job_id_fkey",
        "recommendations", "jobs",
        ["job_id"], ["id"]
    )
    op.drop_column("recommendations", "updated_at")
