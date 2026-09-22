from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.course import Course
from backend.schemas.course import (
    CourseCreate,
    CourseResponse,
    CourseUpdate
)


router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)


# ==========================================
# إضافة مقرر
# ==========================================

@router.post(
    "/",
    response_model=CourseResponse
)
def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db)
):

    existing_course = (
        db.query(Course)
        .filter(
            Course.course_code ==
            course_data.course_code
        )
        .first()
    )

    if existing_course:

        raise HTTPException(
            status_code=400,
            detail="Course code already exists"
        )

    course = Course(
        course_code=course_data.course_code,
        course_name=course_data.course_name,
        department=course_data.department,
        level=course_data.level
    )

    db.add(course)
    db.commit()
    db.refresh(course)

    return course


# ==========================================
# جميع المقررات
# ==========================================

@router.get(
    "/",
    response_model=list[CourseResponse]
)
def get_courses(
    db: Session = Depends(get_db)
):

    return (
        db.query(Course)
        .order_by(Course.id.desc())
        .all()
    )


# ==========================================
# مقرر واحد
# ==========================================

@router.get(
    "/{course_id}",
    response_model=CourseResponse
)
def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):

    course = (
        db.query(Course)
        .filter(
            Course.id == course_id
        )
        .first()
    )

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course

# ==========================================
# تعديل مقرر
# ==========================================

@router.put(
    "/{course_id}",
    response_model=CourseResponse
)
def update_course(
    course_id: int,
    course_data: CourseUpdate,
    db: Session = Depends(get_db)
):

    course = (
        db.query(Course)
        .filter(
            Course.id == course_id
        )
        .first()
    )

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    # التحقق من عدم تكرار رمز المقرر

    if (
        course_data.course_code
        and course_data.course_code
        != course.course_code
    ):

        existing_course = (
            db.query(Course)
            .filter(
                Course.course_code
                == course_data.course_code
            )
            .first()
        )

        if existing_course:

            raise HTTPException(
                status_code=400,
                detail="Course code already exists"
            )

    # تحديث البيانات المرسلة فقط

    update_data = course_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            course,
            key,
            value
        )

    db.commit()

    db.refresh(course)

    return course

# ==========================================
# حذف مقرر
# ==========================================

@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db)
):

    course = (
        db.query(Course)
        .filter(
            Course.id == course_id
        )
        .first()
    )

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    db.delete(course)
    db.commit()

    return {
        "message": "Course deleted successfully"
    }