from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine, Base
from backend.routers.students import router as students_router
from backend.routers.attendance import router as attendance_router
from backend.routers.teachers import router as teachers_router
from backend.routers.courses import router as courses_router
from backend.routers.course_sections import router as course_sections_router
from backend.routers.enrollments import router as enrollments_router

from backend.models.user import User
from backend.models.student import Student
from backend.models.attendance import Attendance

from backend.models.teacher import Teacher
from backend.models.course import Course
from backend.models.course_section import CourseSection
from backend.models.enrollment import Enrollment


app = FastAPI(
    title="Student Attendance System",
    description="University Student Attendance System Using Face Recognition",
    version="1.0.0"
)


# إنشاء جداول قاعدة البيانات
Base.metadata.create_all(bind=engine)


# السماح للواجهة الأمامية بالاتصال بالـ API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(students_router)
app.include_router(attendance_router)
app.include_router(teachers_router)
app.include_router(courses_router)
app.include_router(course_sections_router)
app.include_router(enrollments_router)


@app.get("/")
def root():
    return {
        "message": "Student Attendance System API is running"
    }


@app.get("/database-test")
def database_test():
    return {
        "message": "Database connection configured successfully"
    }