import { WEEKDAYS, parseDays } from "./scheduleUtils";

export default function WeekStrip({ days = "", size = "w-6 h-6" }) {
  const activeDays = parseDays(days);

  return (
    <div className="flex items-center gap-1">
      {WEEKDAYS.map((day) => {
        const active = activeDays.includes(day.key);

        return (
          <div
            key={day.key}
            title={day.full}
            className={`
              ${size}
              rounded-md
              flex
              items-center
              justify-center
              text-[10px]
              font-bold
              shrink-0
              ${
                active
                  ? "bg-[#008388] text-white"
                  : "bg-slate-100 text-slate-300"
              }
            `}
          >
            {day.key.charAt(0)}
          </div>
        );
      })}
    </div>
  );
}
