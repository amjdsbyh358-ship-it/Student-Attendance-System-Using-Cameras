from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from backend.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False,
        index=True
    )

    section_id = Column(
        Integer,
        ForeignKey("course_sections.id"),
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )