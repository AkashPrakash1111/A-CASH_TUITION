import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardCheck, FileText, NotebookPen, PenTool, Clock, Download, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { inboxApi, filesApi } from "../services/api";
import PaperCorrectionStudio from "../components/grading/PaperCorrectionStudio";

const KINDS = [
  { id: "", label: "Everything" },
  { id: "assignment", label: "Assignments" },
  { id: "exam", label: "Exams" },
  { id: "note", label: "Notes" },
];

const KIND_STYLE = {
  assignment: { icon: FileText, cls: "bg-cyan-50 text-cyan-700", label: "Assignment" },
  exam: { icon: ClipboardCheck, cls: "bg-purple-50 text-purple-700", label: "Exam" },
  note: { icon: NotebookPen, cls: "bg-amber-50 text-amber-700", label: "Note" },
};

const uniq = (list) => [...new Set(list.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));

const when = (iso) => {
  if (!iso) return "";
  const d = new Date(iso.endsWith("Z") || /[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  return d.toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const selectCls =
  "h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#008388]";

export default function Submissions() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  const [kind, setKind] = useState("");
  const [className, setClassName] = useState("");
  const [batch, setBatch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [marking, setMarking] = useState(null);

  const load = useCallback(() => {
    if (!token) return Promise.resolve();
    return inboxApi
      .list(token)
      .then((data) => setState({ loading: false, error: "" }) || setItems(Array.isArray(data) ? data : []))
      .catch((err) => setState({ loading: false, error: err.message }));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  // Selector choices narrow each other: pick a class and only its batches/students remain
  const inClass = useMemo(() => items.filter((i) => !className || i.className === className), [items, className]);
  const classes = useMemo(() => uniq(items.map((i) => i.className)), [items]);
  const batches = useMemo(() => uniq(inClass.map((i) => i.batch)), [inClass]);
  const inBatch = useMemo(() => inClass.filter((i) => !batch || i.batch === batch), [inClass, batch]);
  const students = useMemo(() => {
    const map = new Map();
    inBatch.forEach((i) => i.studentId && map.set(i.studentId, i.studentName));
    return [...map].sort((a, b) => String(a[1]).localeCompare(String(b[1])));
  }, [inBatch]);
  const subjects = useMemo(() => uniq(items.map((i) => i.subject)), [items]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (kind && i.kind !== kind) return false;
      if (className && i.className !== className) return false;
      if (batch && i.batch !== batch) return false;
      if (studentId && String(i.studentId) !== studentId) return false;
      if (subject && i.subject !== subject) return false;
      if (status === "pending" && i.reviewed) return false;
      if (status === "reviewed" && !i.reviewed) return false;
      if (q && !`${i.studentName} ${i.title} ${i.subject || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, kind, className, batch, studentId, subject, status, search]);

  const groups = useMemo(() => {
    if (!groupBy) return [{ key: "", rows: shown }];
    const map = new Map();
    shown.forEach((i) => {
      const k = groupBy === "student" ? i.studentName : groupBy === "batch" ? (i.batch ? `Batch ${i.batch}` : "No batch") : i.title;
      map.set(k, [...(map.get(k) || []), i]);
    });
    return [...map].map(([key, rows]) => ({ key, rows }));
  }, [shown, groupBy]);

  const pending = items.filter((i) => !i.reviewed).length;

  const reset = () => {
    setKind(""); setClassName(""); setBatch(""); setStudentId(""); setSubject(""); setStatus(""); setSearch("");
  };

  const openStudio = (i) =>
    setMarking({
      kind: i.kind,
      submission: {
        id: i.id,
        student_id: i.studentId,
        student_name: i.studentName,
        studentPhone: i.studentPhone,
        attachments: i.files,
        textContent: i.textContent,
        correctionData: i.correctionData,
        questionMarksJson: i.questionMarksJson,
        feedback: i.feedback,
        correctedPdfUrl: i.correctedPdfUrl,
      },
      paper: { title: i.title, maxMarks: i.maxMarks || "100", questionPaperUrl: i.questionPaperUrl },
    });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Student Submissions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Everything students sent in, in one place. Open any of it, mark on the photos, and send it back.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">{pending} waiting</span>
          <button
            type="button"
            onClick={() => load()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:border-[#008388]"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Submission type">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              role="tab"
              aria-selected={kind === k.id}
              onClick={() => setKind(k.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                kind === k.id ? "bg-slate-800 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
          <select aria-label="Class" className={selectCls} value={className} onChange={(e) => { setClassName(e.target.value); setBatch(""); setStudentId(""); }}>
            <option value="">All classes</option>
            {classes.map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <select aria-label="Batch" className={selectCls} value={batch} onChange={(e) => { setBatch(e.target.value); setStudentId(""); }}>
            <option value="">All batches</option>
            {batches.map((b) => <option key={b} value={b}>Batch {b}</option>)}
          </select>
          <select aria-label="Student" className={selectCls} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">All students</option>
            {students.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <select aria-label="Subject" className={selectCls} value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select aria-label="Status" className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option>
            <option value="pending">Waiting for marking</option>
            <option value="reviewed">Sent back</option>
          </select>
          <select aria-label="Group by" className={selectCls} value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="">No grouping</option>
            <option value="student">Group by student</option>
            <option value="batch">Group by batch</option>
            <option value="title">Group by assignment / exam</option>
          </select>
          <div className="relative col-span-2 md:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              aria-label="Search submissions"
              className={`${selectCls} w-full pl-9`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Showing {shown.length} of {items.length}</span>
          <button type="button" onClick={reset} className="font-semibold text-[#008388] hover:underline">Clear filters</button>
        </div>
      </div>

      {state.loading && <p className="py-16 text-center text-xs text-slate-400">Loading submissions...</p>}
      {state.error && <p role="alert" className="py-10 text-center text-sm text-rose-600">{state.error}</p>}

      {!state.loading && !state.error && shown.length === 0 && (
        <div className="py-16 text-center text-slate-400">
          <FileText size={34} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold">Nothing matches these filters.</p>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.key || "all"} className="space-y-3">
          {g.key && (
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
              {g.key} <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{g.rows.length}</span>
            </h2>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {g.rows.map((i) => {
              const style = KIND_STYLE[i.kind];
              const Icon = style.icon;
              const photos = i.files.filter((f) => f.type === "image").slice(0, 4);
              return (
                <article key={`${i.kind}-${i.id}`} className="flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.cls}`}>
                        <Icon size={12} /> {style.label}
                      </span>
                      {i.reviewed ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 size={12} /> Sent back
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">Waiting</span>
                      )}
                    </div>

                    <div>
                      <h3 className="line-clamp-1 text-sm font-bold text-slate-800">{i.title}</h3>
                      <p className="mt-0.5 text-xs font-semibold text-slate-600">{i.studentName}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {[i.className && `Class ${i.className}`, i.batch && `Batch ${i.batch}`, i.subject].filter(Boolean).join(" · ")}
                      </p>
                    </div>

                    {photos.length > 0 && (
                      <div className="grid grid-cols-4 gap-1.5">
                        {photos.map((p, idx) => (
                          <img key={idx} src={filesApi.resolveFileUrl(p.url, token)} alt="" loading="lazy" className="aspect-square rounded-lg border border-slate-200 object-cover" />
                        ))}
                      </div>
                    )}

                    <p className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={11} /> {when(i.submittedAt)}</span>
                      <span>{i.files.length} file{i.files.length === 1 ? "" : "s"}{i.textContent ? " + text" : ""}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openStudio(i)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#008388] to-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-95"
                    >
                      <PenTool size={14} /> {i.reviewed ? "Review again" : "Mark & correct"}
                    </button>
                    {i.correctedPdfUrl && (
                      <a
                        href={filesApi.resolveFileUrl(i.correctedPdfUrl, token)}
                        target="_blank"
                        rel="noreferrer"
                        title="Open corrected PDF"
                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
                      >
                        <Download size={15} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {marking && (
        <PaperCorrectionStudio
          isOpen
          isExam={marking.kind === "exam"}
          kind={marking.kind}
          submission={marking.submission}
          examOrAssignment={marking.paper}
          onClose={() => setMarking(null)}
          onSaveSuccess={load}
        />
      )}
    </div>
  );
}
