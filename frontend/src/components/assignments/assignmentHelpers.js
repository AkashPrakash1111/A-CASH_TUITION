// Small shared helpers for the assignment screens (teacher and student).

// Due dates are stored as "YYYY-MM-DD". An assignment is due until the END of
// that day, in the viewer's own time zone.
export function parseDueDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59);
}

export function isPastDue(value, now = new Date()) {
  const due = parseDueDate(value);
  return Boolean(due && now > due);
}

export function formatDue(value) {
  const due = parseDueDate(value);
  if (!due) return "No due date";
  return due.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// "Due today", "Due tomorrow", "Due in 3 days", "Overdue by 2 days"
export function dueLabel(value, now = new Date()) {
  const due = parseDueDate(value);
  if (!due) return "No due date";

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const days = Math.round((startOfDue - startOfToday) / 86400000);

  if (days < 0) return `Overdue by ${-days} day${days === -1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function summarizeAttachments(list = []) {
  const count = (type) => list.filter((a) => a.type === type).length;
  const parts = [];
  const images = count("image");
  const pdfs = count("pdf");
  const audio = count("audio");
  if (images) parts.push(`${images} photo${images === 1 ? "" : "s"}`);
  if (pdfs) parts.push(`${pdfs} PDF${pdfs === 1 ? "" : "s"}`);
  if (audio) parts.push(`${audio} audio`);
  return parts.join(" · ");
}

// What the student sees for the state of their own work.
export function submissionState(assignment) {
  const status = assignment.submission_status;
  if (!assignment.is_submitted) return "todo";
  if (status === "Reviewed") return "graded";
  if (status === "Returned") return "returned";
  return status === "Late" ? "late" : "submitted";
}
