const API_URL = "http://127.0.0.1:8000";

let coursesList = [];


document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("courseForm");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            await saveCourse();
        });
    }

    await loadCourses();

});


async function loadCourses() {

    const tableBody = document.getElementById("coursesTable");

    if (!tableBody) return;

    try {

        const response = await fetch(
            `${API_URL}/api/courses/`
        );

        if (!response.ok) {
            throw new Error("فشل تحميل المقررات");
        }

        coursesList = await response.json();

        if (coursesList.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        لا توجد مقررات مسجلة حالياً
                    </td>
                </tr>
            `;

            return;
        }


        let html = "";

        coursesList.forEach((course, index) => {

            html += `
                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(course.course_code || "-")}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(course.course_name || "-")}
                    </td>

                    <td>
                        ${escapeHtml(course.department || "-")}
                    </td>

                    <td>
                        ${escapeHtml(course.level || "-")}
                    </td>

                    <td>

                        <button
                            class="edit-button"
                            onclick="editCourse(${course.id})"
                        >
                            تعديل
                        </button>

                        <button
                            class="danger-button"
                            onclick="deleteCourse(${course.id})"
                        >
                            حذف
                        </button>

                    </td>

                </tr>
            `;

        });

        tableBody.innerHTML = html;

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="color:red;">
                    ${error.message}
                </td>
            </tr>
        `;

    }

}


async function saveCourse() {

    const id = document.getElementById("courseId").value;

    const courseCode =
        document.getElementById("courseCode")
            .value
            .trim();

    const courseName =
        document.getElementById("courseName")
            .value
            .trim();

    const department =
        document.getElementById("department")
            .value
            .trim();

    const level =
        document.getElementById("level")
            .value
            .trim();


    if (!courseCode || !courseName) {

        showStatus(
            "يرجى إدخال رمز واسم المقرر",
            "red"
        );

        return;
    }


    const payload = {

        course_code: courseCode,

        course_name: courseName,

        department: department || null,

        level: level || null

    };


    const isEdit = Boolean(id);

    const url = isEdit
        ? `${API_URL}/api/courses/${id}`
        : `${API_URL}/api/courses/`;

    const method = isEdit
        ? "PUT"
        : "POST";


    try {

        showStatus(
            "جاري حفظ البيانات...",
            "blue"
        );


        const response = await fetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)

        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "حدث خطأ أثناء حفظ المقرر"
            );

        }


        showStatus(
            isEdit
                ? "تم تعديل المقرر بنجاح"
                : "تم إضافة المقرر بنجاح",
            "green"
        );


        resetForm();

        await loadCourses();


    } catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "red"
        );

    }

}


function editCourse(id) {

    const course =
        coursesList.find(
            item => item.id === id
        );

    if (!course) return;


    document.getElementById("courseId").value =
        course.id;

    document.getElementById("courseCode").value =
        course.course_code || "";

    document.getElementById("courseName").value =
        course.course_name || "";

    document.getElementById("department").value =
        course.department || "";

    document.getElementById("level").value =
        course.level || "";


    document.getElementById("formTitle").innerText =
        "تعديل بيانات المقرر";


    showStatus("", "");

}


async function deleteCourse(id) {

    if (
        !confirm(
            "هل أنت متأكد من رغبتك في حذف هذا المقرر؟"
        )
    ) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/courses/${id}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "فشل حذف المقرر"
            );

        }


        showStatus(
            "تم حذف المقرر بنجاح",
            "green"
        );


        await loadCourses();


    } catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "red"
        );

    }

}


function resetForm() {

    document
        .getElementById("courseForm")
        .reset();


    document.getElementById("courseId").value =
        "";


    document.getElementById("formTitle").innerText =
        "إضافة مقرر جديد";


    showStatus("", "");

}


function showStatus(message, type) {

    const element =
        document.getElementById("message");

    if (!element) return;


    element.textContent = message;


    if (type === "green") {

        element.style.color = "#198754";

    } else if (type === "red") {

        element.style.color = "#dc3545";

    } else {

        element.style.color = "#0d6efd";

    }

}


function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}