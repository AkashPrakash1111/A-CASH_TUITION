import { useCallback, useEffect, useMemo, useState } from "react";
import { X, Clock, FileText, AlertTriangle, PenLine, CheckCircle2, Check, XCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { examsApi, filesApi } from "../../services/api";
import PaperCorrectionStudio from "../grading/PaperCorrectionStudio";

const STATUS = {
  Submitted: { text: "Waiting for marking", cls: "bg-amber-100 text-amber-800" },
  "Draft Graded": { text: "Draft saved (not sent)", cls: "bg-blue-100 text-blue-800" },
  Graded: { text: "Sent back to student", cls: "bg-emerald-100 text-emerald-800" },
};

const norm = (v) => String(v ?? "").trim().toLowerCase();

function parseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

// The answer key is stored inconsistently ("B", "Tesla (T)", "B) Cell").
// Returns true / false, or null when there is nothing to compare.
function isMcqCorrect(question, answer, options) {
  const key = String(question.correctAnswer || "").trim();
  if (!key || !answer) return null;
  const idx = options.findIndex((o) => norm(o) === norm(answer));
  const letter = idx >= 0 ? String.fromCharCode(65 + idx) : "";
  if (key.length === 1 && letter) return key.toUpperCase() === letter;
  return norm(key) === norm(answer);
}

function sheetLabel(url) {
  return /\.pdf(\?|$)/i.test(url) ? "PDF answer sheet" : "Photo of answer sheet";
}

// Mounted only while open (the Exams page renders it conditionally).
export default function ExamSubmissionsDrawer({ exam, onClose }) {
  const { token } = useAuth();
  const [load, setLoad] = useState({ status: "loading", submissions: [], error: "" });
  const [marking, setMarking] = useState(null); // the submission open in the studio

  const questions = useMemo(
    () => (Array.isArray(exam.questions) ? exam.questions : []),
    [exam.questions]
  );

  const reload = useCallback(async () => {
    try {
      const data = await examsApi.listSubmissions(token, exam.id);
      setLoad({ status: "ready", submissions: Array.isArray(data) ? data : [], error: "" });
    } catch (err) {
      setLoad({ status: "error", submissions: [], error: err.message });
    }
  }, [token, exam.id]);

  useEffect(() => {
    if (token) reload();
  }, [token, reload]);

  const { submissions } = load;
  const waiting = submissions.filter((s) => s.status !== "Graded").length;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-4 sm:p-6">
        <div className="w-full max-w-2xl h-[92vh] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Exam Submissions
              </span>
              <h3 className="font-extrabold text-slate-800 text-lg mt-1 truncate">{exam.examName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {submissions.length} received · {waiting} waiting for you · marks out of {exam.maxMarks}
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

          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F8FAFC]">
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
                <FileText size={36} className="mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-sm">No submissions yet.</p>
                <p className="text-xs mt-1">Students' answers appear here as soon as they finish the exam.</p>
              </div>
            )}

            {submissions.map((sub) => {
              const badge = STATUS[sub.status] || STATUS.Submitted;
              const answers = parseJson(sub.answersJson, {});
              const hasAnswers = answers && Object.keys(answers).length > 0;
              const when = sub.submitted_at
                ? new Date(sub.submitted_at + (sub.submitted_at.endsWith("Z") ? "" : "Z")).toLocaleString()
                : "Recently";

              return (
                <div key={sub.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{sub.student_name}</h4>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {when}
                      </span>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>
                      {sub.status === "Graded" ? `${badge.text} (${sub.marksObtained}/${exam.maxMarks})` : badge.text}
                    </span>
                  </div>

                  {hasAnswers && (
                    <div className="space-y-2">
                      <p className="font-semibold text-[11px] text-slate-500">Typed answers</p>
                      {questions.length > 0
                        ? questions.map((q, idx) => {
                            const answer = answers[q.id] ?? answers[String(q.id)] ?? answers[idx];
                            const options = parseJson(q.optionsJson, []).filter(Boolean);
                            const verdict = q.questionType === "mcq" ? isMcqCorrect(q, answer, options) : null;
                            return (
                              <div key={q.id ?? idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                                <p className="font-semibold text-slate-700">
                                  Q{idx + 1}. {q.questionText}
                                  <span className="text-slate-400 font-normal"> ({q.marks} marks)</span>
                                </p>
                                <p className="mt-1 text-slate-600 whitespace-pre-wrap flex items-start gap-1.5">
                                  {verdict === true && <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />}
                                  {verdict === false && <XCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />}
                                  <span>{answer ? String(answer) : <em className="text-slate-400">Not answered</em>}</span>
                                </p>
                                {verdict === false && q.correctAnswer && (
                                  <p className="mt-1 text-[11px] text-emerald-700">Key: {q.correctAnswer}</p>
                                )}
                              </div>
                            );
                          })
                        : Object.entries(answers).map(([k, v]) => (
                            <div key={k} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                              <span className="font-semibold text-slate-700">{k}: </span>
                              {String(v)}
                            </div>
                          ))}
                    </div>
                  )}

                  {sub.textContent && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      <p className="font-semibold text-[11px] text-slate-500 mb-1">Written answer</p>
                      <p className="whitespace-pre-wrap">{sub.textContent}</p>
                    </div>
                  )}

                  {sub.answerSheetUrl && (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                      <span className="text-xs font-semibold text-purple-800 flex items-center gap-2 min-w-0">
                        <FileText size={16} className="shrink-0" />
                        <span className="truncate">{sheetLabel(sub.answerSheetUrl)}</span>
                      </span>
                      <a
                        href={filesApi.resolveFileUrl(sub.answerSheetUrl, token)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-purple-700 hover:underline shrink-0"
                      >
                        Open original
                      </a>
                    </div>
                  )}

                  {!hasAnswers && !sub.textContent && !sub.answerSheetUrl && (
                    <p className="text-xs text-slate-400">This submission is empty.</p>
                  )}

                  {sub.status === "Graded" && sub.feedback && (
                    <p className="text-[11px] text-slate-500 italic">Your feedback: "{sub.feedback}"</p>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMarking(sub)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition active:scale-95"
                    >
                      {sub.status === "Graded" ? <CheckCircle2 size={14} /> : <PenLine size={14} />}
                      {sub.status === "Graded" ? "Review / edit marking" : "Mark paper"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {marking && (
        <PaperCorrectionStudio
          isOpen
          isExam
          submission={marking}
          examOrAssignment={exam}
          onClose={() => setMarking(null)}
          onSaveSuccess={reload}
        />
      )}
    </>
  );
}
