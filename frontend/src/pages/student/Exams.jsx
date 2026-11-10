import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Clock,
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  Calendar,
  Layers,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { examsApi } from "../../services/api";
import { normalizeExam, examStatus } from "../../utils/examUtils";
import CorrectedPaperViewer from "../../components/grading/CorrectedPaperViewer";

export default function StudentExams() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all"); // all | upcoming | completed
  const [viewing, setViewing] = useState(null); // { exam, submission } open in the viewer
  const [openError, setOpenError] = useState("");

  const openCorrected = async (exam) => {
    setOpenError("");
    try {
      const submission = await examsApi.getSubmission(token, exam.submission_id);
      setViewing({ exam, submission });
    } catch (err) {
      setOpenError(err.message);
    }
  };

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    async function loadExams(showSpinner) {
      try {
        if (showSpinner) setLoading(true);
        const data = await examsApi.list(token);
        if (!cancelled) setExams(Array.isArray(data) ? data.map(normalizeExam) : []);
      } catch (err) {
        console.error("Failed loading exams", err);
      } finally {
        if (!cancelled && showSpinner) setLoading(false);
      }
    }

    loadExams(true);

    // Pick up the admin's changes without a manual page reload: refetch when
    // the tab becomes visible again and every 30 seconds while it is open.
    const refresh = () => {
      if (document.visibilityState === "visible") loadExams(false);
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    const timer = setInterval(refresh, 30000);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      clearInterval(timer);
    };
  }, [token]);

  const isDone = (e) => e.is_submitted || examStatus(e) === "Completed";

  const filtered = exams.filter((e) => {
    const q = search.toLowerCase();
    const matches =
      e.examName.toLowerCase().includes(q) || (e.subject || "").toLowerCase().includes(q);

    if (tab === "upcoming") return matches && !isDone(e);
    if (tab === "completed") return matches && isDone(e);
    return matches;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
            <Sparkles size={14} /> Examination Arena
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Exam Trials & Mock Tests</h1>
          <p className="text-slate-500 text-sm mt-1">
            Test your mastery under timed conditions and receive detailed performance analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-purple-500 focus:bg-white transition w-64"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            tab === "all" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Exams ({exams.length})
        </button>
        <button
          onClick={() => setTab("upcoming")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            tab === "upcoming" ? "bg-purple-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Scheduled & Active
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            tab === "completed" ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Completed Trials
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((exam) => {
          const liveStatus = examStatus(exam);
          const isCompleted = exam.is_submitted || liveStatus === "Completed";

          return (
            <div
              key={exam.id}
              className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 uppercase tracking-wider">
                    {exam.subject || "General"}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {exam.examType}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mt-4 line-clamp-1">{exam.examName}</h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {exam.description || "Assessment of chapter concepts and problem-solving skills."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {exam.duration_minutes} minutes
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={12} /> {exam.total_marks} Marks
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {exam.examDate || "Date to be announced"}{exam.startTime ? ` · ${exam.startTime}` : ""}
                  </span>
                  <span className="flex items-center gap-1 text-purple-600 font-semibold">
                    Pass: {exam.passing_marks} Marks
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                {exam.is_submitted ? (
                  <>
                    <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-center font-semibold text-xs">
                      {exam.submission_status === "Graded" && exam.submission_marks
                        ? `Graded: ${exam.submission_marks} / ${exam.total_marks}`
                        : "Submitted - awaiting grading"}
                    </div>
                    <button
                      onClick={() => openCorrected(exam)}
                      className="mt-2 w-full py-2.5 rounded-xl bg-purple-50 text-purple-700 font-semibold text-xs hover:bg-purple-100 transition"
                    >
                      {exam.submission_status === "Graded" ? "View corrected paper & feedback" : "View my attempt & question paper"}
                    </button>
                  </>
                ) : isCompleted ? (
                  <div className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-500 text-center font-semibold text-xs">
                    Exam Completed
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/student/exams/${exam.id}/take`)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition active:scale-95"
                  >
                    <Play size={14} /> Enter Exam Arena
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-slate-400">
            <ClipboardCheck size={36} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-sm">No exams found in this view.</p>
          </div>
        )}
      </div>

      {openError && (
        <p role="alert" className="text-center text-xs text-rose-600">
          {openError}
        </p>
      )}

      {viewing && (
        <CorrectedPaperViewer
          isOpen
          onClose={() => setViewing(null)}
          submission={viewing.submission}
          examOrAssignment={{ ...viewing.exam, title: viewing.exam.examName, maxMarks: viewing.exam.maxMarks || viewing.exam.total_marks }}
        />
      )}
    </div>
  );
}
