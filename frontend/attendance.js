const API_URL = "http://127.0.0.1:8000";

let teachers = [];
let courses = [];
let sections = [];


// ========================================
// تحميل الصفحة
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

    showCurrentDate();

    await loadTeachers();

    await loadCourses();

    await loadSections();

    setupSelectors();

    await loadTodayAttendance();

});


// ========================================
// عرض التاريخ
// ========================================

function showCurrentDate() {

    const element =
        document.getElementById("currentDate");

    if (!element) {
        return;
    }

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


// ========================================
// تحميل الدكاترة
// ========================================

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

        teachers = await response.json();

        const select =
            document.getElementById(
                "teacherSelect"
            );

        if (!select) {
            return;
        }

        select.innerHTML = `
            <option value="">
                اختر الدكتور
            </option>
        `;

        teachers.forEach(teacher => {

            const option =
                document.createElement("option");

            option.value = teacher.id;

            option.textContent =
                teacher.full_name;

            select.appendChild(option);

        });

    }

    catch (error) {

        console.error(
            "خطأ في تحميل الدكاترة:",
            error
        );

        const select =
            document.getElementById(
                "teacherSelect"
            );

        if (select) {

            select.innerHTML = `
                <option value="">
                    فشل تحميل الدكاترة
                </option>
            `;

        }

    }

}


// ========================================
// تحميل المقررات
// ========================================

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

        courses = await response.json();

        updateCourseSelect();

    }

    catch (error) {

        console.error(
            "خطأ في تحميل المقررات:",
            error
        );

        const select =
            document.getElementById(
                "courseSelect"
            );

        if (select) {

            select.innerHTML = `
                <option value="">
                    فشل تحميل المقررات
                </option>
            `;

        }

    }

}


// ========================================
// تحميل الشعب
// ========================================

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

        sections = await response.json();

        updateCourseSelect();

        updateSectionSelect();

    }

    catch (error) {

        console.error(
            "خطأ في تحميل الشعب:",
            error
        );

        const select =
            document.getElementById(
                "sectionSelect"
            );

        if (select) {

            select.innerHTML = `
                <option value="">
                    فشل تحميل الشعب
                </option>
            `;

        }

    }

}


// ========================================
// إعداد القوائم
// ========================================

function setupSelectors() {

    const teacherSelect =
        document.getElementById(
            "teacherSelect"
        );

    const courseSelect =
        document.getElementById(
            "courseSelect"
        );

    const sectionSelect =
        document.getElementById(
            "sectionSelect"
        );


    if (teacherSelect) {

        teacherSelect.addEventListener(
            "change",
            () => {

                updateCourseSelect();

                updateSectionSelect();

                updateSectionInfo();

            }
        );

    }


    if (courseSelect) {

        courseSelect.addEventListener(
            "change",
            () => {

                updateSectionSelect();

                updateSectionInfo();

            }
        );

    }


    if (sectionSelect) {

        sectionSelect.addEventListener(
            "change",
            updateSectionInfo
        );

    }

}


// ========================================
// تحديث قائمة المقررات
// حسب الدكتور المختار
// ========================================

function updateCourseSelect() {

    const teacherSelect =
        document.getElementById(
            "teacherSelect"
        );

    const courseSelect =
        document.getElementById(
            "courseSelect"
        );


    if (!teacherSelect || !courseSelect) {
        return;
    }


    const teacherId =
        teacherSelect.value;


    const currentCourse =
        courseSelect.value;


    courseSelect.innerHTML = `
        <option value="">
            اختر المقرر
        </option>
    `;


    let availableCourses = courses;


    // إذا تم اختيار دكتور
    // نعرض فقط المقررات التي يدرسها

    if (teacherId) {

        const teacherSections =
            sections.filter(
                section =>
                    String(section.teacher_id) ===
                    String(teacherId)
            );


        const courseIds =
            new Set(
                teacherSections.map(
                    section =>
                        String(section.course_id)
                )
            );


        availableCourses =
            courses.filter(
                course =>
                    courseIds.has(
                        String(course.id)
                    )
            );

    }


    availableCourses.forEach(
        course => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                course.id;

            option.textContent =
                `${course.course_code} - ${course.course_name}`;

            courseSelect.appendChild(
                option
            );

        }
    );


    // الاحتفاظ بالمقرر السابق
    if (
        currentCourse &&
        availableCourses.some(
            course =>
                String(course.id) ===
                String(currentCourse)
        )
    ) {

        courseSelect.value =
            currentCourse;

    }

}


// ========================================
// تحديث قائمة الشعب
// حسب الدكتور + المقرر
// ========================================

function updateSectionSelect() {

    const teacherSelect =
        document.getElementById(
            "teacherSelect"
        );

    const courseSelect =
        document.getElementById(
            "courseSelect"
        );

    const sectionSelect =
        document.getElementById(
            "sectionSelect"
        );


    if (
        !teacherSelect ||
        !courseSelect ||
        !sectionSelect
    ) {
        return;
    }


    const teacherId =
        teacherSelect.value;


    const courseId =
        courseSelect.value;


    sectionSelect.innerHTML = `
        <option value="">
            اختر الشعبة
        </option>
    `;


    // لا نعرض الشعب إلا بعد اختيار
    // الدكتور والمقرر

    if (!teacherId || !courseId) {

        updateSectionInfo();

        return;

    }


    const filteredSections =
        sections.filter(
            section => {

                const teacherMatch =
                    String(
                        section.teacher_id
                    ) ===
                    String(
                        teacherId
                    );


                const courseMatch =
                    String(
                        section.course_id
                    ) ===
                    String(
                        courseId
                    );


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

            sectionSelect.appendChild(
                option
            );

        }
    );


    updateSectionInfo();

}


// ========================================
// معلومات الشعبة
// ========================================

function updateSectionInfo() {

    const sectionSelect =
        document.getElementById(
            "sectionSelect"
        );

    const info =
        document.getElementById(
            "sectionInfo"
        );


    if (!sectionSelect || !info) {
        return;
    }


    const sectionId =
        sectionSelect.value;


    if (!sectionId) {

        info.innerHTML = `
            <div class="section-info-empty">

                اختر الدكتور والمقرر والشعبة
                لعرض معلومات المحاضرة

            </div>
        `;

        return;

    }


    const section =
        sections.find(
            s =>
                String(s.id) ===
                String(sectionId)
        );


    if (!section) {

        info.innerHTML = `
            <div class="section-info-empty">
                لم يتم العثور على بيانات الشعبة
            </div>
        `;

        return;

    }


    info.innerHTML = `

        <p>

            <strong>
                المقرر:
            </strong>

            ${section.course_code || ""}

            ${
                section.course_name
                    ? " - " +
                      section.course_name
                    : ""
            }

        </p>


        <p>

            <strong>
                الدكتور:
            </strong>

            ${section.teacher_name || "-"}

        </p>


        <p>

            <strong>
                الشعبة:
            </strong>

            ${section.section_name || "-"}

        </p>


        <p>

            <strong>
                القاعة:
            </strong>

            ${section.room || "-"}

        </p>


        <p>

            <strong>
                اليوم:
            </strong>

            ${section.day || "-"}

        </p>


        <p>

            <strong>
                الوقت:
            </strong>

            ${section.start_time || "-"}

            -

            ${section.end_time || "-"}

        </p>

    `;

}


// ========================================
// تشغيل الكاميرا
// ========================================

async function startCamera() {

    const sectionSelect =
        document.getElementById(
            "sectionSelect"
        );

    const status =
        document.getElementById(
            "cameraStatus"
        );


    if (!sectionSelect) {
        return;
    }


    const sectionId =
        sectionSelect.value;


    if (!sectionId) {

        alert(
            "اختر الدكتور والمقرر والشعبة أولاً"
        );

        return;

    }


    try {

        if (status) {

            status.innerHTML = `
                جاري تشغيل الكاميرا...
            `;

        }


        const response =
            await fetch(
                `${API_URL}/api/attendance/start-camera/${sectionId}`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "حدث خطأ أثناء تشغيل الكاميرا"
            );

        }


        if (status) {

            status.innerHTML = `

                <span
                    style="
                        color: green;
                        font-weight: bold;
                    "
                >

                    ${data.message}

                </span>

            `;

        }


    }

    catch (error) {

        console.error(error);


        if (status) {

            status.innerHTML = `

                <span
                    style="
                        color: red;
                        font-weight: bold;
                    "
                >

                    ${error.message}

                </span>

            `;

        }

    }

}


// ========================================
// إيقاف الكاميرا
// ========================================

async function stopCamera() {

    const status =
        document.getElementById(
            "cameraStatus"
        );


    try {

        if (status) {

            status.innerHTML =
                "جاري إيقاف الكاميرا...";

        }


        const response =
            await fetch(
                `${API_URL}/api/attendance/stop-camera`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "حدث خطأ أثناء إيقاف الكاميرا"
            );

        }


        if (status) {

            status.innerHTML = `

                <span
                    style="
                        color: green;
                        font-weight: bold;
                    "
                >

                    ${data.message}

                </span>

            `;

        }


        await loadTodayAttendance();


    }

    catch (error) {

        console.error(error);


        if (status) {

            status.innerHTML = `

                <span
                    style="
                        color: red;
                        font-weight: bold;
                    "
                >

                    ${error.message}

                </span>

            `;

        }

    }

}


// ========================================
// تحميل حضور اليوم
// ========================================

async function loadTodayAttendance() {

    const table =
        document.getElementById(
            "attendanceTable"
        );


    if (!table) {
        return;
    }


    try {

        table.innerHTML = `

            <tr>

                <td colspan="9">

                    جاري تحميل البيانات...

                </td>

            </tr>

        `;


        const response =
            await fetch(
                `${API_URL}/api/attendance/today`
            );


        if (!response.ok) {

            throw new Error(
                "فشل تحميل بيانات الحضور"
            );

        }


        const data =
            await response.json();


        // ==================================
        // لا يوجد حضور
        // ==================================

        if (
            !data ||
            data.length === 0
        ) {

            table.innerHTML = `

                <tr>

                    <td colspan="9">

                        لا يوجد حضور مسجل اليوم

                    </td>

                </tr>

            `;

            return;

        }


        // ==================================
        // بناء الصفوف فقط
        // لا ننشئ جدولًا جديدًا
        // ==================================

        let html = "";


        data.forEach(
            (item, index) => {


                let statusText = "-";


                if (
                    item.status ===
                    "present"
                ) {

                    statusText =
                        "حاضر";

                }

                else if (
                    item.status ===
                    "absent"
                ) {

                    statusText =
                        "غائب";

                }

                else {

                    statusText =
                        item.status ||
                        "-";

                }


                html += `

                    <tr>


                        <td>

                            ${index + 1}

                        </td>


                        <td>

                            ${
                                item.student_number ||
                                "-"
                            }

                        </td>


                        <td>

                            ${
                                item.student_name ||
                                "-"
                            }

                        </td>


                        <td>

                            ${
                                item.course_code ||
                                ""
                            }

                            ${
                                item.course_name
                                    ? " - " +
                                      item.course_name
                                    : ""
                            }

                        </td>


                        <td>

                            ${
                                item.teacher_name ||
                                "-"
                            }

                        </td>


                        <td>

                            ${
                                item.section_name ||
                                "-"
                            }

                        </td>


                        <td>

                            ${
                                item.attendance_date ||
                                "-"
                            }

                        </td>


                        <td>

                            ${
                                item.attendance_time ||
                                "-"
                            }

                        </td>


                        <td>

                            <span
                                class="${
                                    item.status ===
                                    "present"
                                        ? "status-present"
                                        : "status-unknown"
                                }"
                            >

                                ${statusText}

                            </span>

                        </td>


                    </tr>

                `;

            }
        );


        table.innerHTML =
            html;


    }

    catch (error) {

        console.error(
            "خطأ في تحميل الحضور:",
            error
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="color: red;"
                >

                    فشل تحميل بيانات الحضور

                </td>

            </tr>

        `;

    }

}