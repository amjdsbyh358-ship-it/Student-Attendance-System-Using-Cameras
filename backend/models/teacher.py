from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from backend.database import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=True
    )

    department = Column(
        String(100),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )