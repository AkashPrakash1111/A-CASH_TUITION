// Canonical weekday order used across the batches module.
export const WEEKDAYS = [
  { key: "Mon", full: "Monday" },
  { key: "Tue", full: "Tuesday" },
  { key: "Wed", full: "Wednesday" },
  { key: "Thu", full: "Thursday" },
  { key: "Fri", full: "Friday" },
  { key: "Sat", full: "Saturday" },
  { key: "Sun", full: "Sunday" },
];

// Batches were historically saved with a free-text "days" field (e.g.
// "Mon, Wed, Fri" or "Monday & Wednesday"). Rather than requiring a data
// migration, we parse whichever weekday names appear in the string —
// this keeps old records working while the picker UI writes a clean,
// consistent format going forward.
export function parseDays(daysString = "") {
  if (!daysString) return [];

  const lower = daysString.toLowerCase();

  return WEEKDAYS.filter(
    (day) =>
      lower.includes(day.key.toLowerCase()) ||
      lower.includes(day.full.toLowerCase())
  ).map((day) => day.key);
}

export function formatDays(dayKeys = []) {
  return WEEKDAYS.filter((day) => dayKeys.includes(day.key))
    .map((day) => day.key)
    .join(", ");
}

// Best-effort extraction of a start time (in minutes since midnight) from
// a free-text time string, for sorting within a timetable column. Returns
// null when nothing recognizable is found, rather than guessing.
export function parseStartMinutes(timeString = "") {
  if (!timeString) return null;

  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);

  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return hours * 60 + minutes;
}

// Splits a "start - end" style time string into its two halves, tolerant
// of missing parts. Used to seed the time-range picker from existing data.
export function splitTimeRange(timeString = "") {
  if (!timeString) return { start: "", end: "" };

  const [start = "", end = ""] = timeString.split("-").map((s) => s.trim());

  return { start, end };
}

export function formatTimeRange(start, end) {
  if (start && end) return `${start} - ${end}`;
  return start || end || "";
}
