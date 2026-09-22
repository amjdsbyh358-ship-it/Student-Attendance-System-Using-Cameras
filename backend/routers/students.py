from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import os
import shutil
import subprocess
import sys

from backend.database import get_db

from backend.models.student import Student

from backend.schemas.student import (
    StudentCreate,
    StudentResponse
)

from backend.computer_vision.train_model import (
    train_model
)


router = APIRouter(
    prefix="/api/students",
    tags=["Students"]
)


# =========================================================
# إضافة طالب
# =========================================================

@router.post(
    "/",
    response_model=StudentResponse
)
def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db)
):

    existing_student = (
        db.query(Student)
        .filter(
            Student.student_number
            == student_data.student_number
        )
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=400,
            detail="Student number already exists"
        )

    if student_data.email:

        existing_email = (
            db.query(Student)
            .filter(
                Student.email
                == student_data.email
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    new_student = Student(
        student_number=student_data.student_number,
        full_name=student_data.full_name,
        email=student_data.email,
        phone=student_data.phone,
        department=student_data.department,
        level=student_data.level
    )

    db.add(new_student)

    db.commit()

    db.refresh(new_student)

    return new_student


# =========================================================
# جلب جميع الطلاب
# =========================================================

@router.get(
    "/",
    response_model=list[StudentResponse]
)
def get_students(
    db: Session = Depends(get_db)
):

    students = (
        db.query(Student)
        .order_by(Student.id.asc())
        .all()
    )

    return students


# =========================================================
# جلب طالب واحد
# =========================================================

@router.get(
    "/{student_id}",
    response_model=StudentResponse
)
def get_student(
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
            detail="Student not found"
        )

    return student


# =========================================================
# تعديل طالب
# =========================================================

@router.put(
    "/{student_id}",
    response_model=StudentResponse
)
def update_student(
    student_id: int,
    student_data: StudentCreate,
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
            detail="Student not found"
        )

    duplicate_number = (
        db.query(Student)
        .filter(
            Student.student_number
            == student_data.student_number,
            Student.id != student_id
        )
        .first()
    )

    if duplicate_number:

        raise HTTPException(
            status_code=400,
            detail="Student number already exists"
        )

    if student_data.email:

        duplicate_email = (
            db.query(Student)
            .filter(
                Student.email
                == student_data.email,
                Student.id != student_id
            )
            .first()
        )

        if duplicate_email:

            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    student.student_number = (
        student_data.student_number
    )

    student.full_name = (
        student_data.full_name
    )

    student.email = (
        student_data.email
    )

    student.phone = (
        student_data.phone
    )

    student.department = (
        student_data.department
    )

    student.level = (
        student_data.level
    )

    db.commit()

    db.refresh(student)

    return student


# =========================================================
# حذف طالب
# =========================================================

@router.delete(
    "/{student_id}"
)
def delete_student(
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
            detail="Student not found"
        )

    # حذف صور الوجه
    student_folder = os.path.join(
        "dataset",
        str(student_id)
    )

    if os.path.exists(student_folder):

        shutil.rmtree(
            student_folder
        )

    db.delete(student)

    db.commit()

    # إعادة تدريب النموذج
    training_success = train_model()

    if not training_success:

        return {
            "message":
                "تم حذف الطالب بنجاح"
                "No training data remains."
        }

    return {
        "message":
            "تم حذف الطالب بنجاح",

        "student_id":
            student_id
    }


# =========================================================
# تشغيل تصوير وجه الطالب
# =========================================================

@router.post(
    "/{student_id}/capture-face"
)
def capture_face(
    student_id: int,
    db: Session = Depends(get_db)
):

    # -----------------------------------------
    # البحث عن الطالب
    # -----------------------------------------

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
            detail="Student not found"
        )

    # -----------------------------------------
    # تشغيل برنامج التصوير
    # في عملية مستقلة
    # -----------------------------------------

    try:

        process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "backend.computer_vision.capture_faces",
                str(student_id)
            ],
            cwd=os.getcwd()
        )

        return {
            "message":
                "Camera started successfully",

            "student_id":
                student.id,

            "student_name":
                student.full_name,

            "process_id":
                process.pid
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# حذف وجه الطالب
# =========================================================

@router.delete(
    "/{student_id}/face"
)
def delete_student_face(
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
            detail="Student not found"
        )

    student_folder = os.path.join(
        "dataset",
        str(student_id)
    )

    if os.path.exists(student_folder):

        shutil.rmtree(
            student_folder
        )

    # إعادة تدريب النموذج
    training_success = train_model()

    if not training_success:

        return {
            "message":
                "Face data deleted, "
                "but no training data remains"
        }

    return {

        "message":
            "Student face data deleted successfully",

        "student_id":
            student.id,

        "student_name":
            student.full_name
    }