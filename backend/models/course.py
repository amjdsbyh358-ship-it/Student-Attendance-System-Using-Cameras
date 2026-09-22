from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from backend.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    course_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    course_name = Column(
        String(150),
        nullable=False
    )

    department = Column(
        String(100),
        nullable=True
    )

    level = Column(
        String(50),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )