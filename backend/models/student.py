from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from backend.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    student_number = Column(
        String(50),
        unique=True,
        nullable=False,
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

    phone = Column(
        String(30),
        nullable=True
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