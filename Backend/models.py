from datetime import datetime

from sqlalchemy import DateTime, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        UniqueConstraint("job_url", name="uq_jobs_job_url"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255))
    job_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    date_posted: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(100), default="jobspy")
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
