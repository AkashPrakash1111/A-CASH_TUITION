// One colour scale for every score on the page, so a number always means the same thing.
export function tone(pct) {
  if (pct == null) return { text: "text-slate-400", bg: "bg-slate-300", soft: "bg-slate-100", stroke: "#cbd5e1", label: "No score yet" };
  if (pct >= 80) return { text: "text-emerald-600", bg: "bg-emerald-500", soft: "bg-emerald-50", stroke: "#10b981", label: "Excellent" };
  if (pct >= 60) return { text: "text-teal-600", bg: "bg-teal-500", soft: "bg-teal-50", stroke: "#14b8a6", label: "Good" };
  if (pct >= 40) return { text: "text-amber-600", bg: "bg-amber-500", soft: "bg-amber-50", stroke: "#f59e0b", label: "Getting there" };
  return { text: "text-rose-600", bg: "bg-rose-500", soft: "bg-rose-50", stroke: "#f43f5e", label: "Needs focus" };
}

export function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso.endsWith("Z") ? iso : `${iso}Z`);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function dueLabel(item) {
  if (item.due == null) return "No due date";
  if (item.overdue) return `Overdue · ${shortDate(item.due)}`;
  if (item.days_left === 0) return "Due today";
  if (item.days_left === 1) return "Due tomorrow";
  return `${item.days_left} days left · ${shortDate(item.due)}`;
}
