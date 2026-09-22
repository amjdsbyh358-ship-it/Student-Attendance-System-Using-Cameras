const API_URL = "http://127.0.0.1:8000";


// ========================================
// تشغيل الصفحة
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    showCurrentDate();

    loadDashboard();

});


// ========================================
// التاريخ
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
// تحميل لوحة التحكم
// ========================================

async function loadDashboard() {

    await loadStatistics();

    await loadAttendance();

}


// ========================================
// الإحصائيات
// ========================================

async function loadStatistics() {

    try {

        // الطلاب

        const studentsResponse =
            await fetch(
                `${API_URL}/api/students/`
            );

        const students =
            await studentsResponse.json();


        const totalStudents =
            document.getElementById(
                "totalStudents"
            );

        if (totalStudents) {

            totalStudents.textContent =
                students.length;

        }


        // الدكاترة

        const teachersResponse =
            await fetch(
                `${API_URL}/api/teachers/`
            );

        const teachers =
            await teachersResponse.json();


        const totalTeachers =
            document.getElementById(
                "totalTeachers"
            );

        if (totalTeachers) {

            totalTeachers.textContent =
                teachers.length;

        }


        // المقررات

        const coursesResponse =
            await fetch(
                `${API_URL}/api/courses/`
            );

        const courses =
            await coursesResponse.json();


        const totalCourses =
            document.getElementById(
                "totalCourses"
            );

        if (totalCourses) {

            totalCourses.textContent =
                courses.length;

        }


        // الشعب

        const sectionsResponse =
            await fetch(
                `${API_URL}/api/course-sections/`
            );

        const sections =
            await sectionsResponse.json();


        const totalSections =
            document.getElementById(
                "totalSections"
            );

        if (totalSections) {

            totalSections.textContent =
                sections.length;

        }


        // الحضور اليوم

        const attendanceResponse =
            await fetch(
                `${API_URL}/api/attendance/today`
            );

        const attendance =
            await attendanceResponse.json();


        const presentToday =
            document.getElementById(
                "presentToday"
            );

        if (presentToday) {

            presentToday.textContent =
                attendance.filter(
                    item =>
                        item.status === "present"
                ).length;

        }


        // الغياب

        const absentToday =
            document.getElementById(
                "absentToday"
            );

        if (absentToday) {

            absentToday.textContent =
                Math.max(
                    students.length -
                    attendance.filter(
                        item =>
                            item.status ===
                            "present"
                    ).length,
                    0
                );

        }

    }

    catch (error) {

        console.error(
            "Statistics error:",
            error
        );

    }

}


// ========================================
// تحميل حضور اليوم
// ========================================

async function loadAttendance() {

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

                <td colspan="6">

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
                "Failed to load attendance"
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            data.length === 0
        ) {

            table.innerHTML = `

                <tr>

                    <td colspan="6">

                        لا يوجد حضور مسجل اليوم

                    </td>

                </tr>

            `;

            return;

        }


        let html = "";


        data.forEach(
            (item, index) => {

                const studentNumber =
                    item.student_number ||
                    item.student?.student_number ||
                    "-";


                const studentName =
                    item.student_name ||
                    item.student?.full_name ||
                    "-";


                const courseName =
                    item.course_name ||
                    item.course_code ||
                    item.course?.course_name ||
                    "-";


                const teacherName =
                    item.teacher_name ||
                    item.teacher?.full_name ||
                    "-";


                const sectionName =
                    item.section_name ||
                    item.section?.section_name ||
                    "-";


                const date =
                    item.attendance_date ||
                    "-";


                const time =
                    item.attendance_time ||
                    "-";


                let status =
                    item.status ||
                    "-";


                if (
                    status === "present"
                ) {

                    status = "حاضر";

                }

                else if (
                    status === "absent"
                ) {

                    status = "غائب";

                }


                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${studentNumber}
                        </td>

                        <td>
                            ${studentName}
                        </td>

                        <td>
                            ${courseName}
                        </td>

                        <td>
                            ${teacherName}
                        </td>

                        <td>
                            ${sectionName}
                        </td>

                        <td>
                            ${date}
                        </td>

                        <td>
                            ${time}
                        </td>

                        <td>

                            <span
                                style="
                                    color: ${
                                        item.status ===
                                        "present"
                                            ? "green"
                                            : "red"
                                    };
                                    font-weight: bold;
                                "
                            >

                                ${status}

                            </span>

                        </td>

                    </tr>

                `;

            }
        );


        /*
         * إذا كانت لوحة التحكم القديمة
         * تحتوي على 6 أعمدة فقط،
         * نعرض النسخة المختصرة.
         */

        const headers =
            document.querySelectorAll(
                "table thead th"
            );


        if (headers.length === 6) {

            let shortHtml = "";


            data.forEach(
                (item, index) => {

                    shortHtml += `

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
                                    style="
                                        color: green;
                                        font-weight: bold;
                                    "
                                >
                                    حاضر
                                </span>

                            </td>

                        </tr>

                    `;

                }
            );


            table.innerHTML =
                shortHtml;

        }

        else {

            table.innerHTML =
                html;

        }

    }

    catch (error) {

        console.error(
            "Attendance error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="color:red;"
                >

                    فشل تحميل بيانات الحضور

                </td>

            </tr>

        `;

    }

}