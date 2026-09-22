import cv2
import os
import sys
import time

from backend.database import SessionLocal
from backend.models.student import Student

from backend.computer_vision.train_model import (
    train_model
)


# ============================================
# الإعدادات
# ============================================

DATASET_DIR = "dataset"
IMAGE_COUNT = 30
CAPTURE_DELAY = 0.3  # التأخير بالثواني بين كل لقطة والأخرى لتغيير اتجاه الوجه


# التقاط صور وجه الطالب

def capture_student_faces(student_id: int):

    db = SessionLocal()

    try:

        # ========================================
        # البحث عن الطالب
        # ========================================

        student = (
            db.query(Student)
            .filter(
                Student.id == student_id
            )
            .first()
        )

        if not student:

            print(
                "Student not found"
            )

            return False

        # ========================================
        # مجلد الطالب
        # ========================================

        student_folder = os.path.join(
            DATASET_DIR,
            str(student.id)
        )

        os.makedirs(
            student_folder,
            exist_ok=True
        )

        # ========================================
        # حذف الصور القديمة
        # ========================================

        for file_name in os.listdir(
            student_folder
        ):

            file_path = os.path.join(
                student_folder,
                file_name
            )

            if os.path.isfile(
                file_path
            ):

                os.remove(
                    file_path
                )

        # ========================================
        # تشغيل الكاميرا
        # ========================================

        camera = cv2.VideoCapture(
            0,
            cv2.CAP_DSHOW
        )

        camera.set(
            cv2.CAP_PROP_FRAME_WIDTH,
            640
        )

        camera.set(
            cv2.CAP_PROP_FRAME_HEIGHT,
            480
        )

        # ========================================
        # التأكد من الكاميرا
        # ========================================

        if not camera.isOpened():

            print()
            print(
                "Could not open camera"
            )
            print()

            return False

        # ========================================
        # تحميل Face Detector
        # ========================================

        face_detector = cv2.CascadeClassifier(
            cv2.data.haarcascades +
            "haarcascade_frontalface_default.xml"
        )

        if face_detector.empty():

            print(
                "Could not load face detector"
            )

            camera.release()

            return False

        # ========================================
        # بدء التصوير
        # ========================================

        count = 0

        print()
        print("================================")
        print("Starting Face Capture")
        print("================================")
        print(
            f"Student: {student.full_name}"
        )
        print(
            f"Student ID: {student.id}"
        )
        print(
            f"Required Images: {IMAGE_COUNT}"
        )
        print()
        print(
            "Look at the camera"
        )
        print(
            "حرك وجهك ببطء لالتقاط جميع الزوايا"
        )
        print(
            "Press Q to cancel"
        )
        print("================================")
        print()

        while True:

            ret, frame = camera.read()

            # ------------------------------------
            # فشل قراءة الكاميرا
            # ------------------------------------

            if not ret or frame is None:

                print(
                    "تعذر قراءة اطار الكاميرا"
                )

                break

            # ------------------------------------
            # تحويل الصورة إلى رمادي للاكتشاف فقط
            # ------------------------------------

            gray = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2GRAY
            )

            # ------------------------------------
            # اكتشاف الوجه
            # ------------------------------------

            faces = face_detector.detectMultiScale(
                gray,
                scaleFactor=1.3,
                minNeighbors=5,
                minSize=(80, 80)
            )

            # ------------------------------------
            # حفظ الوجه ملون
            # ------------------------------------

            for (x, y, w, h) in faces:

                if count >= IMAGE_COUNT:

                    break

                # اقتطاع الوجه الملون من frame بدلاً من gray
                face_color = frame[
                    y:y + h,
                    x:x + w
                ]

                if face_color.size == 0:

                    continue

                count += 1

                image_path = os.path.join(
                    student_folder,
                    f"{count}.jpg"
                )

                cv2.imwrite(
                    image_path,
                    face_color
                )

                # --------------------------------
                # رسم مربع الوجه
                # --------------------------------

                cv2.rectangle(
                    frame,
                    (x, y),
                    (x + w, y + h),
                    (0, 255, 0),
                    2
                )

                # --------------------------------
                # عرض العداد
                # --------------------------------

                cv2.putText(
                    frame,
                    f"Images: {count}/{IMAGE_COUNT}",
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2
                )

                # --------------------------------
                # مهلة زمنيّة لتأخير التقاط اللقطة التالية
                # --------------------------------
                cv2.imshow(
                    "Capture Student Face",
                    frame
                )
                cv2.waitKey(1)
                time.sleep(CAPTURE_DELAY)

            # ------------------------------------
            # عرض الكاميرا
            # ------------------------------------

            cv2.imshow(
                "Capture Student Face",
                frame
            )

            key = cv2.waitKey(1) & 0xFF

            # ------------------------------------
            # Q للخروج
            # ------------------------------------

            if key == ord("q"):

                break

            # ------------------------------------
            # انتهاء التصوير
            # ------------------------------------

            if count >= IMAGE_COUNT:

                break

        # ========================================
        # إغلاق الكاميرا
        # ========================================

        camera.release()

        cv2.destroyAllWindows()

        # ========================================
        # نتيجة التصوير
        # ========================================

        print()
        print("================================")
        print(
            f"Captured {count} images"
        )
        print("================================")
        print()

        # ========================================
        # التأكد من اكتمال الصور
        # ========================================

        if count < IMAGE_COUNT:

            print(
                "Face capture was not completed."
            )

            return False

        # ========================================
        # تدريب النموذج تلقائيًا
        # ========================================

        print()
        print("================================")
        print("Starting Automatic Training")
        print("================================")
        print()

        training_success = train_model()

        if not training_success:

            print()
            print(
                "Face captured successfully, "
                "but model training failed."
            )

            return False

        # ========================================
        # النجاح
        # ========================================

        print()
        print("================================")
        print("Face Registration Completed")
        print("================================")
        print(
            f"Student: {student.full_name}"
        )
        print(
            f"Images: {count}"
        )
        print(
            "Model trained successfully"
        )
        print("================================")
        print()

        return True

    finally:

        db.close()


# ============================================
# التشغيل المباشر
# ============================================

if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(
            "Usage:"
        )

        print(
            "python -m "
            "backend.computer_vision.capture_faces "
            "<student_id>"
        )

        sys.exit(1)

    try:

        student_id = int(
            sys.argv[1]
        )

    except ValueError:

        print(
            "Student ID must be a number"
        )

        sys.exit(1)

    success = capture_student_faces(
        student_id
    )

    if success:

        print(
            "Face capture and training completed."
        )

    else:

        print(
            "Face capture failed."
        )