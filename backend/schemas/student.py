from pydantic import BaseModel, EmailStr
from typing import Optional


class StudentCreate(BaseModel):
    student_number: str
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    level: Optional[str] = None


class StudentResponse(StudentCreate):
    id: int

    class Config:
        from_attributes = True