"""Add versioned dashboard snapshots.

Revision ID: 0003_dashboard_snapshots
Revises: 0002_auth_verification
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_dashboard_snapshots"
down_revision = "0002_auth_verification"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "dashboard_snapshots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("version", name="uq_dashboard_snapshot_version"),
    )
    op.create_index("ix_dashboard_snapshots_version", "dashboard_snapshots", ["version"])
    op.create_index("ix_dashboard_snapshots_is_active", "dashboard_snapshots", ["is_active"])


def downgrade() -> None:
    op.drop_index("ix_dashboard_snapshots_is_active", table_name="dashboard_snapshots")
    op.drop_index("ix_dashboard_snapshots_version", table_name="dashboard_snapshots")
    op.drop_table("dashboard_snapshots")
