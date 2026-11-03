import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Video,
  Bot,
  Users,
  GraduationCap,
  ChevronRight,
  Clock,
  Award,
  Flame,
  Coins,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { notesApi, liveClassesApi, progressApi } from "../../services/api";
import { dueLabel } from "../../components/progress/progressUtils";
import { buildAvatarUrl, getDefaultAvatarConfig } from "../../components/avatar/dicebearOptions";
import CampusMap from "../../components/dashboard/CampusMap";

const ELEMENTAL_MASCOTS = {
  cosmic: { name: "Nova", title: "The Celestial Guide", advice: "The cosmic alignment favors deep focus today. Check your notes in the Knowledge Library!" },
  crystal: { name: "Kira", title: "The Prism of Clarity", advice: "Remember: structured revision yields crystalline understanding. Keep your streak shining!" },
  leaf: { name: "Sprout", title: "The Verdant Sage", advice: "Growth happens one assignment at a time. Plant a seed of effort this morning!" },
  fire: { name: "Ignis", title: "The Spark of Passion", advice: "Fuel your drive! Finish that pending quest before the timer counts down!" },
  water: { name: "Nami", title: "The Flowing Current", advice: "Flow through challenges smoothly. Don't stress, prepare step by step!" },
  lightning: { name: "Volt", title: "The Flash of Insight", advice: "Quick reflexes! Solve practice questions with speed and precision today!" },
  ice: { name: "Glacie", title: "The Calm Strategist", advice: "Stay cool under exam pressure. Steady preparation is your superpower!" },
  cloud: { name: "Nimbus", title: "The Dream Dreamer", advice: "Reach for higher horizons! Every live class brings fresh discovery!" },
  blossom: { name: "Flora", title: "The Flourishing Bloom", advice: "Your learning garden is blossoming beautifully. Reach out to friends in Commons!" },
};

function parseAvatarConfig(user) {
  if (!user?.avatar_config) return getDefaultAvatarConfig();
  try {
    return JSON.parse(user.avatar_config);
  } catch {
    return getDefaultAvatarConfig();
  }
}

const HERO_STARS = [
  { l: "52%", t: "14%", s: 10, c: "text-amber-200", d: 0 },
  { l: "64%", t: "70%", s: 8, c: "text-white", d: 1.1 },
  { l: "72%", t: "22%", s: 14, c: "text-violet-200", d: 0.5 },
  { l: "84%", t: "60%", s: 9, c: "text-pink-200", d: 2 },
  { l: "90%", t: "16%", s: 11, c: "text-cyan-200", d: 1.6 },
  { l: "58%", t: "46%", s: 7, c: "text-white", d: 2.4 },
  { l: "8%", t: "12%", s: 8, c: "text-amber-200", d: 0.8 },
  { l: "40%", t: "88%", s: 9, c: "text-violet-200", d: 1.9 },
  { l: "95%", t: "84%", s: 8, c: "text-white", d: 0.3 },
];

function HeroStat({ icon: Icon, tint, label, value, sub }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 hover:bg-white/15 transition">
      <div className={`flex items-center gap-2 ${tint} text-xs font-semibold`}>
        <Icon size={15} /> {label}
      </div>
      <p className="text-xl font-bold mt-1 leading-tight">{value}</p>
      <p className="text-[10px] leading-tight text-slate-300/80 mt-0.5 min-h-[14px]">{sub}</p>
    </div>
  );
}

// A greeting that reflects what is actually true right now.
function heroLine(p) {
  if (!p) return "Your floating sanctuary for mastery, inquiry, and peer exploration.";
  if (p.assignments.overdue) return `${p.assignments.overdue} quest${p.assignments.overdue === 1 ? " is" : "s are"} overdue — a quick win today will set things right.`;
  if (p.assignments.pending) return `${p.assignments.pending} quest${p.assignments.pending === 1 ? "" : "s"} waiting for you. Explore the campus realms and tackle them one by one.`;
  return "Every quest is done — wander the campus, revisit your notes, or challenge yourself with an exam.";
}

// "Live Now" first, then the soonest class that hasn't finished. Teachers don't
// always flip a class to "Ended", so a class whose end time has passed is
// treated as over too.
function classEnd(c) {
  if (!c.scheduledDate) return null;
  const end = new Date(`${c.scheduledDate}T${c.endTime || c.startTime || "23:59"}`);
  return Number.isNaN(end.getTime()) ? null : end;
}

function pickNextLiveClass(list) {
  const now = new Date();
  const status = (c) => (c.status || "").toLowerCase();
  const live = list.find((c) => status(c) === "live now");
  if (live) return live;
  const open = list.filter((c) => {
    if (status(c) === "ended") return false;
    const end = classEnd(c);
    return !end || end >= now;
  });
  const key = (c) => `${c.scheduledDate || "9999-12-31"} ${c.startTime || "99:99"}`;
  return [...open].sort((x, y) => key(x).localeCompare(key(y)))[0] || null;
}

function liveWhen(c) {
  const date = c.scheduledDate ? new Date(`${c.scheduledDate}T00:00:00`) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = !date ? "Today" : date.getTime() === today.getTime() ? "Today"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return [day, c.startTime].filter(Boolean).join(" · ");
}

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [progress, setProgress] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  const avatarConfig = parseAvatarConfig(user);
  const avatarUrl = buildAvatarUrl(avatarConfig);

  const companionKey = avatarConfig.companion || "cosmic";
  const companion = ELEMENTAL_MASCOTS[companionKey] || ELEMENTAL_MASCOTS.cosmic;

  // One request for everything numeric (streak, balance, pending work, rank),
  // plus the two lists that live elsewhere. Each part fails on its own, so a
  // slow endpoint never blanks the rest of the page.
  useEffect(() => {
    if (!token) return undefined;
    const ctrl = new AbortController();

    const refresh = () =>
      Promise.allSettled([
        progressApi.me(token, ctrl.signal),
        notesApi.list(token),
        liveClassesApi.list(token),
      ]).then(([p, n, l]) => {
        if (ctrl.signal.aborted) return;
        if (p.status === "fulfilled") setProgress(p.value);
        if (n.status === "fulfilled") setNotes(Array.isArray(n.value) ? n.value : []);
        if (l.status === "fulfilled") setLiveClasses(Array.isArray(l.value) ? l.value : []);
        setLastSync(new Date());
      });

    // Live updates: load now, then every 30s while the tab is visible, and
    // again the moment the student comes back to the tab.
    refresh();
    const tick = () => { if (!document.hidden) refresh(); };
    const timer = setInterval(tick, 30000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      ctrl.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [token]);

  const upcoming = progress?.upcoming ?? [];
  const pendingAssignments = upcoming.filter((u) => u.kind === "assignment").slice(0, 3);
  const upcomingExams = upcoming.filter((u) => u.kind === "exam").slice(0, 2);
  const nextLive = pickNextLiveClass(liveClasses);
  const streak = progress?.streak;
  const cash = progress?.cash;
  const assignmentStats = progress?.assignments;
  const dash = "—";

  return (
    <div className="space-y-8 pb-12">
      {/* =========================================================================
          HERO BANNER: LIVING ISLAND ENTRANCE
      ========================================================================== */}
      <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1b1450] via-[#0B2545] to-[#006a70] p-8 md:p-12 text-white shadow-2xl border border-violet-300/20">
        {/* Night-sky magic: aurora glows, twinkling stars, a passing shooting star */}
        <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-violet-400/25 blur-3xl pointer-events-none aurora-blob" />
        <div className="absolute -left-24 -bottom-32 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl pointer-events-none aurora-blob" style={{ animationDelay: "-6s" }} />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-80 h-80 opacity-30 pointer-events-none hidden lg:block animate-float">
          <img
            src="/magic-campus-portal.png"
            alt=""
            className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(167,139,250,0.7)]"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        {HERO_STARS.map((st, i) => (
          <span
            key={i}
            className={`sparkle ${st.c}`}
            style={{ left: st.l, top: st.t, width: st.s, height: st.s, "--delay": `${st.d}s`, "--dur": `${3 + (i % 4)}s` }}
          />
        ))}
        <span className="shooting-star" style={{ right: "18%", top: "10%" }} />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-violet-200/30 text-violet-100 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
            <Sparkles size={14} className="text-amber-300" />
            Living Campus • Online Realm
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Welcome, <span className="shimmer-text">{user?.name || "Seeker"}</span> ✨
          </h1>
          <p className="mt-3 text-slate-200/90 text-sm sm:text-base leading-relaxed">
            {heroLine(progress)}
          </p>

          {/* Quick metrics: all real, refreshed every 30 seconds */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
            <HeroStat
              icon={Flame} tint="text-amber-300" label="Streak"
              value={streak ? `${streak.current} ${streak.current === 1 ? "day" : "days"}` : dash}
              sub={streak ? (streak.active_today ? "Done for today ✓" : streak.current ? "Submit today to keep it" : "Submit work to start") : ""}
            />
            <HeroStat
              icon={Coins} tint="text-yellow-300" label="CASH"
              value={cash ? cash.balance.toLocaleString() : dash}
              sub={cash ? `${cash.earned.toLocaleString()} earned` : ""}
            />
            <HeroStat
              icon={CheckCircle2} tint="text-emerald-300" label="Quests to do"
              value={assignmentStats ? assignmentStats.pending : dash}
              sub={assignmentStats ? (assignmentStats.overdue ? `${assignmentStats.overdue} overdue` : assignmentStats.pending ? "Keep going!" : "All caught up ✓") : ""}
            />
            <HeroStat
              icon={Award} tint="text-violet-200" label="Rank"
              value={cash ? cash.rank : dash}
              sub={cash ? (cash.next_rank ? `${cash.next_rank_at - cash.balance} CASH to ${cash.next_rank}` : "Highest rank!") : ""}
            />
          </div>
          {lastSync && (
            <p className="mt-3 text-[11px] text-slate-300/70 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live · updated {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </section>

      {/* =========================================================================
          CAMPUS ISLAND & COMPANION MASCOT ROW
      ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Living Campus Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles size={20} className="text-violet-500" />
                Interactive Floating Campus
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any floating sanctuary to teleport directly into your classes, notes, or exams.
              </p>
            </div>
            <Link
              to="/student/me-cash"
              className="text-xs font-semibold text-[#008388] hover:text-[#006b6f] flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-cyan-100 shadow-sm"
            >
              ME-CASH Atelier <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-[36px] p-2 border border-slate-100 shadow-xl overflow-hidden">
            <CampusMap />
          </div>
        </div>

        {/* Companion Guidance & Next Class (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Companion Mascot Speech Bubble Card */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6 border border-cyan-200/60 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-cyan-300 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-base">{companion.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-200/60 text-[#006064]">
                    {companion.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Your Persona Companion</p>
              </div>
            </div>

            <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cyan-100/80 shadow-sm text-xs text-slate-700 leading-relaxed relative">
              <div className="absolute -top-2 left-6 w-4 h-4 bg-white rotate-45 border-l border-t border-cyan-100/80" />
              <p className="relative z-10 italic">
                "{companion.advice}"
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-cyan-200/40 text-xs">
              <span className="text-slate-500">Elemental Affinity: <strong className="capitalize text-slate-700">{companionKey}</strong></span>
              <Link to="/student/me-cash" className="font-semibold text-[#008388] hover:underline">
                Change in Atelier →
              </Link>
            </div>
          </div>

          {/* Next Scheduled / Live Class */}
          <div className="magic-card rounded-[32px] bg-white p-6 border border-slate-100 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Video size={16} className="text-[#008388]" />
                Live Learning Arena
              </h3>
              {(nextLive?.status || "").toLowerCase() === "live now" && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  Live Now
                </span>
              )}
            </div>

            {nextLive ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100">
                  <p className="text-xs font-semibold text-[#008388] uppercase tracking-wider">
                    {nextLive.subject || "General Session"}
                  </p>
                  <h4 className="font-bold text-slate-800 text-base mt-1">{nextLive.title}</h4>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {liveWhen(nextLive)}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap size={13} /> {nextLive.teacherName || "Faculty"}
                    </span>
                  </div>
                </div>

                {nextLive.meetingLink ? (
                  <a
                    href={nextLive.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition active:scale-95"
                  >
                    Enter Live Class <ExternalLink size={14} />
                  </a>
                ) : (
                  <Link
                    to="/student/live-classes"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                  >
                    View Class Schedule
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <Calendar size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">No live sessions broadcasting at the moment.</p>
                <Link to="/student/live-classes" className="text-xs text-[#008388] font-semibold mt-2 inline-block">
                  View Timetable →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          ACTIVE QUESTS & RECENT SANCTUARY RESOURCES
      ========================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quest 1: Pending Assignments */}
        <div className="magic-card pop-in rounded-[32px] bg-white p-6 border border-slate-100 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Assignment Quests</h3>
                  <p className="text-[11px] text-slate-500">{assignmentStats ? `${assignmentStats.pending} pending submission${assignmentStats.pending === 1 ? "" : "s"}` : "Loading…"}</p>
                </div>
              </div>
              <Link to="/student/assignments" className="text-xs font-semibold text-[#008388] hover:underline">
                All →
              </Link>
            </div>

            {pendingAssignments.length > 0 ? (
              <div className="space-y-2.5">
                {pendingAssignments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigate("/student/assignments")}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {a.subject || "Assignment"}
                      </span>
                      <span className={`text-[11px] flex items-center gap-1 ${a.overdue ? "text-rose-500 font-semibold" : "text-slate-400"}`}>
                        <Clock size={11} /> {dueLabel(a)}
                      </span>
                    </div>
                    <p className="font-semibold text-xs text-slate-800 mt-1.5 line-clamp-1">{a.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-500" />
                All assignment quests are up to date!
              </div>
            )}
          </div>

          <Link
            to="/student/assignments"
            className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs text-center hover:bg-slate-50 transition"
          >
            Open Assignment Studio
          </Link>
        </div>

        {/* Quest 2: Upcoming Exams */}
        <div className="magic-card pop-in rounded-[32px] bg-white p-6 border border-slate-100 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileCheck2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Exam Trials</h3>
                  <p className="text-[11px] text-slate-500">{upcomingExams.length} upcoming test{upcomingExams.length === 1 ? "" : "s"}</p>
                </div>
              </div>
              <Link to="/student/exams" className="text-xs font-semibold text-[#008388] hover:underline">
                All →
              </Link>
            </div>

            {upcomingExams.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingExams.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => navigate("/student/exams")}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {e.subject || "Exam"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{dueLabel(e)}</span>
                    </div>
                    <p className="font-semibold text-xs text-slate-800 mt-1.5 line-clamp-1">{e.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                <Award size={24} className="mx-auto mb-1 text-purple-400" />
                No pending examination trials today.
              </div>
            )}
          </div>

          <Link
            to="/student/exams"
            className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs text-center hover:bg-slate-50 transition"
          >
            Open Exam Arena
          </Link>
        </div>

        {/* Quest 3: Study Notes & Library */}
        <div className="magic-card pop-in rounded-[32px] bg-white p-6 border border-slate-100 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Knowledge Archives</h3>
                  <p className="text-[11px] text-slate-500">{notes.length} notes available</p>
                </div>
              </div>
              <Link to="/student/notes" className="text-xs font-semibold text-[#008388] hover:underline">
                Browse →
              </Link>
            </div>

            <div className="space-y-2.5">
              {notes.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  onClick={() => navigate("/student/notes")}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {n.subject || "General"}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{n.type || "pdf"}</span>
                  </div>
                  <p className="font-semibold text-xs text-slate-800 mt-1.5 line-clamp-1">{n.title}</p>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-xs">No notes uploaded yet.</p>
              )}
            </div>
          </div>

          <Link
            to="/student/notes"
            className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs text-center hover:bg-slate-50 transition"
          >
            Access Study Library
          </Link>
        </div>
      </div>

      {/* =========================================================================
          CAMPUS SANCTUARY QUICK TELEPORT TILES
      ========================================================================== */}
      <section className="bg-white/70 backdrop-blur-xl rounded-[36px] p-8 border border-white/80 shadow-lg">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-[#008388]" />
          Direct Campus Sanctuaries
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <Link
            to="/student/notes"
            className="group magic-card p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 hover:from-blue-100 hover:to-indigo-100 border border-blue-100/80 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition">
              <BookOpen size={22} />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-3">Study Notes</span>
            <span className="text-[10px] text-slate-500">PDFs & Docs</span>
          </Link>

          <Link
            to="/student/assignments"
            className="group magic-card p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-100/80 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition">
              <ClipboardList size={22} />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-3">Assignments</span>
            <span className="text-[10px] text-slate-500">Submit Quests</span>
          </Link>

          <Link
            to="/student/exams"
            className="group magic-card p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 hover:from-purple-100 hover:to-pink-100 border border-purple-100/80 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-600 group-hover:scale-110 transition">
              <FileCheck2 size={22} />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-3">Exams</span>
            <span className="text-[10px] text-slate-500">Mock Tests</span>
          </Link>

          <Link
            to="/student/live-classes"
            className="group magic-card p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50/50 hover:from-rose-100 hover:to-orange-100 border border-rose-100/80 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-600 group-hover:scale-110 transition">
              <Video size={22} />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-3">Live Classes</span>
            <span className="text-[10px] text-slate-500">Interactive Arena</span>
          </Link>

          <Link
            to="/student/friends"
            className="group magic-card p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50/50 hover:from-cyan-100 hover:to-teal-100 border border-cyan-100/80 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-cyan-600 group-hover:scale-110 transition">
              <Users size={22} />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-3">Friends</span>
            <span className="text-[10px] text-slate-500">Study Commons</span>
          </Link>

          <Link
            to="/student/ai-studio"
            className="group magic-card p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50/50 hover:from-amber-100 hover:to-yellow-100 border border-amber-100/80 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600 group-hover:scale-110 transition">
              <Bot size={22} />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-3">AI Tutor</span>
            <span className="text-[10px] text-slate-500">Curriculum Lab</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
