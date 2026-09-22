const API_URL = "http://127.0.0.1:8000";


let students = [];
let teachers = [];
let courses = [];
let sections = [];


// ======================================
// تشغيل الصفحة
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        showCurrentDate();

        await loadStudents();

        await loadTeachers();

        await loadCourses();

        await loadSections();

        await loadEnrollments();

        setupEvents();
    }
);


// ======================================
// ربط الأحداث
// ======================================

function setupEvents() {

    const teacherSelect =
        document.getElementById("teacherSelect");

    const courseSelect =
        document.getElementById("courseSelect");

    const sectionSelect =
        document.getElementById("sectionSelect");


    if (teacherSelect) {

        teacherSelect.addEventListener(
            "change",
            updateSectionSelect
        );

    }


    if (courseSelect) {

        courseSelect.addEventListener(
            "change",
            updateSectionSelect
        );

    }


    if (sectionSelect) {

        sectionSelect.addEventListener(
            "change",
            updateSectionInfo
        );

    }

}


// ======================================
// التاريخ الحالي
// ======================================

function showCurrentDate() {

    const element =
        document.getElementById("currentDate");

    if (!element) return;


    const today = new Date();


    element.textContent =
        today.toLocaleDateString(
            "ar-YE",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


// ======================================
// تحميل الطلاب
// ======================================

async function loadStudents() {

    try {

        const response = await fetch(
            `${API_URL}/api/students/`
        );


        if (!response.ok) {

            throw new Error(
                "فشل تحميل قائمة الطلاب"
            );

        }


        students =
            await response.json();


        const select =
            document.getElementById(
                "studentSelect"
            );


        if (!select) return;


        select.innerHTML =
            `<option value="">
                اختر الطالب
            </option>`;


        students.forEach(
            student => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    student.id;


                option.textContent =
                    `${student.student_number} - ${student.full_name}`;


                select.appendChild(
                    option
                );

            }
        );

    }
    catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "red"
        );

    }

}


// ======================================
// تحميل الدكاترة
// ======================================

async function loadTeachers() {

    try {

        const response = await fetch(
            `${API_URL}/api/teachers/`
        );


        if (!response.ok) {

            throw new Error(
                "فشل تحميل الدكاترة"
            );

        }


        teachers =
            await response.json();


        const select =
            document.getElementById(
                "teacherSelect"
            );


        if (!select) return;


        select.innerHTML =
            `<option value="">
                اختر الدكتور
            </option>`;


        teachers.forEach(
            teacher => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    teacher.id;


                option.textContent =
                    teacher.full_name;


                select.appendChild(
                    option
                );

            }
        );

    }
    catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "red"
        );

    }

}


// ======================================
// تحميل المقررات
// ======================================

async function loadCourses() {

    try {

        const response = await fetch(
            `${API_URL}/api/courses/`
        );


        if (!response.ok) {

            throw new Error(
                "فشل تحميل المقررات"
            );

        }


        courses =
            await response.json();


        const select =
            document.getElementById(
                "courseSelect"
            );


        if (!select) return;


        select.innerHTML =
            `<option value="">
                اختر المقرر
            </option>`;


        courses.forEach(
            course => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    course.id;


                option.textContent =
                    `${course.course_code} - ${course.course_name}`;


                select.appendChild(
                    option
                );

            }
        );

    }
    catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "red"
        );

    }

}


// ======================================
// تحميل الشعب
// ======================================

async function loadSections() {

    try {

        const response = await fetch(
            `${API_URL}/api/course-sections/`
        );


        if (!response.ok) {

            throw new Error(
                "فشل تحميل الشعب"
            );

        }


        sections =
            await response.json();


        updateSectionSelect();

    }
    catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "red"
        );

    }

}


// ======================================
// تحديث قائمة الشعب
// حسب الدكتور والمقرر
// ======================================

function updateSectionSelect() {

    const teacherSelect =
        document.getElementById(
            "teacherSelect"
        );

    const courseSelect =
        document.getElementById(
            "courseSelect"
        );

    const select =
        document.getElementById(
            "sectionSelect"
        );


    if (!select) return;


    const teacherId =
        teacherSelect
            ? teacherSelect.value
            : "";


    const courseId =
        courseSelect
            ? courseSelect.value
            : "";


    select.innerHTML =
        `<option value="">
            اختر الشعبة
        </option>`;


    const filteredSections =
        sections.filter(
            section => {

                const teacherMatch =
                    !teacherId ||
                    String(section.teacher_id) ===
                    String(teacherId);


                const courseMatch =
                    !courseId ||
                    String(section.course_id) ===
                    String(courseId);


                return (
                    teacherMatch &&
                    courseMatch
                );

            }
        );


    filteredSections.forEach(
        section => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                section.id;


            option.textContent =
                `الشعبة ${section.section_name}`;


            select.appendChild(
                option
            );

        }
    );


    updateSectionInfo();

}


// ======================================
// عرض معلومات الشعبة
// ======================================

function updateSectionInfo() {

    const sectionSelect =
        document.getElementById(
            "sectionSelect"
        );

    const info =
        document.getElementById(
            "sectionInfo"
        );


    if (!sectionSelect || !info) return;


    const sectionId =
        sectionSelect.value;


    if (!sectionId) {

        info.innerHTML = "";

        return;

    }


    const section =
        sections.find(
            item =>
                String(item.id) ===
                String(sectionId)
        );


    if (!section) {

        info.innerHTML = "";

        return;

    }


    info.innerHTML = `

        <p>
            <strong>المقرر:</strong>
            ${section.course_code || "-"}
            -
            ${section.course_name || "-"}
        </p>

        <p>
            <strong>الدكتور:</strong>
            ${section.teacher_name || "-"}
        </p>

        <p>
            <strong>الشعبة:</strong>
            ${section.section_name || "-"}
        </p>

        <p>
            <strong>القاعة:</strong>
            ${section.room || "-"}
        </p>

        <p>
            <strong>اليوم:</strong>
            ${section.day || "-"}
        </p>

        <p>
            <strong>الوقت:</strong>
            ${section.start_time || "-"}
            -
            ${section.end_time || "-"}
        </p>

    `;

}


// ======================================
// تسجيل الطالب
// ======================================

async function saveEnrollment() {

    const studentId =
        document.getElementById(
            "studentSelect"
        ).value;


    const sectionId =
        document.getElementById(
            "sectionSelect"
        ).value;


    if (!studentId) {

        showStatus(
            "يرجى اختيار الطالب",
            "red"
        );

        return;

    }


    if (!sectionId) {

        showStatus(
            "يرجى اختيار الدكتور والمقرر والشعبة",
            "red"
        );

        return;

    }


    try {

        showStatus(
            "جاري حفظ التسجيل...",
            "blue"
        );


        const response =
            await fetch(
                `${API_URL}/api/enrollments/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            student_id:
                                parseInt(studentId),

                            section_id:
                                parseInt(sectionId)
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "فشل تسجيل الطالب في الشعبة"
            );

        }


        showStatus(
            "تم تسجيل الطالب في الشعبة بنجاح",
            "green"
        );


        document.getElementById(
            "studentSelect"
        ).value = "";


        await loadEnrollments();

    }
    catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "red"
        );

    }

}


// ======================================
// تحميل التسجيلات
// ======================================

async function loadEnrollments() {

    const table =
        document.getElementById(
            "enrollmentsTable"
        );


    if (!table) return;


    try {

        const response =
            await fetch(
                `${API_URL}/api/enrollments/`
            );


        if (!response.ok) {

            throw new Error(
                "فشل تحميل التسجيلات"
            );

        }


        const data =
            await response.json();


        if (!data || data.length === 0) {

            table.innerHTML = `

                <tr>
                    <td colspan="7">
                        لا توجد تسجيلات حالية
                    </td>
                </tr>

            `;

            return;

        }


        let html = "";


        data.forEach(
            (item, index) => {

                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${item.student_number || "-"}
                        </td>

                        <td>
                            ${item.student_name || "-"}
                        </td>

                        <td>
                            ${item.course_code || "-"}
                            ${item.course_name
                                ? " - " + item.course_name
                                : ""}
                        </td>

                        <td>
                            ${item.teacher_name || "-"}
                        </td>

                        <td>
                            ${item.section_name || "-"}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="danger-button"
                                onclick="deleteEnrollment(${item.id})"
                            >
                                حذف
                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        table.innerHTML = html;

    }
    catch (error) {

        console.error(error);


        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="color:red"
                >
                    ${error.message}
                </td>

            </tr>

        `;

    }

}


// ======================================
// حذف تسجيل
// ======================================

async function deleteEnrollment(enrollmentId) {

    if (
        !confirm(
            "هل أنت متأكد من حذف هذا التسجيل؟"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/enrollments/${enrollmentId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "فشل حذف التسجيل"
            );

        }


        showStatus(
            "تم حذف التسجيل بنجاح",
            "green"
        );


        await loadEnrollments();

    }
    catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "red"
        );

    }

}


// ======================================
// رسائل الحالة
// ======================================

function showStatus(message, type) {

    const element =
        document.getElementById(
            "message"
        );


    if (!element) return;


    element.textContent = message;


    if (type === "green") {

        element.style.color = "green";

    }
    else if (type === "red") {

        element.style.color = "red";

    }
    else {

        element.style.color = "#2563eb";

    }

}