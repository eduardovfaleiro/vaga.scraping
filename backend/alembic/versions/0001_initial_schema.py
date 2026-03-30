"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-03-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(), nullable=True, index=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("skills", sa.Text(), nullable=True),
        sa.Column("match_threshold", sa.Float(), nullable=True, default=70.0),
        sa.Column("phone", sa.String(), nullable=True),
    )
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(), nullable=True, index=True),
        sa.Column("company", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("url", sa.String(), nullable=True, unique=True),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("posted_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "recommendations",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("job_id", sa.Integer(), sa.ForeignKey("jobs.id"), nullable=True),
        sa.Column("match_score", sa.Float(), nullable=True),
        sa.Column("status", sa.String(), nullable=True, default="pending"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "scrape_history",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("term", sa.String(), nullable=True, index=True, unique=True),
        sa.Column("last_scraped", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("recommendations")
    op.drop_table("scrape_history")
    op.drop_table("jobs")
    op.drop_table("users")
