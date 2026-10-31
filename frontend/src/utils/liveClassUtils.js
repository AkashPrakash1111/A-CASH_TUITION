// Shared helpers for the Live Classes pages (admin + student) so both sides
// work out status, platform and times the same way.

export const JOIN_EARLY_MINUTES = 10;
const DEFAULT_MINUTES = 60;

// "17:00", "5:00 PM" -> { h, m } (24h) or null.
export function parseTime(text) {
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

const pad = (n) => String(n).padStart(2, "0");

export function toHHMM(time) {
  return time ? `${pad(time.h)}:${pad(time.m)}` : "";
}

export function addMinutes(timeText, minutes) {
  const t = parseTime(timeText);
  if (!t) return "";
  const total = (t.h * 60 + t.m + (parseInt(minutes, 10) || 0)) % (24 * 60);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function minutesBetween(startText, endText) {
  const a = parseTime(startText);
  const b = parseTime(endText);
  if (!a || !b) return null;
  let diff = b.h * 60 + b.m - (a.h * 60 + a.m);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

export function durationMinutes(cls) {
  return minutesBetween(cls?.startTime, cls?.endTime) || DEFAULT_MINUTES;
}

// Start and end as Date objects in the viewer's local time, or null when the
// class has no usable date/time yet.
export function classWindow(cls) {
  if (!cls?.scheduledDate) return null;
  const day = new Date(`${cls.scheduledDate}T00:00:00`);
  if (Number.isNaN(day.getTime())) return null;
  const t = parseTime(cls.startTime);
  if (!t) return null;
  const start = new Date(day);
  start.setHours(t.h, t.m, 0, 0);
  const end = new Date(start.getTime() + durationMinutes(cls) * 60000);
  return { start, end };
}

// Upcoming | Live Now | Ended, worked out from the clock. (The stored `status`
// column is never updated by anything, so it cannot be trusted.)
export function liveStatus(cls, now = new Date()) {
  const w = classWindow(cls);
  if (!w) return "Upcoming";
  if (now < w.start) return "Upcoming";
  return now < w.end ? "Live Now" : "Ended";
}

// True from JOIN_EARLY_MINUTES before the start until the class ends.
export function isJoinable(cls, now = new Date()) {
  const w = classWindow(cls);
  if (!w) return false;
  return now >= new Date(w.start.getTime() - JOIN_EARLY_MINUTES * 60000) && now < w.end;
}

export function startsIn(cls, now = new Date()) {
  const w = classWindow(cls);
  if (!w || now >= w.start) return "";
  const mins = Math.round((w.start - now) / 60000);
  if (mins < 1) return "starting now";
  if (mins < 60) return `in ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `in ${hours} h ${mins % 60 ? `${mins % 60} min` : ""}`.trim();
  const days = Math.floor(hours / 24);
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

export function detectPlatform(url) {
  const link = (url || "").toLowerCase();
  if (!link) return "";
  if (link.includes("meet.google.")) return "Google Meet";
  if (link.includes("zoom.us") || link.includes("zoom.com")) return "Zoom";
  if (link.includes("youtube.com") || link.includes("youtu.be")) return "YouTube Live";
  if (link.includes("teams.microsoft") || link.includes("teams.live")) return "Microsoft Teams";
  if (link.includes("webex.com")) return "Webex";
  return "Online";
}

// "https://meet.google.com/abc-defg-hij?x=1" -> "meet.google.com/abc-defg-hij"
export function shortLink(url) {
  return (url || "").replace(/^https?:\/\//i, "").replace(/[?#].*$/, "").replace(/\/$/, "");
}

export function formatDate(dateText) {
  if (!dateText) return "Date to be announced";
  const d = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateText;
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function formatTime(timeText) {
  const t = parseTime(timeText);
  if (!t) return timeText || "";
  const h12 = t.h % 12 === 0 ? 12 : t.h % 12;
  return `${h12}:${pad(t.m)} ${t.h < 12 ? "AM" : "PM"}`;
}

export function isToday(cls, now = new Date()) {
  const w = classWindow(cls);
  return Boolean(w) && w.start.toDateString() === now.toDateString();
}

// Live first, then upcoming (soonest first), then ended (most recent first).
export function compareClasses(a, b, now = new Date()) {
  const order = { "Live Now": 0, Upcoming: 1, Ended: 2 };
  const sa = liveStatus(a, now);
  const sb = liveStatus(b, now);
  if (sa !== sb) return order[sa] - order[sb];
  const wa = classWindow(a)?.start.getTime() ?? Infinity;
  const wb = classWindow(b)?.start.getTime() ?? Infinity;
  return sa === "Ended" ? wb - wa : wa - wb;
}

// Who the class is for, in words: "Class 10 · BATCH-10" / "Class 10 · all batches".
export function audienceLabel(cls) {
  const klass = cls?.className ? `Class ${String(cls.className).replace(/^class\s*/i, "")}` : "";
  const batch = (cls?.batch || "").trim();
  const wild = !batch || /^all( batches)?$/i.test(batch);
  if (klass && wild) return `${klass} · all batches`;
  if (klass) return `${klass} · ${batch}`;
  return batch && !wild ? batch : "Everyone";
}
