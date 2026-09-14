import { getOccupancy } from "../batches/occupancy";

export default function BatchOccupancyList({ batches = [], limit = 6 }) {
  const sorted = [...batches]
    .map((batch) => ({ batch, occupancy: getOccupancy(batch) }))
    .sort((a, b) => b.occupancy.pct - a.occupancy.pct)
    .slice(0, limit);

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-400">No batches yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sorted.map(({ batch, occupancy }) => (
        <div key={batch.id}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-600 truncate">
              {batch.batchName}
              {batch.className ? ` · ${batch.className}` : ""}
            </span>
            <span className={`font-bold shrink-0 ml-2 ${occupancy.textColor}`}>
              {occupancy.enrolled}/{occupancy.capacity || "--"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${occupancy.barColor}`}
              style={{ width: `${occupancy.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
