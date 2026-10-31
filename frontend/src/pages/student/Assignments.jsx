import { useMemo, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
  Search,
  RotateCcw,
  Paperclip,
  AlertTriangle,
} from "lucide-react";
import useStudentAssignments from "../../hooks/useStudentAssignments";
import StudentAssignmentModal from "../../components/assignments/StudentAssignmentModal";
import {
  dueLabel,
  isPastDue,
  submissionState,
  summarizeAttachments,
} from "../../components/assignments/assignmentHelpers";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "todo", label: "To do" },
  { id: "done", label: "Turned in" },
  { id: "graded", label: "Graded" },
];

function StatusChip({ assignment }) {
  const state = submissionState(assignment);
  const maxMarks = assignment.maxMarks || assignment.max_marks || 100;

  if (state === "graded") {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
        <Award size={12} /> {assignment.marks_obtained ?? "-"} / {maxMarks}
      </span>
    );
  }
  if (state === "returned") {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
        <RotateCcw size={12} /> Redo requested
      </span>
    );
  }
  if (state === "submitted" || state === "late") {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
        <CheckCircle2 size={12} /> {state === "late" ? "Turned in late" : "Turned in"}
      </span>
    );
  }
  const overdue = isPastDue(assignment.dueDate);
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
        overdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
      }`}
    >
      {overdue ? <AlertTriangle size={12} /> : <Clock size={12} />} {dueLabel(assignment.dueDate)}
    </span>
  );
}

export default function StudentAssignments() {
  const { assignments, loading, error, reload } = useStudentAssignments();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  // Always read the open assignment from the latest list, so the modal reflects
  // a fresh submission after the list reloads.
  const opened = assignments.find((a) => a.id === openId) || null;

  const counts = useMemo(() => {
    const by = { all: assignments.length, todo: 0, done: 0, graded: 0 };
    assignments.forEach((a) => {
      const s = submissionState(a);
      if (s === "todo" || s === "returned") by.todo += 1;
      else if (s === "graded") by.graded += 1;
      else by.done += 1;
    });
    return by;
  }, [assignments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter((a) => {
      const s = submissionState(a);
      const matchesFilter =
        filter === "all" ||
        (filter === "todo" && (s === "todo" || s === "returned")) ||
        (filter === "done" && (s === "submitted" || s === "late")) ||
        (filter === "graded" && s === "graded");

      const matchesSearch =
        !q ||
        (a.title || "").toLowerCase().includes(q) ||
        (a.subject || "").toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [assignments, filter, search]);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <Sparkles size={14} /> Assignment Studio
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Homework</h1>
          <p className="text-slate-500 text-sm mt-1">
            Open an assignment to see your teacher's instructions and files, then turn in your answer as text,
            photos, a PDF or a voice recording.
          </p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search homework..."
            aria-label="Search homework"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-cyan-500 focus:bg-white transition w-full md:w-64"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter homework">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === f.id
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={reload} className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold">
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((a) => {
          const state = submissionState(a);
          const files = summarizeAttachments(a.attachments);

          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setOpenId(a.id)}
              className="text-left bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider truncate">
                    {a.subject || "General"}
                  </span>
                  <StatusChip assignment={a} />
                </div>

                <h3 className="font-bold text-slate-800 text-base mt-4 line-clamp-2">{a.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-3">
                  {a.description || "Open to see the details."}
                </p>

                {files && (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <Paperclip size={12} /> {files}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="block w-full py-2.5 rounded-xl text-center font-semibold text-xs bg-gradient-to-r from-[#008388] to-blue-600 text-white shadow-sm">
                  {state === "todo"
                    ? "Open & turn in"
                    : state === "returned"
                    ? "Open & redo"
                    : state === "graded"
                    ? "View result"
                    : "View / update my answer"}
                </span>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && !loading && !error && (
          <div className="col-span-full py-16 text-center text-slate-400">
            <ClipboardList size={36} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-sm">
              {assignments.length === 0 ? "No homework has been set for you yet." : "Nothing matches your filters."}
            </p>
          </div>
        )}
      </div>

      {opened && (
        <StudentAssignmentModal
          key={opened.id}
          assignment={opened}
          onClose={() => setOpenId(null)}
          onSubmitted={reload}
        />
      )}
    </div>
  );
}
