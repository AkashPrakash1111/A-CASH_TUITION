import { useEffect, useRef, useState } from "react";
import {
  X,
  Award,
  MessageSquare,
  Download,
  Calendar,
  GraduationCap,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { filesApi } from "../../services/api";
import usePaperPages, { PAPER_WIDTH } from "../../hooks/usePaperPages";

export default function CorrectedPaperViewer({
  isOpen,
  onClose,
  submission,
  examOrAssignment,
}) {
  const { token } = useAuth();
  const canvasRef = useRef(null);

  const rawFileUrl = submission?.answerSheetUrl || submission?.fileUrl || submission?.file_url || "";
  const resolvedFileUrl = filesApi.resolveFileUrl(rawFileUrl, token);
  const isPdf = /\.pdf(\?|$)/i.test(rawFileUrl) || rawFileUrl.startsWith("data:application/pdf");
  const paper = usePaperPages(resolvedFileUrl, isPdf, isOpen && Boolean(rawFileUrl));

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

    annotations.forEach((item) => {
      ctx.save();
      if (item.type === "stroke") {
        if (item.points && item.points.length >= 2) {
          ctx.beginPath();
          ctx.strokeStyle = item.color || "#ef4444";
          ctx.lineWidth = item.width || 3;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          if (item.isHighlighter) {
            ctx.globalAlpha = 0.4;
          }
          ctx.moveTo(item.points[0].x, item.points[0].y);
          for (let i = 1; i < item.points.length; i++) {
            ctx.lineTo(item.points[i].x, item.points[i].y);
          }
          ctx.stroke();
        }
      } else if (item.type === "stamp") {
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (item.stampType === "check") {
          ctx.fillStyle = "#10b981";
          ctx.fillText("✓", item.x, item.y);
        } else if (item.stampType === "cross") {
          ctx.fillStyle = "#ef4444";
          ctx.fillText("✗", item.x, item.y);
        } else if (item.stampType === "mark") {
          ctx.fillStyle = item.color || "#0284c7";
          ctx.beginPath();
          ctx.roundRect(item.x - 24, item.y - 14, 48, 28, 8);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(item.value, item.x, item.y);
        }
      } else if (item.type === "comment") {
        ctx.fillStyle = "#fef08a";
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 1.5;
        const textWidth = Math.max(120, ctx.measureText(item.text).width + 20);
        ctx.beginPath();
        ctx.roundRect(item.x, item.y, textWidth, 40, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#854d0e";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(item.text, item.x + 10, item.y + 20);
      }
      ctx.restore();
    });
  }, [annotations, paper.totalHeight]);

  const handleDownload = () => {
    if (!rawFileUrl) return;
    const a = document.createElement("a");
    a.href = resolvedFileUrl;
    a.download = `Corrected_${examOrAssignment?.title || "paper"}.pdf`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen || !submission) return null;

  const marksObtained = submission.marksObtained || submission.marks_obtained || 0;
  const maxMarks = examOrAssignment?.maxMarks || 100;
  const percentage = Math.round((parseFloat(marksObtained) / parseFloat(maxMarks)) * 100) || 0;
  const isPassing = percentage >= 40;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4">
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
                  Evaluated Result & Corrected Paper
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300">
                  {submission.status || "Graded"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {examOrAssignment?.title || "Academic Assessment"} • Reviewed by Teacher
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {rawFileUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold hover:bg-slate-700 transition"
              >
                <Download size={14} /> Download Paper
              </button>
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
        <div className="flex-1 flex overflow-hidden">
          {/* Paper View */}
          <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-start justify-center relative">
            {rawFileUrl ? (
              <div
                className="relative bg-white shadow-2xl rounded-2xl overflow-hidden"
                style={{ width: `${PAPER_WIDTH}px`, height: `${paper.totalHeight}px`, flexShrink: 0 }}
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
          <div className="w-80 sm:w-96 bg-white border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Score Box */}
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

              {/* Teacher Feedback */}
              {submission.feedback && (
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
  );
}
