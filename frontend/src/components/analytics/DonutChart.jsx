const DEFAULT_COLORS = ["#008388", "#3b82f6", "#f59e0b", "#8b5cf6", "#f43f5e", "#10b981"];

export default function DonutChart({
  data = [],
  size = 160,
  strokeWidth = 22,
  colors = DEFAULT_COLORS,
  centerLabel,
  centerValue,
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">

      <div className="relative shrink-0" style={{ width: size, height: size }}>

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>

            {total === 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
            ) : (
              data.map((item, index) => {
                const fraction = item.value / total;
                const dash = fraction * circumference;
                const offset = cumulative;
                cumulative += dash;

                return (
                  <circle
                    key={item.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap={data.length > 1 ? "butt" : "round"}
                  />
                );
              })
            )}

          </g>
        </svg>

        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue !== undefined && (
              <p className="text-2xl font-bold text-slate-800 leading-none">
                {centerValue}
              </p>
            )}
            {centerLabel && (
              <p className="text-xs text-gray-400 mt-1">{centerLabel}</p>
            )}
          </div>
        )}

      </div>

      <div className="space-y-2.5 min-w-0">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-slate-600 truncate">{item.label}</span>
            <span className="text-gray-400 font-medium shrink-0">
              {item.value}
              {total > 0 && (
                <span className="ml-1">
                  ({Math.round((item.value / total) * 100)}%)
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
