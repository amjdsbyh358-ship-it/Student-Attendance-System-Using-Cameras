const API_URL = "http://127.0.0.1:8000";

let teachersList = [];

// ======================================
// تشغيل الصفحة عند التحميل
// ======================================
document.addEventListener("DOMContentLoaded", async () => {
    // ربط نموذج الإضافة بالدالة تلقائياً
    const teacherForm = document.getElementById("teacherForm");
    if (teacherForm) {
        teacherForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await saveTeacher();
        });
    }

    await loadTeachers();
});

// ======================================
// جلب قائمة الدكاترة من الـ Backend
// ======================================
async function loadTeachers() {
    // تعديل الـ ID ليتطابق مع الـ HTML (teachersTable)
    const tableBody = document.getElementById("teachersTable");
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_URL}/api/teachers/`);
        
        if (!response.ok) {
            throw new Error("فشل في تحميل قائمة الدكاترة");
        }

        teachersList = await response.json();

        if (teachersList.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">لا يوجد دكاترة مسجلين حالياً</td>
                </tr>
            `;
            return;
        }

        let html = "";
        teachersList.forEach((teacher, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${teacher.full_name || "-"}</strong></td>
                    <td>${teacher.email || "-"}</td>
                    <td>${teacher.department || "-"}</td>
                    <td>
                        <button class="edit-button" onclick="editTeacher(${teacher.id})">
                            تعديل
                        </button>
                        <button class="danger-button" onclick="deleteTeacher(${teacher.id})">
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
                <td colspan="5" style="text-align: center; color: red;">${error.message}</td>
            </tr>
        `;
    }
}

// ======================================
// حفظ دكتور جديد أو تعديل بياناته
// ======================================
async function saveTeacher() {
    const id = document.getElementById("teacherId") ? document.getElementById("teacherId").value : "";
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const department = document.getElementById("department").value.trim();

    if (!fullName) {
        showStatus("يرجى كتابة الاسم الكامل", "red");
        return;
    }

    const payload = {
        full_name: fullName,
        email: email || null,
        department: department || null
    };

    const isEdit = Boolean(id);
    const url = isEdit ? `${API_URL}/api/teachers/${id}` : `${API_URL}/api/teachers/`;
    const method = isEdit ? "PUT" : "POST";

    try {
        showStatus("جاري حفظ البيانات...", "blue");

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "حدث خطأ أثناء حفظ البيانات");
        }

        showStatus(isEdit ? "تم تعديل البيانات بنجاح" : "تم إضافة الدكتور بنجاح", "green");
        resetForm();
        await loadTeachers();

    } catch (error) {
        console.error(error);
        showStatus(error.message, "red");
    }
}

// ======================================
// تعبئة النموذج لتعديل بيانات دكتور
// ======================================
function editTeacher(id) {
    const teacher = teachersList.find(item => item.id === id);
    if (!teacher) return;

    if (document.getElementById("teacherId")) {
        document.getElementById("teacherId").value = teacher.id;
    }
    document.getElementById("fullName").value = teacher.full_name || "";
    document.getElementById("email").value = teacher.email || "";
    document.getElementById("department").value = teacher.department || "";

    const formTitle = document.getElementById("formTitle");
    if (formTitle) formTitle.innerText = "تعديل بيانات الدكتور";
    
    showStatus("", "");
}

// ======================================
// حذف دكتور
// ======================================
async function deleteTeacher(id) {
    if (!confirm("هل أنت تأكد من رغبتك في حذف هذا الدكتور؟")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/teachers/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("فشل حذف الدكتور");
        }

        showStatus("تم حذف الدكتور بنجاح", "green");
        await loadTeachers();

    } catch (error) {
        console.error(error);
        showStatus(error.message, "red");
    }
}

// ======================================
// إعادة ضبط النموذج
// ======================================
function resetForm() {
    const form = document.getElementById("teacherForm");
    if (form) form.reset();
    
    const teacherId = document.getElementById("teacherId");
    if (teacherId) teacherId.value = "";
    
    const formTitle = document.getElementById("formTitle");
    if (formTitle) formTitle.innerText = "إضافة دكتور جديد";
}

// ======================================
// عرض رسائل النتيجة والحالة
// ======================================
function showStatus(message, type) {
    // تعديل الـ ID ليتطابق مع عنصر <p id="message"></p> في HTML
    const element = document.getElementById("message");
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