from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db

from backend.models.student import Student
from backend.models.enrollment import Enrollment
from backend.models.course_section import CourseSection
from backend.models.course import Course
from backend.models.teacher import Teacher

from backend.schemas.enrollment import (
    EnrollmentCreate,
    EnrollmentResponse
)


router = APIRouter(
    prefix="/api/enrollments",
    tags=["Enrollments"]
)


# ==========================================
# تسجيل طالب في شعبة
# ==========================================

@router.post(
    "/",
    response_model=EnrollmentResponse
)
def create_enrollment(
    enrollment_data: EnrollmentCreate,
    db: Session = Depends(get_db)
):

    # التحقق من وجود الطالب

    student = (
        db.query(Student)
        .filter(
            Student.id ==
            enrollment_data.student_id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )


    # التحقق من وجود الشعبة

    section = (
        db.query(CourseSection)
        .filter(
            CourseSection.id ==
            enrollment_data.section_id
        )
        .first()
    )


    if not section:

        raise HTTPException(
            status_code=404,
            detail="Section not found"
        )


    # التحقق من عدم تسجيل الطالب
    # في نفس الشعبة مسبقاً

    existing_enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id ==
            enrollment_data.student_id,

            Enrollment.section_id ==
            enrollment_data.section_id
        )
        .first()
    )


    if existing_enrollment:

        raise HTTPException(
            status_code=400,
            detail="Student is already enrolled in this section"
        )


    # إنشاء التسجيل

    enrollment = Enrollment(
        student_id=
            enrollment_data.student_id,

        section_id=
            enrollment_data.section_id
    )


    db.add(enrollment)

    db.commit()

    db.refresh(enrollment)


    return enrollment


# ==========================================
# عرض جميع التسجيلات
# ==========================================

@router.get("/")
def get_enrollments(
    db: Session = Depends(get_db)
):

    enrollments = (

        db.query(
            Enrollment,
            Student,
            CourseSection,
            Course,
            Teacher
        )

        .join(
            Student,
            Enrollment.student_id ==
            Student.id
        )

        .join(
            CourseSection,
            Enrollment.section_id ==
            CourseSection.id
        )

        .join(
            Course,
            CourseSection.course_id ==
            Course.id
        )

        .join(
            Teacher,
            CourseSection.teacher_id ==
            Teacher.id
        )

        .order_by(
            Enrollment.id.desc()
        )

        .all()
    )


    result = []


    for (
        enrollment,
        student,
        section,
        course,
        teacher
    ) in enrollments:


        result.append({

            "id":
                enrollment.id,


            "student_id":
                student.id,


            "student_number":
                student.student_number,


            "student_name":
                student.full_name,


            "section_id":
                section.id,


            "section_name":
                section.section_name,


            "course_id":
                course.id,


            "course_code":
                course.course_code,


            "course_name":
                course.course_name,


            "teacher_id":
                teacher.id,


            "teacher_name":
                teacher.full_name

        })


    return result


# ==========================================
# عرض تسجيل واحد
# ==========================================

@router.get("/{enrollment_id}")
def get_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db)
):

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.id ==
            enrollment_id
        )
        .first()
    )


    if not enrollment:

        raise HTTPException(
            status_code=404,
            detail="Enrollment not found"
        )


    student = (
        db.query(Student)
        .filter(
            Student.id ==
            enrollment.student_id
        )
        .first()
    )


    section = (
        db.query(CourseSection)
        .filter(
            CourseSection.id ==
            enrollment.section_id
        )
        .first()
    )


    course = (
        db.query(Course)
        .filter(
            Course.id ==
            section.course_id
        )
        .first()
    )


    teacher = (
        db.query(Teacher)
        .filter(
            Teacher.id ==
            section.teacher_id
        )
        .first()
    )


    return {

        "id":
            enrollment.id,


        "student_id":
            student.id,


        "student_number":
            student.student_number,


        "student_name":
            student.full_name,


        "section_id":
            section.id,


        "section_name":
            section.section_name,


        "course_id":
            course.id,


        "course_code":
            course.course_code,


        "course_name":
            course.course_name,


        "teacher_id":
            teacher.id,


        "teacher_name":
            teacher.full_name

    }


# ==========================================
# حذف تسجيل
# ==========================================

@router.delete("/{enrollment_id}")
def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db)
):

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.id ==
            enrollment_id
        )
        .first()
    )


    if not enrollment:

        raise HTTPException(
            status_code=404,
            detail="Enrollment not found"
        )


    db.delete(enrollment)

    db.commit()


    return {
        "message":
            "Enrollment deleted successfully"
    }