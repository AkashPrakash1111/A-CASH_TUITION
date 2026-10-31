// Single place that turns an exam from the API (examName, examType, duration,
// maxMarks, examDate, passingMarks ...) into the shape the UI uses, and works
// out its live status. The student pages used to read snake_case names the
// backend never sends (title, duration_minutes, total_marks ...), so an admin's
// edits never showed up for students.

function toNumber(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function normalizeExam(e) {
  if (!e) return e;
  const name = e.examName || e.title || "Curriculum Exam";
  const durationMinutes = toNumber(e.duration_minutes ?? e.duration, 60);
  return {
    ...e,
    examName: name,
    title: name,
    examType: e.examType || e.exam_type || "Unit Test",
    description: e.description || "",
    className: e.className || e.batch_name || e.batch || "",
    batch: e.batch || e.batch_name || e.className || "",
    subject: e.subject || e.subject_name || "",
    examDate: e.examDate || e.scheduled_date || "",
    startTime: e.startTime || e.start_time || "",
    duration: String(durationMinutes),
    duration_minutes: durationMinutes,
    maxMarks: e.maxMarks ?? e.total_marks ?? 100,
    total_marks: toNumber(e.maxMarks ?? e.total_marks, 100),
    passingMarks: e.passingMarks ?? e.passing_marks ?? 40,
    passing_marks: toNumber(e.passingMarks ?? e.passing_marks, 40),
    questionPaperUrl: e.questionPaperUrl || e.question_paper_url || null,
    questions: Array.isArray(e.questions) ? e.questions : [],
  };
}

// "10:00", "10:00 AM", "2:30 PM" -> { h, m } in 24h, or null.
function parseTime(text) {
  const match = /^\s*(\d{1,2}):(\d{2})\s*([AaPp][Mm])?\s*$/.exec(text || "");
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const mer = match[3] && match[3].toLowerCase();
  if (mer === "pm" && h < 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  if (h > 23 || m > 59) return null;
  return { h, m };
}

// Upcoming | Ongoing | Completed, computed in the viewer's local time from the
// exam date, start time and duration (the stored `status` column is never updated).
export function examStatus(exam, now = new Date()) {
  if (!exam?.examDate) return "Upcoming";
  const day = new Date(`${exam.examDate}T00:00:00`);
  if (Number.isNaN(day.getTime())) return "Upcoming";

  const time = parseTime(exam.startTime);
  if (!time) {
    // No usable start time: treat the whole day as "ongoing".
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);
    if (now < day) return "Upcoming";
    return now <= endOfDay ? "Ongoing" : "Completed";
  }

  const start = new Date(day);
  start.setHours(time.h, time.m, 0, 0);
  const end = new Date(start.getTime() + toNumber(exam.duration_minutes ?? exam.duration, 60) * 60000);
  if (now < start) return "Upcoming";
  return now < end ? "Ongoing" : "Completed";
}

// The API sends questions as { questionText, questionType, optionsJson (a JSON
// string), marks, sortOrder }. The exam-taking screen wants plain
// { text, type, options[], marks }. Blank questions and blank options (left
// behind by the question editor) are dropped.
export function normalizeQuestions(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((q, idx) => {
      let options = q.options;
      if (!Array.isArray(options)) {
        try {
          options = JSON.parse(q.optionsJson || q.options_json || "[]");
        } catch {
          options = [];
        }
      }
      options = (Array.isArray(options) ? options : [])
        .map((o) => String(o ?? "").trim())
        .filter(Boolean);
      const text = String(q.questionText ?? q.question_text ?? "").trim();
      const declared = String(q.questionType ?? q.question_type ?? "").toLowerCase();
      return {
        id: q.id ?? idx,
        sortOrder: q.sortOrder ?? idx,
        text,
        type: declared === "mcq" && options.length >= 2 ? "mcq" : "text",
        options,
        marks: q.marks || "1",
      };
    })
    .filter((q) => q.text)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
