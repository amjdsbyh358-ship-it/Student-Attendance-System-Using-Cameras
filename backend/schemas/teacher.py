from pydantic import BaseModel, EmailStr
from typing import Optional


class TeacherCreate(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    department: Optional[str] = None


class TeacherUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None


class TeacherResponse(TeacherCreate):
    id: int

    class Config:
        from_attributes = True