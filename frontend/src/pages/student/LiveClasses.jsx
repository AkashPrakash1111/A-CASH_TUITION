import { useEffect, useMemo, useState } from "react";
import {
  Video,
  Clock,
  Calendar,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Users,
  Search,
  Tv,
  RefreshCw,
  AlertTriangle,
  History,
} from "lucide-react";
import useLiveClasses from "../../hooks/useLiveClasses";
import {
  audienceLabel,
  compareClasses,
  formatDate,
  formatTime,
  isJoinable,
  isToday,
  liveStatus,
  shortLink,
  startsIn,
} from "../../utils/liveClassUtils";

function JoinButton({ cls, now, large = false }) {
  const status = liveStatus(cls, now);
  if (!cls.meetingLink) {
    return (
      <div className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-400 text-center font-semibold text-xs">
        Link pending from faculty
      </div>
    );
  }
  const ready = status === "Live Now" || isJoinable(cls, now);
  const size = large ? "px-8 py-4 text-sm" : "w-full py-3 text-xs";
  const tone = ready
    ? large
      ? "bg-white text-rose-600 hover:bg-rose-50 font-extrabold shadow-2xl"
      : "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md hover:shadow-lg font-semibold"
    : "bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold";
  return (
    <a
      href={cls.meetingLink}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl transition active:scale-95 ${size} ${tone}`}
    >
      <Video size={large ? 18 : 14} />
      {status === "Live Now" ? "Join Live Classroom Now" : ready ? "Join Now (opens soon)" : "Open Meeting Link"}
      <ExternalLink size={12} />
    </a>
  );
}

function ClassCard({ cls, now, ended = false }) {
  const status = liveStatus(cls, now);
  const countdown = status === "Upcoming" ? startsIn(cls, now) : "";
  return (
    <div className={`bg-white rounded-[32px] p-6 border shadow-sm transition-all duration-300 flex flex-col justify-between ${
      ended ? "border-slate-100 opacity-80" : "border-slate-100 hover:shadow-xl hover:-translate-y-1"
    }`}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 uppercase tracking-wider truncate">
            {cls.subject || "General"}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
            {cls.platform || "Online"}
          </span>
        </div>

        <h3 className="font-bold text-slate-800 text-base mt-4 line-clamp-2">{cls.title}</h3>
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
          {cls.description || "Interactive classroom lecture with real-time doubt clearing."}
        </p>

        <div className="mt-5 space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <GraduationCap size={14} className="text-slate-400" />
            <span>Faculty: <strong>{cls.teacherName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span>{audienceLabel(cls)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span>
              {cls.scheduledDate && cls.startTime
                ? `${formatDate(cls.scheduledDate)} at ${formatTime(cls.startTime)}`
                : "Date & time to be announced"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400" />
            <span>
              {cls.duration} mins
              {countdown && <strong className="text-rose-600"> · starts {countdown}</strong>}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
        <JoinButton cls={cls} now={now} />
        {cls.meetingLink && (
          <p className="text-[10px] text-slate-400 text-center truncate">{shortLink(cls.meetingLink)}</p>
        )}
      </div>
    </div>
  );
}

export default function StudentLiveClasses() {
  const { liveClasses, loading, error, lastUpdated, refreshLiveClasses } = useLiveClasses();
  const [search, setSearch] = useState("");

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const { liveNow, today, later, past } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matching = liveClasses
      .filter((c) => !q || `${c.title} ${c.subject} ${c.teacherName}`.toLowerCase().includes(q))
      .sort((a, b) => compareClasses(a, b, now));
    const upcoming = matching.filter((c) => liveStatus(c, now) === "Upcoming");
    return {
      liveNow: matching.filter((c) => liveStatus(c, now) === "Live Now"),
      today: upcoming.filter((c) => isToday(c, now)),
      later: upcoming.filter((c) => !isToday(c, now)),
      past: matching.filter((c) => liveStatus(c, now) === "Ended").slice(0, 9),
    };
  }, [liveClasses, search, now]);

  const nothing = !liveNow.length && !today.length && !later.length && !past.length;

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2">
            <Sparkles size={14} /> Live Learning Arena
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Virtual Classrooms & Lectures</h1>
          <p className="text-slate-500 text-sm mt-1">
            Live sessions for your class and batch. This page updates by itself when your teacher changes a link or time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search live sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition w-64"
            />
          </div>
          <button
            onClick={refreshLiveClasses}
            title={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Refresh"}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="flex-1">{error} Showing the last loaded list.</span>
          <button onClick={refreshLiveClasses} className="font-semibold underline">Retry</button>
        </div>
      )}

      {liveNow.map((cls) => (
        <div key={cls.id} className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                Live Broadcast in Progress
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">{cls.title}</h2>
              <p className="text-rose-100 text-xs sm:text-sm">
                Subject: <strong>{cls.subject || "General"}</strong> • Faculty: <strong>{cls.teacherName}</strong> • {audienceLabel(cls)}
              </p>
            </div>
            <div className="text-center">
              {cls.meetingLink ? (
                <>
                  <JoinButton cls={cls} now={now} large />
                  <p className="mt-2 text-[11px] text-rose-100 truncate max-w-[18rem]">{shortLink(cls.meetingLink)}</p>
                </>
              ) : (
                <span className="text-xs bg-white/20 px-4 py-2 rounded-xl">Meeting link will be shared by faculty</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {today.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-rose-600" /> Today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {today.map((cls) => <ClassCard key={cls.id} cls={cls} now={now} />)}
          </div>
        </section>
      )}

      {later.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-[#008388]" /> Upcoming Scheduled Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {later.map((cls) => <ClassCard key={cls.id} cls={cls} now={now} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-500 flex items-center gap-2">
            <History size={18} /> Recently Ended
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.map((cls) => <ClassCard key={cls.id} cls={cls} now={now} ended />)}
          </div>
        </section>
      )}

      {nothing && !loading && (
        <div className="py-16 text-center text-slate-400">
          <Tv size={36} className="mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-sm">No live classes for your batch yet.</p>
          <p className="text-xs mt-1">New sessions appear here as soon as your teacher schedules them.</p>
        </div>
      )}

      {lastUpdated && (
        <p className="text-center text-[11px] text-slate-400">Last updated {lastUpdated.toLocaleTimeString()}</p>
      )}
    </div>
  );
}
