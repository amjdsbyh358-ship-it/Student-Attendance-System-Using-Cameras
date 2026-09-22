const API_URL = "http://127.0.0.1:8000";

let sectionsList = [];
let coursesList = [];
let teachersList = [];


document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("sectionForm");

    if (form) {

        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            await saveSection();

        });

    }


    await loadCourses();

    await loadTeachers();

    await loadSections();

});


async function loadCourses() {

    const select =
        document.getElementById("courseId");

    try {

        const response = await fetch(
            `${API_URL}/api/courses/`
        );

        if (!response.ok) {
            throw new Error("فشل تحميل المقررات");
        }

        coursesList = await response.json();


        select.innerHTML = `
            <option value="">
                اختر المقرر
            </option>
        `;


        coursesList.forEach(course => {

            select.innerHTML += `
                <option value="${course.id}">
                    ${escapeHtml(course.course_code)}
                    -
                    ${escapeHtml(course.course_name)}
                </option>
            `;

        });

    } catch (error) {

        console.error(error);

        showStatus(
            "فشل تحميل المقررات",
            "red"
        );

    }

}


async function loadTeachers() {

    const select =
        document.getElementById("teacherId");

    try {

        const response = await fetch(
            `${API_URL}/api/teachers/`
        );

        if (!response.ok) {
            throw new Error("فشل تحميل الدكاترة");
        }

        teachersList = await response.json();


        select.innerHTML = `
            <option value="">
                اختر الدكتور
            </option>
        `;


        teachersList.forEach(teacher => {

            select.innerHTML += `
                <option value="${teacher.id}">
                    ${escapeHtml(teacher.full_name)}
                </option>
            `;

        });

    } catch (error) {

        console.error(error);

        showStatus(
            "فشل تحميل الدكاترة",
            "red"
        );

    }

}


async function loadSections() {

    const table =
        document.getElementById("sectionsTable");

    try {

        const response = await fetch(
            `${API_URL}/api/course-sections/`
        );

        if (!response.ok) {
            throw new Error("فشل تحميل الشعب");
        }

        sectionsList = await response.json();


        if (sectionsList.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="8">
                        لا توجد شعب مسجلة حالياً
                    </td>
                </tr>
            `;

            return;
        }


        let html = "";


        sectionsList.forEach((section, index) => {

            const start =
                section.start_time || "";

            const end =
                section.end_time || "";


            html += `
                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                section.course_code || "-"
                            )}
                        </strong>
                        <br>
                        ${escapeHtml(
                            section.course_name || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            section.teacher_name || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            section.section_name || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            section.room || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            section.day || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            start
                        )}
                        -
                        ${escapeHtml(
                            end
                        )}
                    </td>

                    <td>

                        <button
                            class="edit-button"
                            onclick="editSection(${section.id})"
                        >
                            تعديل
                        </button>

                        <button
                            class="danger-button"
                            onclick="deleteSection(${section.id})"
                        >
                            حذف
                        </button>

                    </td>

                </tr>
            `;

        });


        table.innerHTML = html;


    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="8" style="color:red;">
                    ${error.message}
                </td>
            </tr>
        `;

    }

}


async function saveSection() {

    const id =
        document.getElementById("sectionId").value;


    const courseId =
        document.getElementById("courseId").value;

    const teacherId =
        document.getElementById("teacherId").value;

    const sectionName =
        document.getElementById("sectionName")
            .value
            .trim();

    const room =
        document.getElementById("room")
            .value
            .trim();

    const day =
        document.getElementById("day").value;

    const startTime =
        document.getElementById("startTime").value;

    const endTime =
        document.getElementById("endTime").value;


    if (
        !courseId ||
        !teacherId ||
        !sectionName
    ) {

        showStatus(
            "يرجى اختيار المقرر والدكتور واسم الشعبة",
            "red"
        );

        return;

    }


    const payload = {

        course_id: Number(courseId),

        teacher_id: Number(teacherId),

        section_name: sectionName,

        room: room || null,

        day: day || null,

        start_time: startTime || null,

        end_time: endTime || null

    };


    const isEdit = Boolean(id);


    const url = isEdit

        ? `${API_URL}/api/course-sections/${id}`

        : `${API_URL}/api/course-sections/`;


    try {

        showStatus(
            "جاري حفظ الشعبة...",
            "blue"
        );


        const response = await fetch(url, {

            method: isEdit
                ? "PUT"
                : "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)

        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "حدث خطأ أثناء حفظ الشعبة"
            );

        }


        showStatus(
            isEdit
                ? "تم تعديل الشعبة بنجاح"
                : "تم إضافة الشعبة بنجاح",
            "green"
        );


        resetForm();

        await loadSections();


    } catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "red"
        );

    }

}


function editSection(id) {

    const section =
        sectionsList.find(
            item => item.id === id
        );


    if (!section) return;


    document.getElementById("sectionId").value =
        section.id;

    document.getElementById("courseId").value =
        section.course_id;

    document.getElementById("teacherId").value =
        section.teacher_id;

    document.getElementById("sectionName").value =
        section.section_name || "";

    document.getElementById("room").value =
        section.room || "";

    document.getElementById("day").value =
        section.day || "";

    document.getElementById("startTime").value =
        section.start_time
            ? section.start_time.substring(0, 5)
            : "";

    document.getElementById("endTime").value =
        section.end_time
            ? section.end_time.substring(0, 5)
            : "";


    document.getElementById("formTitle").innerText =
        "تعديل بيانات الشعبة";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


async function deleteSection(id) {

    if (
        !confirm(
            "هل أنت متأكد من رغبتك في حذف هذه الشعبة؟"
        )
    ) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/course-sections/${id}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "فشل حذف الشعبة"
            );

        }


        showStatus(
            "تم حذف الشعبة بنجاح",
            "green"
        );


        await loadSections();


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
        .getElementById("sectionForm")
        .reset();


    document.getElementById("sectionId").value =
        "";


    document.getElementById("formTitle").innerText =
        "إضافة شعبة جديدة";


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