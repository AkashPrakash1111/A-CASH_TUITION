import { useEffect, useState } from "react";
import { X, Award, Clock, FileText, RotateCcw, AlertTriangle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { assignmentsApi } from "../../services/api";
import AttachmentList from "./AttachmentList";

const STATUS_LABEL = {
  Submitted: { text: "Turned in", cls: "bg-amber-100 text-amber-800" },
  Late: { text: "Turned in late", cls: "bg-red-100 text-red-700" },
  Reviewed: { text: "Graded", cls: "bg-purple-100 text-purple-800" },
  Returned: { text: "Sent back for redo", cls: "bg-blue-100 text-blue-800" },
};

// Mounted only while open (the page renders it conditionally).
export default function SubmissionsDrawer({ assignment, onClose, onGraded }) {
  const { token } = useAuth();
  const maxMarks = assignment.maxMarks || 100;

  const [load, setLoad] = useState({ status: "loading", submissions: [], error: "" });
  const [drafts, setDrafts] = useState({}); // { [submissionId]: { marks, feedback } }
  const [savingId, setSavingId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!assignment?.id || !token) return undefined;
    let cancelled = false;

    assignmentsApi
      .listSubmissions(token, assignment.id)
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setLoad({ status: "ready", submissions: list, error: "" });
        setDrafts(
          Object.fromEntries(
            list.map((s) => [s.id, { marks: s.marksObtained ?? "", feedback: s.feedback || "" }])
          )
        );
      })
      .catch((err) => {
        if (!cancelled) setLoad({ status: "error", submissions: [], error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [assignment?.id, token]);

  const setDraft = (id, patch) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const save = async (submission, status) => {
    const draft = drafts[submission.id] || { marks: "", feedback: "" };
    setErrors((prev) => ({ ...prev, [submission.id]: "" }));

    if (status === "Reviewed" && String(draft.marks).trim() === "") {
      setErrors((prev) => ({ ...prev, [submission.id]: "Enter the marks first." }));
      return;
    }

    setSavingId(submission.id);
    try {
      const updated = await assignmentsApi.grade(token, submission.id, {
        marksObtained: String(draft.marks).trim(),
        feedback: draft.feedback,
        status,
      });
      setLoad((prev) => ({
        ...prev,
        submissions: prev.submissions.map((s) => (s.id === updated.id ? updated : s)),
      }));
      if (onGraded) onGraded();
    } catch (err) {
      setErrors((prev) => ({ ...prev, [submission.id]: err.message }));
    } finally {
      setSavingId(null);
    }
  };

  const { submissions } = load;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      <div className="w-full max-w-xl h-[92vh] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Grading Hub
            </span>
            <h3 className="font-extrabold text-slate-800 text-lg mt-1 truncate">{assignment.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review each student's answer, award marks (out of {maxMarks}) and leave feedback.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
          {load.status === "loading" && (
            <div className="py-20 text-center text-slate-400 text-xs">Loading student submissions...</div>
          )}

          {load.status === "error" && (
            <div className="py-16 text-center text-sm text-rose-600" role="alert">
              <AlertTriangle size={28} className="mx-auto mb-2" />
              {load.error}
            </div>
          )}

          {load.status === "ready" && submissions.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <FileText size={36} className="mx-auto mb-2 opacity-50 text-slate-300" />
              <p className="font-semibold text-sm">No submissions received yet.</p>
              <p className="text-xs mt-1">
                Students in {assignment.className}
                {assignment.batch ? ` · Batch ${assignment.batch}` : ""} will appear here once they turn in work.
              </p>
            </div>
          )}

          {submissions.map((sub) => {
            const draft = drafts[sub.id] || { marks: "", feedback: "" };
            const badge = STATUS_LABEL[sub.status] || STATUS_LABEL.Submitted;
            const busy = savingId === sub.id;

            return (
              <div key={sub.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{sub.student_name || "Student"}</h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      {sub.submitted_at ? new Date(sub.submitted_at + (sub.submitted_at.endsWith("Z") ? "" : "Z")).toLocaleString() : "Recently"}
                      {sub.batch ? ` · Batch ${sub.batch}` : ""}
                    </span>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>
                    {sub.status === "Reviewed" ? `Graded (${sub.marksObtained}/${maxMarks})` : badge.text}
                  </span>
                </div>

                {sub.textContent && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <p className="font-semibold text-[11px] text-slate-500 mb-1">Written answer</p>
                    <p className="whitespace-pre-wrap">{sub.textContent}</p>
                  </div>
                )}

                {sub.attachments?.length > 0 && (
                  <div>
                    <p className="font-semibold text-[11px] text-slate-500 mb-2">Attached work</p>
                    <AttachmentList attachments={sub.attachments} compact />
                  </div>
                )}

                {!sub.textContent && !(sub.attachments?.length > 0) && (
                  <p className="text-xs text-slate-400">This submission is empty.</p>
                )}

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-28 shrink-0">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1" htmlFor={`marks-${sub.id}`}>
                        Marks (/{maxMarks})
                      </label>
                      <input
                        id={`marks-${sub.id}`}
                        type="number"
                        min="0"
                        max={maxMarks}
                        step="0.5"
                        value={draft.marks}
                        onChange={(e) => setDraft(sub.id, { marks: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1" htmlFor={`fb-${sub.id}`}>
                        Feedback
                      </label>
                      <input
                        id={`fb-${sub.id}`}
                        type="text"
                        value={draft.feedback}
                        onChange={(e) => setDraft(sub.id, { feedback: e.target.value })}
                        placeholder="e.g. Good steps. Recheck question 3."
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {errors[sub.id] && (
                    <p role="alert" className="text-xs text-red-600">{errors[sub.id]}</p>
                  )}

                  <div className="flex justify-end gap-2">
                    {sub.status !== "Returned" && (
                      <button
                        type="button"
                        onClick={() => save(sub, "Returned")}
                        disabled={busy}
                        title="Let the student fix and turn it in again"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition disabled:opacity-50"
                      >
                        <RotateCcw size={13} /> Ask to redo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => save(sub, "Reviewed")}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-sm hover:shadow transition disabled:opacity-50"
                    >
                      <Award size={13} />
                      {busy ? "Saving..." : sub.status === "Reviewed" ? "Update grade" : "Award marks"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
