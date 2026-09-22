import cv2
import sys

from datetime import datetime

from backend.database import SessionLocal

from backend.models.student import Student
from backend.models.attendance import Attendance
from backend.models.enrollment import Enrollment


MODEL_PATH = "models/face_model.yml"

CONFIDENCE_THRESHOLD = 60

REQUIRED_CONFIRMATIONS = 5


# ==========================================
# تسجيل الحضور
# ==========================================

def mark_attendance(
    db,
    student_id,
    section_id
):

    now = datetime.now()

    current_date = now.strftime(
        "%Y-%m-%d"
    )

    current_time = now.strftime(
        "%H:%M:%S"
    )

    # التأكد أن الطالب مسجل في الشعبة
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.section_id == section_id
        )
        .first()
    )

    if not enrollment:

        return {
            "success": False,
            "message": "Student is not enrolled in this section"
        }

    # منع تسجيل الحضور مرتين في نفس اليوم
    existing = (
        db.query(Attendance)
        .filter(
            Attendance.student_id == student_id,
            Attendance.section_id == section_id,
            Attendance.attendance_date == current_date
        )
        .first()
    )

    if existing:

        return {
            "success": False,
            "already_exists": True,
            "message": "Attendance already recorded",
            "attendance": existing
        }

    attendance = Attendance(
        student_id=student_id,
        section_id=section_id,
        attendance_date=current_date,
        attendance_time=current_time,
        status="present"
    )

    db.add(attendance)

    db.commit()

    db.refresh(attendance)

    return {
        "success": True,
        "already_exists": False,
        "message": "Attendance recorded successfully",
        "attendance": attendance
    }


# ==========================================
# التعرف على الوجه
# ==========================================

def recognize_faces(section_id):

    print()
    print("========================================")
    print("Face Recognition Attendance System")
    print("========================================")
    print(
        f"Current Section ID: {section_id}"
    )
    print("Press Q to exit")
    print("========================================")
    print()

    # تحميل نموذج التعرف
    recognizer = (
        cv2.face.LBPHFaceRecognizer_create()
    )

    try:

        recognizer.read(
            MODEL_PATH
        )

    except Exception as e:

        print(
            "Could not load face model:"
        )

        print(e)

        return

    # كاشف الوجه
    face_detector = cv2.CascadeClassifier(
        cv2.data.haarcascades
        + "haarcascade_frontalface_default.xml"
    )

    # الكاميرا
    camera = cv2.VideoCapture(0)

    if not camera.isOpened():

        print(
            "Could not open camera"
        )

        return

    db = SessionLocal()

    last_student_id = None

    confirmation_count = 0

    recorded_students = set()

    try:

        while True:

            ret, frame = camera.read()

            if not ret:

                print(
                    "Could not read camera"
                )

                break

            gray = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2GRAY
            )

            faces = face_detector.detectMultiScale(
                gray,
                scaleFactor=1.2,
                minNeighbors=5,
                minSize=(100, 100)
            )

            for (x, y, w, h) in faces:

                face = gray[
                    y:y + h,
                    x:x + w
                ]

                student_id, confidence = (
                    recognizer.predict(face)
                )

                # ==================================
                # وجه معروف
                # ==================================

                if confidence < CONFIDENCE_THRESHOLD:

                    student = (
                        db.query(Student)
                        .filter(
                            Student.id == student_id
                        )
                        .first()
                    )

                    if not student:

                        last_student_id = None
                        confirmation_count = 0

                        continue

                    # ==================================
                    # التأكد من التسجيل في الشعبة
                    # ==================================

                    enrollment = (
                        db.query(Enrollment)
                        .filter(
                            Enrollment.student_id ==
                            student.id,

                            Enrollment.section_id ==
                            section_id
                        )
                        .first()
                    )

                    if not enrollment:

                        last_student_id = None
                        confirmation_count = 0

                        cv2.rectangle(
                            frame,
                            (x, y),
                            (x + w, y + h),
                            (0, 0, 255),
                            2
                        )

                        cv2.putText(
                            frame,
                            "Not Enrolled",
                            (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.7,
                            (0, 0, 255),
                            2
                        )

                        cv2.putText(
                            frame,
                            student.full_name,
                            (x, y + h + 25),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.6,
                            (0, 0, 255),
                            2
                        )

                        continue

                    # ==================================
                    # الطالب مسجل في الشعبة
                    # ==================================

                    if student.id in recorded_students:

                        cv2.rectangle(
                            frame,
                            (x, y),
                            (x + w, y + h),
                            (0, 255, 0),
                            2
                        )

                        cv2.putText(
                            frame,
                            "Attendance Recorded",
                            (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.7,
                            (0, 255, 0),
                            2
                        )

                        continue

                    # ==================================
                    # تأكيد التعرف 5 مرات
                    # ==================================

                    if last_student_id == student.id:

                        confirmation_count += 1

                    else:

                        last_student_id = student.id

                        confirmation_count = 1

                    # مربع أخضر
                    cv2.rectangle(
                        frame,
                        (x, y),
                        (x + w, y + h),
                        (0, 255, 0),
                        2
                    )

                    cv2.putText(
                        frame,
                        student.full_name,
                        (x, y - 35),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        (0, 255, 0),
                        2
                    )

                    cv2.putText(
                        frame,
                        f"Confidence: {confidence:.1f}",
                        (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 0),
                        2
                    )

                    cv2.putText(
                        frame,
                        f"Confirming: {confirmation_count}/{REQUIRED_CONFIRMATIONS}",
                        (x, y + h + 25),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 0),
                        2
                    )

                    # ==================================
                    # تسجيل الحضور
                    # ==================================

                    if (
                        confirmation_count
                        >= REQUIRED_CONFIRMATIONS
                    ):

                        result = mark_attendance(
                            db,
                            student.id,
                            section_id
                        )

                        if result["success"]:

                            recorded_students.add(
                                student.id
                            )

                            print(
                                f"Attendance recorded: "
                                f"{student.full_name}"
                            )

                            cv2.putText(
                                frame,
                                "ATTENDANCE RECORDED",
                                (x, y + h + 50),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.7,
                                (0, 255, 0),
                                2
                            )

                        elif result.get(
                            "already_exists"
                        ):

                            recorded_students.add(
                                student.id
                            )

                            cv2.putText(
                                frame,
                                "ALREADY RECORDED",
                                (x, y + h + 50),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.7,
                                (0, 255, 0),
                                2
                            )

                        confirmation_count = 0

                # ==================================
                # وجه غير معروف
                # ==================================

                else:

                    last_student_id = None

                    confirmation_count = 0

                    cv2.rectangle(
                        frame,
                        (x, y),
                        (x + w, y + h),
                        (0, 0, 255),
                        2
                    )

                    cv2.putText(
                        frame,
                        "Unknown",
                        (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.8,
                        (0, 0, 255),
                        2
                    )

            cv2.imshow(
                "Face Recognition",
                frame
            )

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):

                break

    finally:

        camera.release()

        cv2.destroyAllWindows()

        db.close()


# ==========================================
# تشغيل البرنامج
# ==========================================

if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(
            "Usage: python -m "
            "backend.computer_vision.recognize_faces "
            "<section_id>"
        )

        sys.exit(1)

    section_id = int(
        sys.argv[1]
    )

    recognize_faces(
        section_id
    )