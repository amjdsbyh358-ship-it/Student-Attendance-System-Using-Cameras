from pydantic import BaseModel
from typing import Optional


class CourseCreate(BaseModel):

    course_code: str
    course_name: str
    department: Optional[str] = None
    level: Optional[str] = None


class CourseUpdate(BaseModel):

    course_code: Optional[str] = None
    course_name: Optional[str] = None
    department: Optional[str] = None
    level: Optional[str] = None


class CourseResponse(CourseCreate):

    id: int

    class Config:
        from_attributes = True