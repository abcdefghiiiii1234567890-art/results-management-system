"use strict";

/* ==========================================================
   الخطوة 2: كلاس Student مع التغليف (Private Fields #)
   وحارس الأمان داخل دوال set
   ========================================================== */
class Student {
  #name;
  #grade1;
  #grade2;
  #grade3;
  #attendance;

  constructor(name, grade1, grade2, grade3, attendance) {
    // الإسناد عبر set يفعّل حارس الأمان تلقائياً
    this.name = name;
    this.grade1 = grade1;
    this.grade2 = grade2;
    this.grade3 = grade3;
    this.attendance = attendance;
  }

  /* دالة مساعدة خاصة: تتحقق من أي قيمة رقمية (درجة أو حضور) */
  static #validateScore(value, label) {
    if (value === null || value === undefined || String(value).trim() === "") {
      throw new Error(`حقل «${label}» فارغ، من فضلك أدخل قيمة.`);
    }
    const number = Number(value);
    if (!Number.isFinite(number)) {
      throw new Error(`«${label}» يجب أن يكون رقماً صحيحاً.`);
    }
    if (number < 0 || number > 100) {
      throw new Error(`«${label}» غير صحيحة: يجب أن تكون بين 0 و 100.`);
    }
    return number;
  }

  // ----- الاسم -----
  get name() { return this.#name; }
  set name(value) {
    if (value === null || value === undefined || String(value).trim() === "") {
      throw new Error("حقل «اسم الطالب» فارغ، من فضلك أدخل الاسم.");
    }
    const clean = String(value).trim();
    if (clean.length < 2) {
      throw new Error("اسم الطالب قصير جداً (حرفان على الأقل).");
    }
    this.#name = clean;
  }

  // ----- الدرجات -----
  get grade1() { return this.#grade1; }
  set grade1(value) { this.#grade1 = Student.#validateScore(value, "درجة المادة الأولى"); }

  get grade2() { return this.#grade2; }
  set grade2(value) { this.#grade2 = Student.#validateScore(value, "درجة المادة الثانية"); }

  get grade3() { return this.#grade3; }
  set grade3(value) { this.#grade3 = Student.#validateScore(value, "درجة المادة الثالثة"); }

  // ----- الحضور -----
  get attendance() { return this.#attendance; }
  set attendance(value) { this.#attendance = Student.#validateScore(value, "نسبة الحضور"); }

  // ----- المتوسط -----
  get average() {
    return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
  }
}

/* ==========================================================
   الخطوة 3: مصفوفة الطلاب والإمساك بعناصر الشاشة
   ========================================================== */
const studentsList = [];

const nameInput       = document.getElementById("studentName");
const grade1Input     = document.getElementById("grade1");
const grade2Input     = document.getElementById("grade2");
const grade3Input     = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");
const addBtn          = document.getElementById("addBtn");
const mercyBtn        = document.getElementById("mercyBtn");
const errorBox        = document.getElementById("errorBox");
const studentsBox     = document.getElementById("studentsBox");
const reportBox       = document.getElementById("reportBox");
const countBadge      = document.getElementById("countBadge");

const allInputs = [nameInput, grade1Input, grade2Input, grade3Input, attendanceInput];

/* حماية من حقن HTML عند عرض الأسماء */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showError(message) {
  errorBox.innerHTML = `<div class="alert alert-danger" role="alert">⚠ ${escapeHtml(message)}</div>`;
}

function clearError() {
  errorBox.innerHTML = "";
}

function clearInputs() {
  allInputs.forEach((input) => { input.value = ""; });
  nameInput.focus();
}

function statusBadge(average) {
  if (average >= 50) return `<span class="badge text-bg-success">ناجح</span>`;
  if (average >= 40) return `<span class="badge text-bg-warning">متعثر</span>`;
  return `<span class="badge text-bg-danger">راسب</span>`;
}

function renderStudents() {
  countBadge.textContent = `${studentsList.length} طالب`;

  if (studentsList.length === 0) {
    studentsBox.innerHTML = `<p class="text-muted text-center my-4 mb-0">لم تتم إضافة أي طالب بعد.</p>`;
    return;
  }

  const rows = studentsList
    .map((s, index) => `
      <tr>
        <td>${index + 1}</td>
        <td class="fw-semibold">${escapeHtml(s.name)}</td>
        <td>${s.grade1}</td>
        <td>${s.grade2}</td>
        <td>${s.grade3}</td>
        <td>${s.average.toFixed(1)}</td>
        <td>${s.attendance}%</td>
        <td>${statusBadge(s.average)}</td>
      </tr>`)
    .join("");

  studentsBox.innerHTML = `
    <table class="table table-hover align-middle text-center">
      <thead>
        <tr>
          <th>#</th><th>الاسم</th><th>م1</th><th>م2</th><th>م3</th>
          <th>المتوسط</th><th>الحضور</th><th>الحالة</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/* ==========================================================
   زر «إضافة طالب» مع try / catch
   ========================================================== */
addBtn.onclick = function () {
  try {
    // داخل try: إنشاء الكائن. أي قيمة خاطئة سيرمي «حارس الأمان» خطأً
    const student = new Student(
      nameInput.value,
      grade1Input.value,
      grade2Input.value,
      grade3Input.value,
      attendanceInput.value
    );

    studentsList.push(student);
    clearError();
    renderStudents();
    clearInputs();
  } catch (error) {
    // عرض رسالة الخطأ على الشاشة وليس في الكونسول
    showError(error.message);
  }
};

// السماح بالضغط على Enter داخل الحقول
allInputs.forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addBtn.click();
  });
});

/* ==========================================================
   الخطوة 4: لجنة الرأفة (filter / map / reduce / template literals)
   ========================================================== */
mercyBtn.onclick = function () {
  clearError();

  if (studentsList.length === 0) {
    reportBox.innerHTML = `
      <div class="alert alert-info mb-0">لا توجد بيانات: أضف طلاباً أولاً ثم فعّل لجنة الرأفة.</div>`;
    return;
  }

  // 1) Filter: الطلاب المتعثرون (المتوسط من 40 إلى 49.99 أي أقل من 50)
  const strugglingStudents = studentsList.filter(
    (s) => s.average >= 40 && s.average < 50
  );

  // 2) Map: إضافة 5 درجات رأفة لمتوسط كل طالب (دون تعديل الكائنات الأصلية)
  const adjusted = strugglingStudents.map((s) => ({
    name: s.name,
    oldAverage: s.average,
    newAverage: s.average + 5
  }));

  // 3) Reduce: مجموع المتوسطات الجديدة ثم القسمة على العدد (مع منع القسمة على صفر)
  const total = adjusted.reduce((sum, s) => sum + s.newAverage, 0);
  const overallAverage = adjusted.length > 0 ? total / adjusted.length : 0;

  // 4) الطباعة على الشاشة بقوالب النصوص
  if (adjusted.length === 0) {
    reportBox.innerHTML = `
      <div class="alert alert-success mb-0">
        ✔ لا يوجد طلاب متعثرون (متوسط بين 40 و49)، لذلك لا حاجة لتفعيل الرأفة.
      </div>`;
    return;
  }

  const namesList = adjusted
    .map((s) => `
      <li class="d-flex justify-content-between">
        <span>${escapeHtml(s.name)}</span>
        <span class="text-muted">${s.oldAverage.toFixed(1)} ← <strong class="text-success">${s.newAverage.toFixed(1)}</strong></span>
      </li>`)
    .join("");

  reportBox.innerHTML = `
    <div class="row g-3 mb-3">
      <div class="col-6">
        <div class="report-stat">
          <div class="value">${adjusted.length}</div>
          <div class="small text-muted">عدد الطلاب المتعثرين</div>
        </div>
      </div>
      <div class="col-6">
        <div class="report-stat">
          <div class="value">${overallAverage.toFixed(2)}</div>
          <div class="small text-muted">المتوسط العام بعد الرأفة</div>
        </div>
      </div>
    </div>
    <h3 class="h6 fw-bold">أسماء الطلاب (المتوسط قبل ← بعد الرأفة +5)</h3>
    <ul class="list-unstyled report-names mb-0">${namesList}</ul>`;
};
