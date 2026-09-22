const API_URL = "http://127.0.0.1:8000";


// =====================================================
// عند تحميل الصفحة
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStudents();

        setupStudentForm();

    }
);


// =====================================================
// تحميل الطلاب
// =====================================================

async function loadStudents() {

    const table =
        document.getElementById(
            "studentsTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="7">
                جاري تحميل الطلاب...
            </td>
        </tr>
    `;


    try {

        const response = await fetch(
            `${API_URL}/api/students/`
        );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const students =
            await response.json();


        console.log(
            "Students:",
            students
        );


        if (!Array.isArray(students)) {

            throw new Error(
                "البيانات المستلمة ليست قائمة طلاب"
            );

        }


        if (students.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7">
                        لا يوجد طلاب مسجلون
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML = "";


        students.forEach(
            function (student, index) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.student_number
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.full_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.email || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.department || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.level || "-"
                        )}
                    </td>

                    <td>

                        <button
                            class="primary-button"
                            onclick="captureFace(${student.id})"
                        >
                            تصوير الوجه
                        </button>

                        <button
                            class="danger-button"
                            onclick="deleteFace(${student.id})"
                        >
                            حذف الوجه
                        </button>

                        <button
                            class="danger-button"
                            onclick="deleteStudent(${student.id})"
                        >
                            حذف الطالب
                        </button>

                    </td>

                `;


                table.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "Load students error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="7">

                    حدث خطأ أثناء تحميل بيانات الطلاب

                    <br>

                    <small>
                        ${escapeHtml(
                            error.message
                        )}
                    </small>

                </td>

            </tr>

        `;

    }

}


// =====================================================
// إضافة طالب
// =====================================================

function setupStudentForm() {

    const form =
        document.getElementById(
            "studentForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const studentNumber =
                document.getElementById(
                    "studentNumber"
                ).value.trim();


            const fullName =
                document.getElementById(
                    "fullName"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            const department =
                document.getElementById(
                    "department"
                ).value.trim();


            const level =
                document.getElementById(
                    "level"
                ).value.trim();


            const message =
                document.getElementById(
                    "message"
                );


            if (!studentNumber || !fullName) {

                message.textContent =
                    "رقم الطالب والاسم مطلوبان";

                return;
            }


            const studentData = {

                student_number:
                    studentNumber,

                full_name:
                    fullName,

                email:
                    email || null,

                phone:
                    phone || null,

                department:
                    department || null,

                level:
                    level || null
            };


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/students/`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    studentData
                                )
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "فشل إضافة الطالب"
                    );

                }


                message.textContent =
                    "تمت إضافة الطالب بنجاح";


                message.style.color =
                    "green";


                form.reset();


                await loadStudents();


            } catch (error) {

                console.error(error);


                message.textContent =
                    error.message;


                message.style.color =
                    "red";

            }

        }
    );

}


// =====================================================
// تصوير الوجه
// =====================================================

async function captureFace(studentId) {

    if (
        !confirm(
            "هل تريد تشغيل الكاميرا لتسجيل وجه هذا الطالب؟"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/students/${studentId}/capture-face`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "فشل تسجيل الوجه"
            );

        }


        alert(
            "تم تسجيل الوجه وإعادة تدريب النموذج بنجاح"
        );


        await loadStudents();


    } catch (error) {

        console.error(error);


        alert(
            "حدث خطأ:\n" +
            error.message
        );

    }

}


// =====================================================
// حذف الوجه
// =====================================================

async function deleteFace(studentId) {

    if (
        !confirm(
            "هل تريد حذف بيانات وجه هذا الطالب؟"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/students/${studentId}/face`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "فشل حذف الوجه"
            );

        }


        alert(
            data.message ||
            "تم حذف بيانات الوجه"
        );


        await loadStudents();


    } catch (error) {

        console.error(error);


        alert(
            "حدث خطأ:\n" +
            error.message
        );

    }

}


// =====================================================
// حذف الطالب
// =====================================================

async function deleteStudent(studentId) {

    if (
        !confirm(
            "هل أنت متأكد من حذف الطالب؟"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/students/${studentId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "فشل حذف الطالب"
            );

        }


        alert(
            data.message ||
            "تم حذف الطالب بنجاح"
        );


        await loadStudents();


    } catch (error) {

        console.error(error);


        alert(
            "حدث خطأ:\n" +
            error.message
        );

    }

}


// =====================================================
// حماية النصوص
// =====================================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}