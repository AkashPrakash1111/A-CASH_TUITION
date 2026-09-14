import { Users, UserCheck, TrendingUp } from "lucide-react";
import Sparkline from "./Sparkline";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default function StudentStatsPanel({ students }) {
  const total = students.length;
  const active = students.filter((s) => s.status === "Active").length;
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;

  // Real, computed from actual created_at timestamps — not fabricated.
  const last7 = students.filter((s) => new Date(s.created_at) >= daysAgo(7)).length;
  const prev7 = students.filter(
    (s) => new Date(s.created_at) >= daysAgo(14) && new Date(s.created_at) < daysAgo(7)
  ).length;
  const weekDelta = last7 - prev7;

  // Real daily enrollment counts for the last 7 days, for the sparkline.
  const dailyCounts = Array.from({ length: 7 }, (_, i) => {
    const dayStart = daysAgo(6 - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return students.filter((s) => {
      const created = new Date(s.created_at);
      return created >= dayStart && created < dayEnd;
    }).length;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.05)] p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <Users size={18} />
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Total Students
          </p>
        </div>
        <p className="text-3xl font-extrabold text-slate-800 mt-2">{total}</p>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.05)] p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008388] to-cyan-500 flex items-center justify-center text-white">
            <UserCheck size={18} />
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Active Students
          </p>
        </div>
        <p className="text-3xl font-extrabold text-slate-800 mt-2">{active}</p>
        <p className="text-xs text-slate-400 mt-1">{activePct}% of total</p>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.05)] p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              New This Week
            </p>
          </div>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <p className="text-3xl font-extrabold text-slate-800">{last7}</p>
            {prev7 > 0 && (
              <p className={`text-xs mt-1 ${weekDelta >= 0 ? "text-emerald-600" : "text-slate-400"}`}>
                {weekDelta >= 0 ? "+" : ""}
                {weekDelta} vs last week
              </p>
            )}
          </div>
          <Sparkline values={dailyCounts} color="#10b981" />
        </div>
      </div>
    </div>
  );
}
