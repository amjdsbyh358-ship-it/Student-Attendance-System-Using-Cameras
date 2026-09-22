import cv2


def start_camera():

    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        print("خطأ: تعذر فتح الكاميرا")
        return

    face_detector = cv2.CascadeClassifier(
        cv2.data.haarcascades +
        "haarcascade_frontalface_default.xml"
    )

    print("تم تشغيل الكاميرا بنجاح")
    print("اضغط على Q للخروج")

    while True:

        success, frame = camera.read()

        if not success:
            print("خطأ: تعذر قراءة صورة من الكاميرا")
            break

        gray = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2GRAY
        )

        faces = face_detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(80, 80)
        )

        for (x, y, w, h) in faces:

            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                "تم اكتشاف الوجه",
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )

        cv2.imshow(
            "كاميرا حضور الطلاب",
            frame
        )

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    camera.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    start_camera()