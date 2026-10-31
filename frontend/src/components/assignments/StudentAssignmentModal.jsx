import { useState } from "react";
import { X, Clock, Award, MessageSquare, CheckCircle2, RotateCcw, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { assignmentsApi } from "../../services/api";
import AttachmentList from "./AttachmentList";
import AttachmentPicker from "./AttachmentPicker";
import { dueLabel, formatDue, isPastDue, submissionState } from "./assignmentHelpers";

let counter = 0;
const withIds = (list = []) =>
  list.map((a) => ({ id: `kept-${counter++}`, name: a.name, type: a.type, url: a.url }));

// Mounted only while open, so the form always starts from the saved submission.
export default function StudentAssignmentModal({ assignment, onClose, onSubmitted }) {
  const { token } = useAuth();

  const state = submissionState(assignment);
  const graded = state === "graded";
  const maxMarks = assignment.maxMarks || assignment.max_marks || 100;
  const closed = (assignment.status || "").toLowerCase() === "closed";
  const pastDue = isPastDue(assignment.dueDate);

  const [text, setText] = useState(assignment.submission_text || "");
  const [attachments, setAttachments] = useState(() => withIds(assignment.submission_attachments));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const canEdit = !graded && !closed;
  const hasAnswer = text.trim().length > 0 || attachments.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit || saving) return;

    if (!hasAnswer) {
      setError("Add your answer first: write something, or attach a photo, PDF or voice recording.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await assignmentsApi.submit(token, assignment.id, {
        textContent: text.trim(),
        attachments: attachments.map(({ name, type, url }) => ({ name, type, url })),
      });
      setDone(true);
      onSubmitted();
    } catch (err) {
      setError(err.message || "Could not turn in your work.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-6">
      <div className="w-full max-w-2xl max-h-[94vh] overflow-y-auto bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {assignment.subject || "Assignment"}
              </span>
              <span
                className={`flex items-center gap-1 text-[11px] font-semibold ${
                  pastDue && !assignment.is_submitted ? "text-red-600" : "text-slate-500"
                }`}
              >
                <Clock size={12} /> {formatDue(assignment.dueDate)} · {dueLabel(assignment.dueDate)}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">{maxMarks} marks</span>
            </div>
            <h3 className="font-extrabold text-slate-800 text-xl mt-2">{assignment.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* What the teacher set */}
        <section className="mt-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Instructions</h4>
            <p className="mt-1.5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {assignment.description || "Your teacher didn't add written instructions."}
            </p>
          </div>

          {assignment.attachments?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                From your teacher
              </h4>
              <AttachmentList attachments={assignment.attachments} />
            </div>
          )}
        </section>

        <hr className="my-6 border-slate-100" />

        {/* Teacher's response */}
        {(state === "returned" || graded) && (
          <div
            className={`mb-5 rounded-2xl p-4 text-sm ${
              graded ? "bg-purple-50 border border-purple-100 text-purple-900" : "bg-blue-50 border border-blue-100 text-blue-900"
            }`}
          >
            <p className="flex items-center gap-1.5 font-bold">
              {graded ? <Award size={16} /> : <RotateCcw size={16} />}
              {graded
                ? `Graded: ${assignment.marks_obtained ?? "-"} / ${maxMarks}`
                : "Your teacher asked you to redo this"}
            </p>
            {assignment.feedback && (
              <p className="mt-2 flex gap-1.5 italic">
                <MessageSquare size={14} className="mt-0.5 shrink-0" /> {assignment.feedback}
              </p>
            )}
          </div>
        )}

        {/* Your answer */}
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Your answer</h4>

          {!canEdit ? (
            <div className="space-y-4">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lock size={12} /> {graded ? "This has been graded, so it can't be changed." : "This assignment is closed."}
              </p>
              {assignment.submission_text && (
                <p className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                  {assignment.submission_text}
                </p>
              )}
              <AttachmentList attachments={assignment.submission_attachments || []} />
              {!assignment.is_submitted && <p className="text-sm text-slate-400">You didn't turn anything in.</p>}
            </div>
          ) : done ? (
            <div className="rounded-2xl bg-emerald-50 p-5 text-center text-sm font-semibold text-emerald-700" role="status">
              <CheckCircle2 className="mx-auto mb-1" size={24} />
              Turned in! Your teacher can see it now.
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {assignment.is_submitted && state !== "returned" && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                  {state === "late" ? "Turned in late." : "Turned in."} You can still change it until your teacher grades it.
                </p>
              )}
              {!assignment.is_submitted && pastDue && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  The due date has passed. You can still turn it in, but it will be marked late.
                </p>
              )}

              <textarea
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your answer, working or explanation here..."
                aria-label="Written answer"
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition"
              />

              <AttachmentPicker value={attachments} onChange={setAttachments} disabled={saving} />

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow transition disabled:opacity-50"
                >
                  {saving ? "Turning in..." : assignment.is_submitted ? "Update submission" : "Turn in"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
