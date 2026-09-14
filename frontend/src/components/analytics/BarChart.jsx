const DEFAULT_COLORS = [
  "bg-[#008388]",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-indigo-500",
];

export default function BarChart({ data = [], height = 200, colors = DEFAULT_COLORS }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-gray-400"
        style={{ height }}
      >
        No data yet.
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((item, index) => {
        const barHeightPct = Math.max((item.value / maxValue) * 100, 3);

        return (
          <div key={item.label} className="flex-1 flex flex-col items-center h-full min-w-0">

            <div className="flex-1 w-full flex items-end justify-center">
              <div
                className="w-full max-w-10 rounded-t-lg relative group"
                style={{ height: `${barHeightPct}%` }}
              >
                <div
                  className={`w-full h-full rounded-t-lg ${colors[index % colors.length]}`}
                  title={`${item.label}: ${item.value}`}
                />

                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 whitespace-nowrap">
                  {item.value}
                </span>
              </div>
            </div>

            <p className="mt-2 text-xs font-medium text-gray-500 truncate max-w-full text-center">
              {item.label}
            </p>

          </div>
        );
      })}
    </div>
  );
}
