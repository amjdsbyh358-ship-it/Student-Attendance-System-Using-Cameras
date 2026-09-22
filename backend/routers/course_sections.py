from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.course import Course
from backend.models.teacher import Teacher
from backend.models.course_section import CourseSection
from backend.schemas.course_section import (
    CourseSectionCreate,
    CourseSectionResponse
)


router = APIRouter(
    prefix="/api/course-sections",
    tags=["Course Sections"]
)


# ==========================================
# إنشاء شعبة جديدة
# ==========================================

@router.post(
    "/",
    response_model=CourseSectionResponse
)
def create_section(
    section_data: CourseSectionCreate,
    db: Session = Depends(get_db)
):

    # التحقق من وجود المقرر
    course = (
        db.query(Course)
        .filter(
            Course.id == section_data.course_id
        )
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    # التحقق من وجود الدكتور
    teacher = (
        db.query(Teacher)
        .filter(
            Teacher.id == section_data.teacher_id
        )
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    # تحويل وقت البداية
    start_time = None

    if section_data.start_time:

        try:
            start_time = datetime.strptime(
                section_data.start_time,
                "%H:%M"
            ).time()

        except ValueError:

            raise HTTPException(
                status_code=400,
                detail="Invalid start_time. Use HH:MM"
            )

    # تحويل وقت النهاية
    end_time = None

    if section_data.end_time:

        try:
            end_time = datetime.strptime(
                section_data.end_time,
                "%H:%M"
            ).time()

        except ValueError:

            raise HTTPException(
                status_code=400,
                detail="Invalid end_time. Use HH:MM"
            )

    # إنشاء الشعبة
    section = CourseSection(
        course_id=section_data.course_id,
        teacher_id=section_data.teacher_id,
        section_name=section_data.section_name,
        room=section_data.room,
        day=section_data.day,
        start_time=start_time,
        end_time=end_time
    )

    db.add(section)
    db.commit()
    db.refresh(section)

    return section


# ==========================================
# عرض جميع الشُعب
# ==========================================

@router.get("/")
def get_sections(
    db: Session = Depends(get_db)
):

    sections = (
        db.query(CourseSection)
        .order_by(
            CourseSection.id.desc()
        )
        .all()
    )

    result = []

    for section in sections:

        course = (
            db.query(Course)
            .filter(
                Course.id == section.course_id
            )
            .first()
        )

        teacher = (
            db.query(Teacher)
            .filter(
                Teacher.id == section.teacher_id
            )
            .first()
        )

        result.append({
            "id": section.id,

            "course_id": section.course_id,
            "course_code": (
                course.course_code
                if course
                else None
            ),
            "course_name": (
                course.course_name
                if course
                else None
            ),

            "teacher_id": section.teacher_id,
            "teacher_name": (
                teacher.full_name
                if teacher
                else None
            ),

            "section_name": section.section_name,

            "room": section.room,

            "day": section.day,

            "start_time": (
                section.start_time.strftime("%H:%M")
                if section.start_time
                else None
            ),

            "end_time": (
                section.end_time.strftime("%H:%M")
                if section.end_time
                else None
            )
        })

    return result


# ==========================================
# عرض شعبة واحدة
# ==========================================

@router.get("/{section_id}")
def get_section(
    section_id: int,
    db: Session = Depends(get_db)
):

    section = (
        db.query(CourseSection)
        .filter(
            CourseSection.id == section_id
        )
        .first()
    )

    if not section:

        raise HTTPException(
            status_code=404,
            detail="Section not found"
        )

    course = (
        db.query(Course)
        .filter(
            Course.id == section.course_id
        )
        .first()
    )

    teacher = (
        db.query(Teacher)
        .filter(
            Teacher.id == section.teacher_id
        )
        .first()
    )

    return {
        "id": section.id,

        "course_id": section.course_id,
        "course_code": (
            course.course_code
            if course
            else None
        ),
        "course_name": (
            course.course_name
            if course
            else None
        ),

        "teacher_id": section.teacher_id,
        "teacher_name": (
            teacher.full_name
            if teacher
            else None
        ),

        "section_name": section.section_name,

        "room": section.room,

        "day": section.day,

        "start_time": (
            section.start_time.strftime("%H:%M")
            if section.start_time
            else None
        ),

        "end_time": (
            section.end_time.strftime("%H:%M")
            if section.end_time
            else None
        )
    }

# ==========================================
# تعديل شعبة
# ==========================================

@router.put("/{section_id}")
def update_section(
    section_id: int,
    section_data: CourseSectionCreate,
    db: Session = Depends(get_db)
):

    # البحث عن الشعبة

    section = (
        db.query(CourseSection)
        .filter(
            CourseSection.id == section_id
        )
        .first()
    )

    if not section:

        raise HTTPException(
            status_code=404,
            detail="Section not found"
        )


    # التحقق من وجود المقرر

    course = (
        db.query(Course)
        .filter(
            Course.id == section_data.course_id
        )
        .first()
    )

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )


    # التحقق من وجود الدكتور

    teacher = (
        db.query(Teacher)
        .filter(
            Teacher.id == section_data.teacher_id
        )
        .first()
    )

    if not teacher:

        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )


    # تحويل وقت البداية

    start_time = None

    if section_data.start_time:

        try:

            start_time = datetime.strptime(
                section_data.start_time,
                "%H:%M"
            ).time()

        except ValueError:

            raise HTTPException(
                status_code=400,
                detail="Invalid start_time. Use HH:MM"
            )


    # تحويل وقت النهاية

    end_time = None

    if section_data.end_time:

        try:

            end_time = datetime.strptime(
                section_data.end_time,
                "%H:%M"
            ).time()

        except ValueError:

            raise HTTPException(
                status_code=400,
                detail="Invalid end_time. Use HH:MM"
            )


    # تحديث بيانات الشعبة

    section.course_id = section_data.course_id

    section.teacher_id = section_data.teacher_id

    section.section_name = section_data.section_name

    section.room = section_data.room

    section.day = section_data.day

    section.start_time = start_time

    section.end_time = end_time


    db.commit()

    db.refresh(section)


    return {
        "id": section.id,

        "course_id": section.course_id,

        "course_code": course.course_code,

        "course_name": course.course_name,

        "teacher_id": section.teacher_id,

        "teacher_name": teacher.full_name,

        "section_name": section.section_name,

        "room": section.room,

        "day": section.day,

        "start_time": (
            section.start_time.strftime("%H:%M")
            if section.start_time
            else None
        ),

        "end_time": (
            section.end_time.strftime("%H:%M")
            if section.end_time
            else None
        )
    }

# ==========================================
# حذف شعبة
# ==========================================

@router.delete("/{section_id}")
def delete_section(
    section_id: int,
    db: Session = Depends(get_db)
):

    section = (
        db.query(CourseSection)
        .filter(
            CourseSection.id == section_id
        )
        .first()
    )

    if not section:

        raise HTTPException(
            status_code=404,
            detail="Section not found"
        )

    db.delete(section)
    db.commit()

    return {
        "message": "Section deleted successfully"
    }