import { Sparkles, Layers3, CheckCircle2, Users, Download, AlertTriangle } from "lucide-react";

import { getOccupancy } from "./occupancy";

const BAR_COLORS = [
  "bg-[#008388]",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

export default function BatchInsights({ batches = [], onExportCsv }) {
  const totalBatches = batches.length;
  const activeBatches = batches.filter((b) => b.status === "Active").length;
  const activePct = totalBatches
    ? Math.round((activeBatches / totalBatches) * 100)
    : 0;

  const totalCapacity = batches.reduce(
    (sum, b) => sum + (Number(b.capacity) || 0),
    0
  );

  const totalEnrolled = batches.reduce(
    (sum, b) => sum + (Number(b.enrolled) || 0),
    0
  );

  const avgOccupancy = totalCapacity
    ? Math.round((totalEnrolled / totalCapacity) * 100)
    : 0;

  const classCounts = batches.reduce((acc, b) => {
    const key = b.className || "Unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topClasses = Object.entries(classCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxClassCount = topClasses[0]?.[1] || 1;

  const nearingCapacity = [...batches]
    .map((b) => ({ batch: b, occupancy: getOccupancy(b) }))
    .filter((entry) => entry.occupancy.capacity > 0 && entry.occupancy.pct >= 80)
    .sort((a, b) => b.occupancy.pct - a.occupancy.pct)
    .slice(0, 4);

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-[#008388]" />
        <h2 className="text-lg font-bold text-slate-800">
          Batch Insights
        </h2>
      </div>

      {/* Stat cards */}

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 space-y-5">

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF8F8] text-[#008388] flex items-center justify-center shrink-0">
            <Layers3 size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {totalBatches}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total Batches</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {activeBatches}
              <span className="text-sm font-medium text-gray-400 ml-1">
                / {totalBatches}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Active · {activePct}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {totalEnrolled}
              <span className="text-sm font-medium text-gray-400 ml-1">
                / {totalCapacity}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Enrolled · {avgOccupancy}% full
            </p>
          </div>
        </div>

      </div>

      {/* Class distribution */}

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">

        <h3 className="font-bold text-slate-800 mb-4">
          Batches by Class
        </h3>

        {topClasses.length === 0 ? (
          <p className="text-sm text-gray-400">No batches yet.</p>
        ) : (
          <div className="space-y-4">
            {topClasses.map(([className, count], index) => (
              <div key={className}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-600 truncate">
                    {className}
                  </span>
                  <span className="text-gray-400 shrink-0 ml-2">
                    {count}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`}
                    style={{ width: `${(count / maxClassCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Nearing capacity */}

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">

        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="font-bold text-slate-800">
            Nearing Capacity
          </h3>
        </div>

        {nearingCapacity.length === 0 ? (
          <p className="text-sm text-gray-400">
            No batches are close to full.
          </p>
        ) : (
          <div className="space-y-4">
            {nearingCapacity.map(({ batch, occupancy }) => (
              <div key={batch.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {batch.batchName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {occupancy.enrolled}/{occupancy.capacity} seats filled
                  </p>
                </div>
                <span
                  className={`text-xs font-bold shrink-0 ${
                    occupancy.pct >= 100 ? "text-red-600" : "text-amber-600"
                  }`}
                >
                  {occupancy.pct}%
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Export */}

      <button
        onClick={onExportCsv}
        className="w-full rounded-[28px] bg-gradient-to-r from-[#008388] to-cyan-500 text-white p-5 flex items-center justify-between shadow-lg hover:shadow-xl transition"
      >
        <div className="text-left">
          <p className="font-bold">Export Batch List</p>
          <p className="text-xs text-white/80 mt-0.5">
            Download as CSV
          </p>
        </div>
        <Download size={20} />
      </button>

    </div>
  );
}
