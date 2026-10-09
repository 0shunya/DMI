"""create jobs table

Revision ID: 0001_create_jobs
Revises:
Create Date: 2026-10-09
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_create_jobs"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("job_url", sa.String(length=2048), nullable=False),
        sa.Column("date_posted", sa.String(length=100), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=False),
        sa.Column("first_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("job_url", name="uq_jobs_job_url"),
    )


def downgrade() -> None:
    op.drop_table("jobs")
