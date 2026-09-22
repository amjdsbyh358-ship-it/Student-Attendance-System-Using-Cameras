import cv2
import os
import numpy as np


# ============================================
# الإعدادات
# ============================================

DATASET_DIR = "dataset"
MODEL_PATH = "models/face_model.yml"


# ============================================
# تدريب نموذج التعرف على الوجه
# ============================================

def train_model():

    print()
    print("========================================")
    print("Starting Face Recognition Model Training")
    print("========================================")
    print()

    # ----------------------------------------
    # التأكد من وجود Dataset
    # ----------------------------------------

    if not os.path.exists(DATASET_DIR):

        print(
            f"Dataset folder not found: "
            f"{DATASET_DIR}"
        )

        return False

    # ----------------------------------------
    # إنشاء LBPH Recognizer
    # ----------------------------------------

    recognizer = (
        cv2.face.LBPHFaceRecognizer_create()
    )

    faces = []
    ids = []

    total_images = 0
    total_students = 0

    # ----------------------------------------
    # قراءة مجلدات الطلاب
    # ----------------------------------------

    student_folders = sorted(
        os.listdir(DATASET_DIR)
    )

    for student_id in student_folders:

        student_folder = os.path.join(
            DATASET_DIR,
            student_id
        )

        if not os.path.isdir(
            student_folder
        ):
            continue

        # التأكد أن اسم المجلد رقم
        try:

            student_id_int = int(
                student_id
            )

        except ValueError:

            print(
                f"Skipping invalid folder: "
                f"{student_id}"
            )

            continue

        print(
            f"Student ID: {student_id_int}"
        )

        student_image_count = 0

        # ------------------------------------
        # قراءة صور الطالب
        # ------------------------------------

        for file_name in sorted(
            os.listdir(student_folder)
        ):

            image_path = os.path.join(
                student_folder,
                file_name
            )

            # تجاهل الملفات غير الصور
            if not file_name.lower().endswith(
                (".jpg", ".jpeg", ".png")
            ):
                continue

            # --------------------------------
            # قراءة الصورة
            # --------------------------------

            image = cv2.imread(
                image_path,
                cv2.IMREAD_GRAYSCALE
            )

            if image is None:

                print(
                    f"Skipping invalid image: "
                    f"{file_name}"
                )

                continue

            # --------------------------------
            # التأكد من أن الصورة غير فارغة
            # --------------------------------

            if image.size == 0:

                print(
                    f"Skipping empty image: "
                    f"{file_name}"
                )

                continue

            # --------------------------------
            # إضافة الصورة
            # --------------------------------

            faces.append(image)

            ids.append(
                student_id_int
            )

            student_image_count += 1
            total_images += 1

        # ------------------------------------
        # نتيجة الطالب
        # ------------------------------------

        if student_image_count > 0:

            total_students += 1

            print(
                f"  Images: "
                f"{student_image_count}"
            )

        else:

            print(
                "  No valid images found"
            )

    # ========================================
    # التأكد من وجود بيانات
    # ========================================

    if len(faces) == 0:

        print()
        print(
            "No valid training images found."
        )
        print()

        return False

    # ========================================
    # معلومات التدريب
    # ========================================

    print()
    print("========================================")
    print("Training Information")
    print("========================================")

    print(
        f"Students: {total_students}"
    )

    print(
        f"Images: {total_images}"
    )

    print()

    # ========================================
    # تحويل Labels إلى NumPy Array
    # ========================================

    labels = np.array(
        ids,
        dtype=np.int32
    )

    # ========================================
    # تدريب النموذج
    # ========================================

    print(
        "Training model..."
    )

    try:

        recognizer.train(
            faces,
            labels
        )

    except Exception as e:

        print()
        print(
            "Model training failed:"
        )

        print(e)

        return False

    # ========================================
    # إنشاء مجلد Models
    # ========================================

    model_directory = os.path.dirname(
        MODEL_PATH
    )

    if model_directory:

        os.makedirs(
            model_directory,
            exist_ok=True
        )

    # ========================================
    # حفظ النموذج
    # ========================================

    try:

        recognizer.write(
            MODEL_PATH
        )

    except Exception as e:

        print()
        print(
            "Could not save model:"
        )

        print(e)

        return False

    # التأكد من وجود النموذج

    if not os.path.exists(
        MODEL_PATH
    ):

        print(
            "Model file was not created."
        )

        return False

    # ========================================
    # النجاح
    # ========================================

    print()
    print("========================================")
    print("Model trained successfully!")
    print("========================================")

    print(
        f"Students: {total_students}"
    )

    print(
        f"Training images: {total_images}"
    )

    print(
        f"Model saved to: {MODEL_PATH}"
    )

    print()

    return True


# ============================================
# التشغيل المباشر
# ============================================

if __name__ == "__main__":

    success = train_model()

    if success:

        print(
            "Training completed successfully."
        )

    else:

        print(
            "Training failed."
        )