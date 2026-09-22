from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.teacher import Teacher
from backend.schemas.teacher import (
    TeacherCreate,
    TeacherResponse,
    TeacherUpdate
)


router = APIRouter(
    prefix="/api/teachers",
    tags=["Teachers"]
)


@router.post(
    "/",
    response_model=TeacherResponse
)
def create_teacher(
    teacher_data: TeacherCreate,
    db: Session = Depends(get_db)
):

    if teacher_data.email:

        existing = (
            db.query(Teacher)
            .filter(
                Teacher.email == teacher_data.email
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    teacher = Teacher(
        full_name=teacher_data.full_name,
        email=teacher_data.email,
        department=teacher_data.department
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return teacher


@router.get(
    "/",
    response_model=list[TeacherResponse]
)
def get_teachers(
    db: Session = Depends(get_db)
):

    return (
        db.query(Teacher)
        .order_by(Teacher.id.desc())
        .all()
    )


@router.get(
    "/{teacher_id}",
    response_model=TeacherResponse
)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db)
):

    teacher = (
        db.query(Teacher)
        .filter(
            Teacher.id == teacher_id
        )
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    return teacher


@router.delete("/{teacher_id}")
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db)
):

    teacher = (
        db.query(Teacher)
        .filter(
            Teacher.id == teacher_id
        )
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    db.delete(teacher)
    db.commit()

    return {
        "message": "Teacher deleted successfully"
    }

# تأكد أولاً من استيراد TeacherUpdate من schemas:
# from backend.schemas.teacher import TeacherCreate, TeacherResponse, TeacherUpdate

@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(
    teacher_id: int,
    teacher_data: TeacherUpdate,
    db: Session = Depends(get_db)
):
    teacher = (
        db.query(Teacher)
        .filter(Teacher.id == teacher_id)
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    # التحقق من عدم تكرار البريد عند تغييره
    if teacher_data.email and teacher_data.email != teacher.email:
        existing = (
            db.query(Teacher)
            .filter(Teacher.email == teacher_data.email)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    # تحديث الحقول المرسلة فقط
    update_data = teacher_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(teacher, key, value)

    db.commit()
    db.refresh(teacher)

    return teacher