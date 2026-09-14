import { useEffect, useState } from "react";

import { WEEKDAYS, parseDays, formatDays, splitTimeRange, formatTimeRange } from "./scheduleUtils";

export default function DayTimePicker({
  days,
  time,
  onDaysChange,
  onTimeChange,
}) {
  const [selectedDays, setSelectedDays] = useState(() => parseDays(days));
  const [range, setRange] = useState(() => splitTimeRange(time));

  // Re-sync if a different batch is loaded into the form (edit mode).
  useEffect(() => {
    setSelectedDays(parseDays(days));
    setRange(splitTimeRange(time));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const toggleDay = (key) => {
    const next = selectedDays.includes(key)
      ? selectedDays.filter((d) => d !== key)
      : [...selectedDays, key];

    setSelectedDays(next);
    onDaysChange(formatDays(next));
  };

  const updateRange = (part, value) => {
    const next = { ...range, [part]: value };
    setRange(next);
    onTimeChange(formatTimeRange(next.start, next.end));
  };

  return (
    <div className="space-y-4">

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Days
        </label>

        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => {
            const active = selectedDays.includes(day.key);

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`w-11 h-11 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-[#008388] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {day.key}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Start Time
          </label>

          <input
            type="time"
            value={range.start}
            onChange={(e) => updateRange("start", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            End Time
          </label>

          <input
            type="time"
            value={range.end}
            onChange={(e) => updateRange("end", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20"
          />
        </div>

      </div>

    </div>
  );
}
