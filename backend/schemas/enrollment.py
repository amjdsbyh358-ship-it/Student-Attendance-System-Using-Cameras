from pydantic import BaseModel


class EnrollmentCreate(BaseModel):
    student_id: int
    section_id: int


class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    section_id: int

    class Config:
        from_attributes = True