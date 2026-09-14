const COLORS = [
  "bg-[#008388]",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-emerald-500",
];

export default function BarChartPanel({ title, data, emptyLabel = "No data yet." }) {
  const max = Math.max(1, ...data.map((d) => d[1]));

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 h-full">

      <h3 className="font-bold text-slate-800 mb-6">{title}</h3>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyLabel}</p>
      ) : (
        <div className="flex items-end gap-4 h-48">
          {data.map(([label, value], index) => (
            <div key={label} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">

              <span className="text-xs font-bold text-slate-600 mb-1.5">
                {value}
              </span>

              <div
                className={`w-full rounded-t-lg ${COLORS[index % COLORS.length]}`}
                style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
              />

              <span className="text-[11px] text-gray-400 mt-2 text-center truncate w-full" title={label}>
                {label}
              </span>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
