// Groups records by a key, treating missing/empty values as "Unassigned"
// rather than silently dropping them from the count.
export function groupByCount(records, keyFn) {
  return records.reduce((acc, record) => {
    const key = keyFn(record) || "Unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function topEntries(countMap, limit = 6) {
  return Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

// Buckets records into the last N calendar weeks (oldest first) based on a
// real created_at timestamp. Weeks with zero records still appear, so a
// quiet week reads as "zero", not as a missing data point.
export function weeklyTrend(records, weeks = 8) {
  const now = new Date();

  const startOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - day);
    return date;
  };

  const thisWeekStart = startOfWeek(now);

  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = new Date(thisWeekStart);
    start.setDate(start.getDate() - (weeks - 1 - i) * 7);
    return { start, count: 0 };
  });

  records.forEach((record) => {
    if (!record.created_at) return;

    const created = new Date(record.created_at);
    const weekStart = startOfWeek(created);

    const bucket = buckets.find((b) => b.start.getTime() === weekStart.getTime());
    if (bucket) bucket.count += 1;
  });

  return buckets.map((b) => ({
    label: b.start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: b.count,
  }));
}

export function percentage(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

// Sums a numeric value per group instead of just counting occurrences —
// e.g. total students enrolled per subject, not just batch count.
export function sumByKey(records, keyFn, valueFn) {
  return records.reduce((acc, record) => {
    const key = keyFn(record) || "Unassigned";
    acc[key] = (acc[key] || 0) + (Number(valueFn(record)) || 0);
    return acc;
  }, {});
}

// Converts a { label: count } map into the { label, value } shape the
// DonutChart expects, sorted largest first.
export function toChartData(countMap, limit) {
  const entries = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  return limit ? entries.slice(0, limit) : entries;
}
