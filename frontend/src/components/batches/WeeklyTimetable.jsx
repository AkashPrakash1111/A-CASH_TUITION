import { CalendarX2 } from "lucide-react";

import { WEEKDAYS, parseDays, parseStartMinutes } from "./scheduleUtils";
import { getOccupancy } from "./occupancy";

export default function WeeklyTimetable({ batches = [], onView }) {
  const columns = WEEKDAYS.map((day) => {
    const dayBatches = batches
      .filter((batch) => parseDays(batch.days).includes(day.key))
      .sort((a, b) => {
        const aMin = parseStartMinutes(a.time);
        const bMin = parseStartMinutes(b.time);

        if (aMin === null && bMin === null) return 0;
        if (aMin === null) return 1;
        if (bMin === null) return -1;

        return aMin - bMin;
      });

    return { ...day, batches: dayBatches };
  });

  // Batches whose "days" text didn't match any recognizable weekday —
  // surfaced explicitly rather than silently dropped from the grid.
  const unscheduled = batches.filter(
    (batch) => parseDays(batch.days).length === 0
  );

  return (
    <div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">

        {columns.map((day) => (
          <div key={day.key} className="min-w-0">

            <div className="text-center mb-3">
              <p className="text-sm font-bold text-slate-700">{day.key}</p>
              <p className="text-xs text-gray-400">{day.batches.length} class{day.batches.length === 1 ? "" : "es"}</p>
            </div>

            <div className="space-y-3">

              {day.batches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 h-20 flex items-center justify-center text-xs text-gray-300">
                  —
                </div>
              ) : (
                day.batches.map((batch) => {
                  const { pct, barColor } = getOccupancy(batch);

                  return (
                    <button
                      key={batch.id}
                      onClick={() => onView(batch)}
                      className="w-full text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-3"
                    >
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {batch.batchName}
                      </p>

                      {batch.time && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {batch.time}
                        </p>
                      )}

                      {batch.subject && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#EAF8F8] text-[#008388] text-[10px] font-semibold truncate max-w-full">
                          {batch.subject}
                        </span>
                      )}

                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              )}

            </div>

          </div>
        ))}

      </div>

      {unscheduled.length > 0 && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-[28px] p-6">

          <div className="flex items-center gap-2 mb-4">
            <CalendarX2 size={18} className="text-amber-600" />
            <h3 className="font-bold text-amber-800">
              Unscheduled — days not recognized
            </h3>
          </div>

          <p className="text-sm text-amber-700 mb-4">
            These batches have a "days" value that doesn't match a weekday
            name. Edit them to set proper days so they appear on the grid
            above.
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            {unscheduled.map((batch) => (
              <button
                key={batch.id}
                onClick={() => onView(batch)}
                className="text-left bg-white rounded-2xl px-4 py-3 hover:shadow-md transition"
              >
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {batch.batchName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {batch.days || "No days set"}
                </p>
              </button>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
