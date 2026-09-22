from datetime import datetime
import subprocess
import sys

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db

from backend.models.student import Student
from backend.models.attendance import Attendance
from backend.models.course_section import CourseSection
from backend.models.course import Course
from backend.models.teacher import Teacher


router = APIRouter(
    prefix="/api/attendance",
    tags=["الحضور"]
)


recognition_process = None


# ==========================================
# تشغيل كاميرا التعرف على الوجه
# ==========================================

@router.post("/start-camera/{section_id}")
def start_camera(
    section_id: int,
    db: Session = Depends(get_db)
):

    global recognition_process

    # التأكد من وجود الشعبة
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
            detail="الشعبة غير موجودة"
        )

    # التأكد هل الكاميرا تعمل بالفعل
    if recognition_process is not None:

        if recognition_process.poll() is None:

            return {
                "message": "الكاميرا تعمل بالفعل"
            }

    try:

        recognition_process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "backend.computer_vision.recognize_faces",
                str(section_id)
            ]
        )

        return {
            "message": "تم تشغيل كاميرا التعرف على الوجه",
            "section_id": section_id
        }

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="حدث خطأ أثناء تشغيل الكاميرا"
        )


# ==========================================
# إيقاف كاميرا التعرف على الوجه
# ==========================================

@router.post("/stop-camera")
def stop_camera():

    global recognition_process

    if recognition_process is None:

        return {
            "message": "الكاميرا غير قيد التشغيل"
        }

    try:

        if recognition_process.poll() is None:

            recognition_process.terminate()

            recognition_process.wait(
                timeout=5
            )

        recognition_process = None

        return {
            "message": "تم إيقاف كاميرا التعرف على الوجه"
        }

    except Exception:

        recognition_process = None

        raise HTTPException(
            status_code=500,
            detail="حدث خطأ أثناء إيقاف الكاميرا"
        )


# ==========================================
# تسجيل حضور طالب
# ==========================================

@router.post("/{student_id}")
def mark_attendance(
    student_id: int,
    db: Session = Depends(get_db)
):

    student = (
        db.query(Student)
        .filter(
            Student.id == student_id
        )
        .first()
    )

    if not student:

        raise HTTPException(
            status_code=404,
            detail="الطالب غير موجود"
        )

    now = datetime.now()

    current_date = now.strftime(
        "%Y-%m-%d"
    )

    current_time = now.strftime(
        "%H:%M:%S"
    )

    existing_attendance = (
        db.query(Attendance)
        .filter(
            Attendance.student_id == student_id,
            Attendance.attendance_date == current_date
        )
        .first()
    )

    if existing_attendance:

        return {
            "message": "تم تسجيل الحضور مسبقاً",
            "student_id": student.id,
            "student_name": student.full_name,
            "date": current_date,
            "time": existing_attendance.attendance_time,
            "status": existing_attendance.status
        }

    attendance = Attendance(
        student_id=student.id,
        attendance_date=current_date,
        attendance_time=current_time,
        status="present"
    )

    db.add(attendance)

    db.commit()

    db.refresh(attendance)

    return {
        "message": "تم تسجيل الحضور بنجاح",
        "attendance_id": attendance.id,
        "student_id": student.id,
        "student_name": student.full_name,
        "date": current_date,
        "time": current_time,
        "status": attendance.status
    }


# ==========================================
# حضور اليوم
# ==========================================

@router.get("/today")
def get_today_attendance(
    db: Session = Depends(get_db)
):

    today = datetime.now().strftime(
        "%Y-%m-%d"
    )

    records = (
        db.query(Attendance)
        .filter(
            Attendance.attendance_date == today
        )
        .order_by(
            Attendance.id.desc()
        )
        .all()
    )

    result = []

    for attendance in records:

        # ----------------------------------
        # بيانات الطالب
        # ----------------------------------

        student = (
            db.query(Student)
            .filter(
                Student.id == attendance.student_id
            )
            .first()
        )

        # ----------------------------------
        # بيانات الشعبة
        # ----------------------------------

        section = (
            db.query(CourseSection)
            .filter(
                CourseSection.id == attendance.section_id
            )
            .first()
        )

        course = None
        teacher = None

        # ----------------------------------
        # بيانات المقرر والدكتور
        # ----------------------------------

        if section:

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

        # ----------------------------------
        # إضافة السجل
        # ----------------------------------

        result.append({

            "id":
                attendance.id,

            "student_id":
                attendance.student_id,

            "student_number":
                student.student_number
                if student
                else None,

            "student_name":
                student.full_name
                if student
                else None,

            "section_id":
                attendance.section_id,

            "section_name":
                section.section_name
                if section
                else None,

            "course_id":
                section.course_id
                if section
                else None,

            "course_code":
                course.course_code
                if course
                else None,

            "course_name":
                course.course_name
                if course
                else None,

            "teacher_id":
                section.teacher_id
                if section
                else None,

            "teacher_name":
                teacher.full_name
                if teacher
                else None,

            "attendance_date":
                attendance.attendance_date,

            "attendance_time":
                attendance.attendance_time,

            "status":
                attendance.status

        })

    return result


# ==========================================
# إحصائيات الحضور
# ==========================================

@router.get("/statistics")
def get_attendance_statistics(
    db: Session = Depends(get_db)
):

    today = datetime.now().strftime(
        "%Y-%m-%d"
    )

    total_students = (
        db.query(Student).count()
    )

    present_today = (
        db.query(Attendance)
        .filter(
            Attendance.attendance_date == today
        )
        .count()
    )

    absent_today = max(
        total_students - present_today,
        0
    )

    return {

        "total_students":
            total_students,

        "present_today":
            present_today,

        "absent_today":
            absent_today,

        "date":
            today
    }


# ==========================================
# جميع سجلات الحضور
# ==========================================

@router.get("/")
def get_attendance(
    db: Session = Depends(get_db)
):

    records = (
        db.query(Attendance)
        .order_by(
            Attendance.id.desc()
        )
        .all()
    )

    result = []

    for record in records:

        # ----------------------------------
        # بيانات الطالب
        # ----------------------------------

        student = (
            db.query(Student)
            .filter(
                Student.id == record.student_id
            )
            .first()
        )

        # ----------------------------------
        # بيانات الشعبة
        # ----------------------------------

        section = (
            db.query(CourseSection)
            .filter(
                CourseSection.id == record.section_id
            )
            .first()
        )

        course = None
        teacher = None

        # ----------------------------------
        # بيانات المقرر والدكتور
        # ----------------------------------

        if section:

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

        # ----------------------------------
        # إضافة بيانات التقرير
        # ----------------------------------

        result.append({

            "id":
                record.id,

            "student_id":
                record.student_id,

            "student_name":
                student.full_name
                if student
                else "غير معروف",

            "student_number":
                student.student_number
                if student
                else None,

            "section_id":
                record.section_id,

            "section_name":
                section.section_name
                if section
                else None,

            "course_id":
                section.course_id
                if section
                else None,

            "course_code":
                course.course_code
                if course
                else None,

            "course_name":
                course.course_name
                if course
                else None,

            "teacher_id":
                section.teacher_id
                if section
                else None,

            "teacher_name":
                teacher.full_name
                if teacher
                else None,

            "date":
                record.attendance_date,

            "time":
                record.attendance_time,

            "attendance_date":
                record.attendance_date,

            "attendance_time":
                record.attendance_time,

            "status":
                record.status

        })

    return result