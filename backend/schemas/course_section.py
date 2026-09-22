from pydantic import BaseModel
from typing import Optional


class CourseSectionCreate(BaseModel):
    course_id: int
    teacher_id: int
    section_name: str
    room: Optional[str] = None
    day: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None


class CourseSectionResponse(BaseModel):
    id: int
    course_id: int
    teacher_id: int
    section_name: str
    room: Optional[str] = None
    day: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

    class Config:
        from_attributes = True