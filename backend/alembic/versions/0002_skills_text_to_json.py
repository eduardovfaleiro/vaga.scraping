"""skills: TEXT to JSON

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON
import json

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adiciona coluna JSON temporária
    op.add_column("users", sa.Column("skills_json", JSON, nullable=True))

    # Converte dados existentes: "python, django" → ["python", "django"]
    conn = op.get_bind()
    users = conn.execute(sa.text("SELECT id, skills FROM users WHERE skills IS NOT NULL")).fetchall()
    for user_id, skills_text in users:
        skills_list = [s.strip() for s in skills_text.split(",") if s.strip()]
        conn.execute(
            sa.text("UPDATE users SET skills_json = :skills WHERE id = :id"),
            {"skills": json.dumps(skills_list), "id": user_id},
        )

    # Remove coluna antiga e renomeia a nova
    op.drop_column("users", "skills")
    op.alter_column("users", "skills_json", new_column_name="skills")


def downgrade() -> None:
    op.add_column("users", sa.Column("skills_text", sa.Text(), nullable=True))

    conn = op.get_bind()
    users = conn.execute(sa.text("SELECT id, skills FROM users WHERE skills IS NOT NULL")).fetchall()
    for user_id, skills_json in users:
        skills_list = skills_json if isinstance(skills_json, list) else json.loads(skills_json)
        conn.execute(
            sa.text("UPDATE users SET skills_text = :skills WHERE id = :id"),
            {"skills": ", ".join(skills_list), "id": user_id},
        )

    op.drop_column("users", "skills")
    op.alter_column("users", "skills_text", new_column_name="skills")
