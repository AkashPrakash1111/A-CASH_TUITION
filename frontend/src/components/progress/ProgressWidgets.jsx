import { Link } from "react-router-dom";
import { tone, shortDate, dueLabel } from "./progressUtils";
import { CheckCircle2, ClipboardCheck, FileText, TrendingUp } from "lucide-react";

/* ------------------------------------------------------------------ helpers */

export function Card({ children, className = "" }) {
  return (
    <section className={`bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 ${className}`}>
      {children}
    </section>
  );
}

export function CardTitle({ icon: Icon, children, to, linkLabel = "View all →" }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
        {Icon && <Icon size={18} className="text-[#008388]" />} {children}
      </h3>
      {to && (
        <Link to={to} className="text-xs font-semibold text-[#008388] hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export function Empty({ icon: Icon = TrendingUp, children }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 gap-2 text-slate-400">
      <Icon size={26} className="opacity-60" />
      <p className="text-xs max-w-[220px]">{children}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- score ring */

export function ScoreRing({ pct, grade, size = 168 }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const t = tone(pct);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={pct == null ? "No graded work yet" : `Overall average ${pct} percent`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        {pct != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={t.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * pct) / 100}
            className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-1000 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {pct == null ? (
          <span className="text-sm font-semibold text-slate-400 text-center px-6 leading-tight">No graded work yet</span>
        ) : (
          <>
            <span className="text-4xl font-black text-slate-800 leading-none">
              {pct}
              <span className="text-lg text-slate-400">%</span>
            </span>
            <span className={`mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${t.soft} ${t.text}`}>Grade {grade}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- stat tile */

export function StatTile({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${accent}`}>
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 leading-tight mt-0.5">{value}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sub}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- trend chart */

export function TrendChart({ points }) {
  const W = 600;
  const H = 220;
  const pad = { l: 34, r: 16, t: 14, b: 30 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const x = (i) => (points.length === 1 ? pad.l + innerW / 2 : pad.l + (i / (points.length - 1)) * innerW);
  const y = (v) => pad.t + innerH - (v / 100) * innerH;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.pct)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Score trend over recent graded work">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#008388" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#008388" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="#e2e8f0" strokeDasharray={g === 0 ? "" : "3 4"} />
          <text x={pad.l - 8} y={y(g) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{g}</text>
        </g>
      ))}
      {points.length > 1 && <path d={area} fill="url(#trendFill)" />}
      {points.length > 1 && <path d={line} fill="none" stroke="#008388" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {points.map((p, i) => (
        <g key={`${p.kind}-${p.id}`}>
          <circle cx={x(i)} cy={y(p.pct)} r="6" fill="#fff" stroke={tone(p.pct).stroke} strokeWidth="3">
            <title>{`${p.title} (${p.subject}) — ${p.obtained}/${p.max} · ${p.pct}%`}</title>
          </circle>
          {(points.length <= 6 || i % 2 === 0 || i === points.length - 1) && (
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">{shortDate(p.date)}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* --------------------------------------------------------- subject bars */

export function SubjectBars({ subjects }) {
  return (
    <ul className="space-y-4">
      {subjects.map((s) => {
        const t = tone(s.avg_pct);
        return (
          <li key={s.subject}>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span className="text-sm font-semibold text-slate-700 truncate capitalize">{s.subject.toLowerCase()}</span>
              <span className={`text-sm font-black ${t.text}`}>{s.avg_pct == null ? "—" : `${s.avg_pct}%`}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${t.bg} motion-safe:transition-[width] motion-safe:duration-700`}
                style={{ width: `${s.avg_pct ?? 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {s.assignments_done}/{s.assignments_total} assignments · {s.exams_done}/{s.exams_total} exams
              {s.graded_count === 0 && " · waiting for first grade"}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------- heatmap */

export function Heatmap({ days }) {
  const shade = (n) =>
    n === 0 ? "bg-slate-100" : n === 1 ? "bg-teal-200" : n === 2 ? "bg-teal-400" : "bg-teal-600";
  // Weeks run across, Monday first; pad the front so the first day lands on its weekday.
  const lead = (new Date(`${days[0].date}T00:00:00`).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...days];
  const today = days[days.length - 1].date;
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center text-[10px] font-semibold text-slate-400">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5" role="img" aria-label="Submissions in the last 28 days">
        {cells.map((d, i) =>
          d ? (
            <div
              key={d.date}
              title={`${shortDate(d.date)} — ${d.count} submission${d.count === 1 ? "" : "s"}`}
              className={`aspect-square rounded-lg ${shade(d.count)} ${d.date === today ? "ring-2 ring-[#008388] ring-offset-1" : ""}`}
            />
          ) : (
            <div key={`pad-${i}`} />
          ),
        )}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-400">
        Less
        {[0, 1, 2, 3].map((n) => (
          <span key={n} className={`w-3 h-3 rounded-sm ${shade(n)}`} />
        ))}
        More
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ list rows */

export function KindIcon({ kind }) {
  const Icon = kind === "exam" ? ClipboardCheck : FileText;
  return (
    <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${kind === "exam" ? "bg-purple-50 text-purple-600" : "bg-cyan-50 text-cyan-600"}`}>
      <Icon size={17} />
    </span>
  );
}

export function UpcomingRow({ item }) {
  const urgent = item.overdue || (item.days_left != null && item.days_left <= 1);
  return (
    <li>
      <Link
        to={item.kind === "exam" ? "/student/exams" : "/student/assignments"}
        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition"
      >
        <KindIcon kind={item.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
          <p className="text-[11px] text-slate-400 capitalize truncate">{item.subject.toLowerCase()} · {item.kind}</p>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${urgent ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"}`}>
          {dueLabel(item)}
        </span>
      </Link>
    </li>
  );
}

export function ResultRow({ item }) {
  const t = tone(item.pct);
  return (
    <li className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition">
      <KindIcon kind={item.kind} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
        <p className="text-[11px] text-slate-400 capitalize truncate">{item.subject.toLowerCase()} · {shortDate(item.date)}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-black ${t.text}`}>{item.pct}%</p>
        <p className="text-[11px] text-slate-400">{item.obtained}/{item.max}</p>
      </div>
    </li>
  );
}

export function AllCaughtUp() {
  return <Empty icon={CheckCircle2}>You're all caught up — nothing pending right now.</Empty>;
}

/* -------------------------------------------------------------- skeleton */

export function ProgressSkeleton() {
  const block = "bg-slate-200/70 rounded-[28px] motion-safe:animate-pulse";
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading your progress">
      <div className={`${block} h-28`} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`${block} h-64`} />
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className={`${block} h-28`} />)}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`${block} h-72`} />
        <div className={`${block} h-72`} />
      </div>
    </div>
  );
}
