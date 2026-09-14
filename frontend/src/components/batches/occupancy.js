export function getOccupancy(batch) {
  const capacity = Number(batch.capacity) || 0;
  const enrolled = Number(batch.enrolled) || 0;

  const pct = capacity > 0 ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;

  let barColor = "bg-green-500";
  let textColor = "text-green-600";

  if (pct >= 100) {
    barColor = "bg-red-500";
    textColor = "text-red-600";
  } else if (pct >= 80) {
    barColor = "bg-amber-500";
    textColor = "text-amber-600";
  }

  return { capacity, enrolled, pct, barColor, textColor };
}
