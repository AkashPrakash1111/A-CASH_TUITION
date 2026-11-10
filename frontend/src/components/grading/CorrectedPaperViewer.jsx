import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Award,
  MessageSquare,
  Download,
  FileText,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { filesApi } from "../../services/api";
import { usePaperSheets, PAPER_WIDTH } from "../../hooks/usePaperPages";
import useFitScale from "../../hooks/useFitScale";
import { drawAnnotationItem } from "../../utils/drawAnnotations";

const RELEASED = ["Graded", "Reviewed", "Returned"];

function parseJson(text, fallback) {
  try {
    return JSON.parse(text || "");
  } catch {
    return fallback;
  }
}

export default function CorrectedPaperViewer({
  isOpen,
  onClose,
  submission,
  examOrAssignment,
}) {
  const { token } = useAuth();
  const canvasRef = useRef(null);
  const paperBoxRef = useRef(null);
  const zoom = useFitScale(paperBoxRef, PAPER_WIDTH, isOpen);

  // All photos / PDFs the student sent (older submissions have a single file)
  const { sheets, audios } = useMemo(() => {
    let list = Array.isArray(submission?.attachments) && submission.attachments.length
      ? submission.attachments
      : parseJson(submission?.attachmentsJson, []);
    if (!Array.isArray(list)) list = [];
    if (list.length === 0) {
      const legacy = submission?.answerSheetUrl || submission?.fileUrl || submission?.file_url;
      if (legacy) list = [{ url: legacy, type: /\.pdf(\?|$)/i.test(legacy) ? "pdf" : "image" }];
    }
    return {
      sheets: list
        .filter((f) => f?.url && (f.type === "image" || f.type === "pdf"))
        .map((f) => ({ url: filesApi.resolveFileUrl(f.url, token), type: f.type })),
      audios: list.filter((f) => f?.url && f.type === "audio"),
    };
  }, [submission, token]);
  const rawFileUrl = sheets.length > 0 ? "yes" : "";
  const released = RELEASED.includes(submission?.status);
  const correctedUrl = released && submission?.correctedPdfUrl ? filesApi.resolveFileUrl(submission.correctedPdfUrl, token) : "";
  const typedAnswers = Object.entries(parseJson(submission?.answersJson, {})).filter(([, v]) => v);
  const paper = usePaperSheets(sheets, isOpen && sheets.length > 0);

  const [questionMarks, setQuestionMarks] = useState({});
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    if (!isOpen || !submission) return;

    if (submission.questionMarksJson) {
      try {
        setQuestionMarks(JSON.parse(submission.questionMarksJson));
      } catch {
        setQuestionMarks({});
      }
    } else {
      setQuestionMarks({});
    }

    if (submission.correctionData) {
      try {
        const parsed = JSON.parse(submission.correctionData);
        if (Array.isArray(parsed)) {
          setAnnotations(parsed);
        }
      } catch {
        setAnnotations([]);
      }
    } else {
      setAnnotations([]);
    }
  }, [isOpen, submission]);

  // Render teacher annotations on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((item) => drawAnnotationItem(ctx, item));
  }, [annotations, paper.totalHeight]);

  if (!isOpen || !submission) return null;

  const marksObtained = submission.marksObtained || submission.marks_obtained || 0;
  const maxMarks = examOrAssignment?.maxMarks || 100;
  const percentage = Math.round((parseFloat(marksObtained) / parseFloat(maxMarks)) * 100) || 0;
  const isPassing = percentage >= 40;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4">
      <div className="w-full max-w-[96vw] h-[95vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {released ? "Evaluated Result & Corrected Paper" : "My Attempt"}
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300">
                  {released ? "Checked" : "Awaiting marking"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {examOrAssignment?.title || examOrAssignment?.examName || "Academic Assessment"} • {released ? "Reviewed by teacher" : "Your answers as you sent them"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {correctedUrl && (
              <a
                href={correctedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition"
              >
                <Download size={14} /> Corrected PDF
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Workspace: Paper with Annotations + Sidebar Evaluation */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Paper View */}
          <div ref={paperBoxRef} className="flex-1 min-h-0 bg-slate-100 p-2 sm:p-4 overflow-auto relative">
            {rawFileUrl ? (
              <div className="mx-auto" style={{ width: PAPER_WIDTH * zoom, height: paper.totalHeight * zoom }}>
              <div
                className="relative bg-white shadow-2xl rounded-2xl overflow-hidden"
                style={{ width: `${PAPER_WIDTH}px`, height: `${paper.totalHeight}px`, transform: `scale(${zoom})`, transformOrigin: "top left" }}
              >
                {paper.pages.map((pg, i) => (
                  <img
                    key={i}
                    src={pg.src}
                    alt={`Corrected answer sheet page ${i + 1}`}
                    draggable={false}
                    style={{ width: `${PAPER_WIDTH}px`, height: `${pg.height}px`, display: "block" }}
                    className="pointer-events-none"
                  />
                ))}
                {paper.status === "loading" && (
                  <p className="absolute inset-0 flex items-start justify-center pt-24 text-sm font-semibold text-slate-500">
                    Opening your corrected paper...
                  </p>
                )}
                {paper.status === "error" && (
                  <p role="alert" className="absolute inset-0 flex items-start justify-center pt-24 px-8 text-center text-sm font-semibold text-rose-600">
                    {paper.error}
                  </p>
                )}

                {/* Teacher annotations overlay */}
                <canvas
                  ref={canvasRef}
                  width={PAPER_WIDTH}
                  height={paper.totalHeight}
                  className="absolute inset-0 z-20 pointer-events-none"
                />
              </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 max-w-md shadow-sm">
                <FileText size={48} className="mx-auto text-slate-400 mb-3" />
                <h4 className="font-bold text-slate-800 text-base">Paper Submission Details</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Textual answers or online submissions evaluated directly by the teacher.
                </p>
                {submission.textContent && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 text-left text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {submission.textContent}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Evaluation Summary Panel */}
          <div className="w-full lg:w-96 max-h-[48vh] lg:max-h-none shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {examOrAssignment?.questionPaperUrl && (
                <a
                  href={filesApi.resolveFileUrl(examOrAssignment.questionPaperUrl, token)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-[#008388] hover:bg-slate-100"
                >
                  <FileText size={14} /> Open the question paper
                </a>
              )}

              {(typedAnswers.length > 0 || audios.length > 0 || submission.textContent) && (
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">What you answered</h4>
                  {typedAnswers.map(([q, v]) => (
                    <p key={q} className="text-xs text-slate-700"><span className="font-bold">{/^\d+$/.test(q) ? `Q${Number(q) + 1}` : q}:</span> {String(v)}</p>
                  ))}
                  {submission.textContent && <p className="whitespace-pre-wrap text-xs text-slate-700">{submission.textContent}</p>}
                  {audios.map((a, i) => (
                    <audio key={i} controls preload="metadata" src={filesApi.resolveFileUrl(a.url, token)} className="h-8 w-full" />
                  ))}
                </div>
              )}

              {/* Score Box */}
              {released && (<>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Your Score</span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isPassing ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isPassing ? "Passing" : "Needs Review"} ({percentage}%)
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-4xl font-extrabold text-slate-900">{marksObtained}</span>
                  <span className="text-sm font-semibold text-slate-500">/ {maxMarks} Marks</span>
                </div>
              </div>

              {/* Question-wise Breakdown */}
              {Object.keys(questionMarks).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Question-Wise Breakdown
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(questionMarks).map(([qKey, val]) => (
                      <div
                        key={qKey}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                      >
                        <span className="text-xs font-bold text-slate-700">{qKey}</span>
                        <span className="text-xs font-bold text-[#008388]">{val || 0} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              </>)}

              {/* Teacher Feedback */}
              {released && submission.feedback && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-[#008388]" /> Teacher Feedback
                  </h4>
                  <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 text-xs text-slate-800 leading-relaxed italic">
                    "{submission.feedback}"
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 rounded-2xl bg-slate-900 text-white font-semibold text-xs shadow hover:bg-slate-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
    , document.body
  );
}
