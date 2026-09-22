from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from backend.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

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

    attendance_date = Column(
        String(10),
        nullable=False,
        index=True
    )

    attendance_time = Column(
        String(8),
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default="present"
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )