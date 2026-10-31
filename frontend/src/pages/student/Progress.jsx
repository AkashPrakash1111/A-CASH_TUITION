import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CalendarClock,
  Coins,
  Flame,
  Gift,
  History,
  LineChart,
  ListChecks,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { progressApi } from "../../services/api";
import {
  AllCaughtUp,
  Card,
  CardTitle,
  Empty,
  Heatmap,
  ProgressSkeleton,
  ResultRow,
  ScoreRing,
  StatTile,
  SubjectBars,
  TrendChart,
  UpcomingRow,
} from "../../components/progress/ProgressWidgets";
import { shortDate, tone } from "../../components/progress/progressUtils";

// "CLASS 7", "class-7" and "7" are the same group; don't print it twice.
const sameGroup = (a, b) => {
  const n = (v) => String(v || "").toLowerCase().replace(/^class/, "").replace(/[^a-z0-9]/g, "");
  return n(a) === n(b);
};

function overallMessage(d) {
  const { avg_pct, graded_count } = d.overall;
  if (avg_pct == null) return "Your average appears here as soon as your first assignment or exam is graded.";
  const t = tone(avg_pct).label.toLowerCase();
  return `${t.charAt(0).toUpperCase() + t.slice(1)} — averaged over ${graded_count} graded ${graded_count === 1 ? "item" : "items"} across ${d.subjects.filter((s) => s.graded_count).length} subject${d.subjects.filter((s) => s.graded_count).length === 1 ? "" : "s"}.`;
}

export default function StudentProgress() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    if (!token) return undefined;
    const ctrl = new AbortController();
    progressApi
      .me(token, ctrl.signal)
      .then((d) => {
        setData(d);
        setError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message || "Couldn't load your progress.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [token, reloadKey]);

  if (loading && !data) return <ProgressSkeleton />;

  if (error && !data) {
    return (
      <Card className="max-w-lg mx-auto text-center">
        <Empty icon={AlertTriangle}>{error}</Empty>
        <button
          onClick={reload}
          className="mt-2 px-5 py-2 rounded-2xl bg-[#008388] text-white text-xs font-bold hover:opacity-90 transition"
        >
          Try again
        </button>
      </Card>
    );
  }

  const { student, overall, assignments, exams, streak, cash, subjects, trend, recent_results, upcoming, heatmap } = data;
  const rankPct = cash.next_rank_at ? Math.min(100, Math.round((cash.balance / cash.next_rank_at) * 100)) : 100;
  const streakSub = streak.current === 0
    ? streak.longest ? `Best: ${streak.longest} days — submit work to restart` : "Submit work to start a streak"
    : streak.active_today ? `Best: ${streak.longest} · done for today ✓` : `Best: ${streak.longest} · submit today to keep it`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[28px] px-7 py-6 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-[#008388] text-xs font-semibold mb-2">
            <Sparkles size={14} /> Class {student.className}
            {student.batch && !sameGroup(student.batch, student.className) ? ` · ${student.batch}` : ""}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">My Progress</h1>
          <p className="text-slate-500 text-sm mt-1">
            {student.name}, here is how you're doing — updated live from your graded work.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={reload}
            disabled={loading}
            aria-label="Refresh"
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "motion-safe:animate-spin" : ""} />
          </button>
          <Link
            to="/student/parent-view"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow-md transition"
          >
            Guardian view →
          </Link>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-rose-600 bg-rose-50 rounded-2xl px-4 py-2.5">
          Couldn't refresh: {error}. Showing the last loaded data.
        </p>
      )}

      {/* Hero: ring + KPI tiles */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center text-center gap-4 bg-gradient-to-b from-white to-cyan-50/50">
          <ScoreRing pct={overall.avg_pct} grade={overall.grade} />
          <div>
            <h2 className="text-sm font-bold text-slate-800">Overall average</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-[260px]">{overallMessage(data)}</p>
          </div>
        </Card>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <StatTile
            icon={Flame}
            accent="bg-amber-50 text-amber-500"
            label="Day streak"
            value={`${streak.current} ${streak.current === 1 ? "day" : "days"}`}
            sub={streakSub}
          />
          <StatTile
            icon={ListChecks}
            accent="bg-emerald-50 text-emerald-600"
            label="Assignments done"
            value={assignments.completion_pct == null ? "—" : `${assignments.completion_pct}%`}
            sub={
              assignments.total
                ? `${assignments.submitted}/${assignments.total} submitted${assignments.overdue ? ` · ${assignments.overdue} overdue` : ""}`
                : "None assigned yet"
            }
          />
          <StatTile
            icon={Award}
            accent="bg-purple-50 text-purple-600"
            label="Exam average"
            value={exams.avg_pct == null ? "—" : `${exams.avg_pct}%`}
            sub={
              exams.total
                ? `${exams.graded} graded of ${exams.total}${exams.best_pct != null ? ` · best ${exams.best_pct}%` : ""}`
                : "No exams yet"
            }
          />
          <StatTile
            icon={Coins}
            accent="bg-yellow-50 text-yellow-600"
            label="CASH balance"
            value={cash.balance.toLocaleString()}
            sub={`${cash.rank}${cash.next_rank ? ` · ${cash.next_rank_at - cash.balance} to ${cash.next_rank}` : " · top rank 🎉"}`}
          />
        </div>
      </div>

      {/* Trend + subjects */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardTitle icon={LineChart}>Score trend</CardTitle>
          {trend.length ? (
            <>
              <TrendChart points={trend} />
              <p className="text-[11px] text-slate-400 mt-2">Last {trend.length} graded exam{trend.length === 1 ? "" : "s"} and assignments, oldest to newest. Hover a point for details.</p>
            </>
          ) : (
            <Empty icon={TrendingUp}>Your trend line draws itself once teachers grade your work.</Empty>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle icon={Target} to="/student/subjects" linkLabel="Subjects →">By subject</CardTitle>
          {subjects.length ? (
            <SubjectBars subjects={subjects} />
          ) : (
            <Empty icon={Target}>Subjects appear once you have assignments or exams.</Empty>
          )}
        </Card>
      </div>

      {/* Upcoming + activity */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardTitle icon={CalendarClock} to="/student/assignments" linkLabel="Assignments →">To do next</CardTitle>
          {upcoming.length ? (
            <ul className="-mx-2 space-y-0.5">
              {upcoming.map((u) => <UpcomingRow key={`${u.kind}-${u.id}`} item={u} />)}
            </ul>
          ) : (
            <AllCaughtUp />
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle icon={Flame}>Last 4 weeks</CardTitle>
          <Heatmap days={heatmap} />
          <p className="text-[11px] text-slate-400 mt-3">
            {streak.active_days
              ? `Active on ${streak.active_days} day${streak.active_days === 1 ? "" : "s"} overall · longest streak ${streak.longest}.`
              : "Each square is a day you submitted an assignment or exam."}
          </p>
        </Card>
      </div>

      {/* Results + CASH */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardTitle icon={Award} to="/student/exams" linkLabel="Exams →">Recent results</CardTitle>
          {recent_results.length ? (
            <ul className="-mx-2 space-y-0.5">
              {recent_results.map((r) => <ResultRow key={`${r.kind}-${r.id}`} item={r} />)}
            </ul>
          ) : (
            <Empty icon={Award}>
              Nothing graded yet. {assignments.submitted + exams.attempted > 0 ? "Your submitted work is waiting for a teacher." : "Submit an assignment or take an exam to get started."}
            </Empty>
          )}
        </Card>

        <section className="lg:col-span-2 relative overflow-hidden rounded-[28px] bg-gradient-to-br from-amber-500 via-purple-700 to-indigo-800 text-white p-6 shadow-lg">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative">
            <h3 className="text-base font-bold flex items-center gap-2"><Coins size={18} className="text-amber-300" /> CASH wallet</h3>
            <p className="text-4xl font-black mt-3 text-amber-300">{cash.balance.toLocaleString()}</p>
            <div className="flex gap-4 text-[11px] text-white/80 mt-1">
              <span>Earned <strong className="text-white">{cash.earned.toLocaleString()}</strong></span>
              <span>Spent <strong className="text-white">{cash.spent.toLocaleString()}</strong></span>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                <span>{cash.rank}</span>
                <span className="text-white/70">{cash.next_rank ? `${cash.next_rank} at ${cash.next_rank_at}` : "Max rank"}</span>
              </div>
              <div className="h-2.5 rounded-full bg-black/25 overflow-hidden">
                <div className="h-full rounded-full bg-amber-300 motion-safe:transition-[width] motion-safe:duration-700" style={{ width: `${rankPct}%` }} />
              </div>
            </div>

            <div className="mt-5 border-t border-white/15 pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5 mb-2"><History size={12} /> Latest activity</p>
              {cash.transactions.length ? (
                <ul className="space-y-2">
                  {cash.transactions.slice(0, 4).map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-white/90">{t.description}</span>
                      <span className={`font-bold shrink-0 ${t.amount >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {t.amount >= 0 ? "+" : ""}{t.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/70">No transactions yet.</p>
              )}
            </div>

            <Link
              to="/student/cashmart"
              className="mt-5 w-full px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs hover:bg-amber-50 transition flex items-center justify-center gap-2"
            >
              <Gift size={15} className="text-amber-500" /> Spend in CASHMART
            </Link>
          </div>
        </section>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Marks show only after your teacher releases them · as of {shortDate(data.today)}
      </p>
    </div>
  );
}
