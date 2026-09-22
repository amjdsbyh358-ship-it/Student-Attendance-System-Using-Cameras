const API_URL = "http://127.0.0.1:8000";


let allStudents = [];
let allAttendance = [];
let allEnrollments = [];


// ==========================================
// تحميل الطلاب
// ==========================================

async function loadStudents() {

    try {

        const response = await fetch(
            `${API_URL}/api/students/`
        );

        if (!response.ok) {
            throw new Error(
                "فشل تحميل بيانات الطلاب"
            );
        }

        allStudents = await response.json();

    } catch (error) {

        console.error(
            "خطأ في تحميل الطلاب:",
            error
        );

    }

}


// ==========================================
// تحميل سجلات الحضور
// ==========================================

async function loadAttendance() {

    try {

        const response = await fetch(
            `${API_URL}/api/attendance/`
        );

        if (!response.ok) {
            throw new Error(
                "فشل تحميل بيانات الحضور"
            );
        }

        allAttendance = await response.json();

    } catch (error) {

        console.error(
            "خطأ في تحميل الحضور:",
            error
        );

    }

}


// ==========================================
// تحميل تسجيلات الطلاب في الشعب
// ==========================================

async function loadEnrollments() {

    try {

        const response = await fetch(
            `${API_URL}/api/enrollments/`
        );

        if (!response.ok) {
            throw new Error(
                "فشل تحميل تسجيلات الطلاب"
            );
        }

        allEnrollments = await response.json();

    } catch (error) {

        console.error(
            "خطأ في تحميل تسجيلات الطلاب:",
            error
        );

    }

}


// ==========================================
// إنشاء التقرير
// ==========================================

function generateReport() {

    const selectedDate =
        document.getElementById(
            "reportDate"
        ).value;


    const searchText =
        document.getElementById(
            "searchStudent"
        ).value
        .trim()
        .toLowerCase();


    // ======================================
    // فلترة تسجيلات الطلاب
    // ======================================

    let enrollments =
        [...allEnrollments];


    // البحث عن الطالب
    if (searchText) {

        enrollments =
            enrollments.filter(enrollment => {

                const student =
                    allStudents.find(
                        item =>
                            item.id ===
                            enrollment.student_id
                    );


                const studentName =
                    String(
                        enrollment.student_name ||
                        student?.full_name ||
                        ""
                    ).toLowerCase();


                const studentNumber =
                    String(
                        enrollment.student_number ||
                        student?.student_number ||
                        ""
                    ).toLowerCase();


                return (
                    studentName.includes(
                        searchText
                    ) ||
                    studentNumber.includes(
                        searchText
                    )
                );

            });

    }


    // ======================================
    // فلترة الحضور حسب التاريخ
    // ======================================

    const attendance =
        allAttendance.filter(record => {

            const recordDate =
                record.date ||
                record.attendance_date;


            return (
                recordDate ===
                selectedDate
            );

        });


    // ======================================
    // إنشاء جدول التقرير
    // ======================================

    const table =
        document.getElementById(
            "reportTable"
        );


    table.innerHTML = "";


    // لا توجد تسجيلات
    if (enrollments.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="9">
                    لا توجد بيانات مسجلة في الشعب
                </td>
            </tr>
        `;

        updateStatistics(
            0,
            0
        );

        return;

    }


    // ======================================
    // الإحصائيات
    // ======================================

    let totalRows =
        enrollments.length;


    let presentRows =
        0;


    // ======================================
    // إنشاء الصفوف
    // ======================================

    enrollments.forEach(
        (enrollment, index) => {

            // --------------------------------
            // البحث عن الطالب
            // --------------------------------

            const student =
                allStudents.find(
                    item =>
                        item.id ===
                        enrollment.student_id
                );


            const studentName =
                enrollment.student_name ||
                student?.full_name ||
                "-";


            const studentNumber =
                enrollment.student_number ||
                student?.student_number ||
                "-";


            // --------------------------------
            // البحث عن حضور الطالب
            // في نفس الشعبة
            // --------------------------------

            const attendanceRecord =
                attendance.find(record => {

                    return (
                        Number(
                            record.student_id
                        ) ===
                        Number(
                            enrollment.student_id
                        ) &&

                        Number(
                            record.section_id
                        ) ===
                        Number(
                            enrollment.section_id
                        )
                    );

                });


            const row =
                document.createElement(
                    "tr"
                );


            // =================================
            // الطالب حاضر
            // =================================

            if (attendanceRecord) {

                presentRows++;


                row.innerHTML = `

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
                        ${
                            enrollment.course_name ||
                            enrollment.course_code ||
                            "-"
                        }
                    </td>

                    <td>
                        ${
                            enrollment.teacher_name ||
                            "-"
                        }
                    </td>

                    <td>
                        ${
                            enrollment.section_name ||
                            "-"
                        }
                    </td>

                    <td>
                        ${
                            attendanceRecord.date ||
                            attendanceRecord.attendance_date ||
                            selectedDate ||
                            "-"
                        }
                    </td>

                    <td>
                        ${
                            attendanceRecord.time ||
                            attendanceRecord.attendance_time ||
                            "-"
                        }
                    </td>

                    <td class="present">
                        حاضر
                    </td>

                `;

            }


            // =================================
            // الطالب غائب
            // =================================

            else {

                row.innerHTML = `

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
                        ${
                            enrollment.course_name ||
                            enrollment.course_code ||
                            "-"
                        }
                    </td>

                    <td>
                        ${
                            enrollment.teacher_name ||
                            "-"
                        }
                    </td>

                    <td>
                        ${
                            enrollment.section_name ||
                            "-"
                        }
                    </td>

                    <td>
                        ${
                            selectedDate ||
                            "-"
                        }
                    </td>

                    <td>
                        -
                    </td>

                    <td class="absent">
                        غائب
                    </td>

                `;

            }


            table.appendChild(row);

        }
    );


    // ======================================
    // تحديث الإحصائيات
    // ======================================

    updateStatistics(
        totalRows,
        presentRows
    );

}


// ==========================================
// تحديث الإحصائيات
// ==========================================

function updateStatistics(
    total,
    present
) {

    const absent =
        Math.max(
            total - present,
            0
        );


    let percentage = 0;


    if (total > 0) {

        percentage =
            (
                (present / total) * 100
            ).toFixed(1);

    }


    document.getElementById(
        "totalStudents"
    ).textContent =
        total;


    document.getElementById(
        "presentStudents"
    ).textContent =
        present;


    document.getElementById(
        "absentStudents"
    ).textContent =
        absent;


    document.getElementById(
        "attendancePercentage"
    ).textContent =
        `${percentage}%`;

}


// ==========================================
// تشغيل الصفحة
// ==========================================

async function initializeReports() {

    // --------------------------------------
    // وضع تاريخ اليوم
    // --------------------------------------

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "reportDate"
    ).value =
        today;


    // --------------------------------------
    // تحميل البيانات
    // --------------------------------------

    await loadStudents();

    await loadAttendance();

    await loadEnrollments();


    // --------------------------------------
    // إنشاء التقرير
    // --------------------------------------

    generateReport();

}


// ==========================================
// تشغيل
// ==========================================

initializeReports();