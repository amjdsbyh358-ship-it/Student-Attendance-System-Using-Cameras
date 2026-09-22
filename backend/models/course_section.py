from sqlalchemy import Column, Integer, String, Time, DateTime, ForeignKey
from sqlalchemy.sql import func

from backend.database import Base


class CourseSection(Base):
    __tablename__ = "course_sections"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False,
        index=True
    )

    teacher_id = Column(
        Integer,
        ForeignKey("teachers.id"),
        nullable=False,
        index=True
    )

    section_name = Column(
        String(50),
        nullable=False
    )

    room = Column(
        String(50),
        nullable=True
    )

    day = Column(
        String(20),
        nullable=True
    )

    start_time = Column(
        Time,
        nullable=True
    )

    end_time = Column(
        Time,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )