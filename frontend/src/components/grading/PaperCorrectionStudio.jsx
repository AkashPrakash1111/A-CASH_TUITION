import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Pen,
  Highlighter,
  Check,
  XCircle,
  MessageSquare,
  Undo2,
  Trash2,
  Save,
  Send,
  Award,
  Hand,
  FileText,
  Plus,
  MessageCircle,
  Share2,
  Download,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { filesApi, examsApi, assignmentsApi, notesApi, studentsApi } from "../../services/api";
import { usePaperSheets, PAPER_WIDTH } from "../../hooks/usePaperPages";
import { drawAnnotationItem } from "../../utils/drawAnnotations";
import useFitScale from "../../hooks/useFitScale";
import { buildCorrectedPdf } from "../../utils/correctedPdf";

const isPdfUrl = (u = "") => /\.pdf(\?|$)/i.test(u) || u.startsWith("data:application/pdf");

// Indian numbers are usually saved as 10 digits: add the country code for wa.me
function whatsappNumber(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits.length >= 11 ? digits : "";
}

function parseAttachments(raw) {
  try {
    const list = JSON.parse(raw || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export default function PaperCorrectionStudio({
  isOpen,
  onClose,
  submission,
  examOrAssignment,
  isExam = true,
  kind: kindProp,
  student,
  onSaveSuccess,
}) {
  const kind = kindProp || (isExam ? "exam" : "assignment");
  const isNote = kind === "note";
  const paperTitle = examOrAssignment?.title || examOrAssignment?.examName || "paper";
  const { token } = useAuth();
  const canvasRef = useRef(null);

  // Tools: 'pen' | 'highlighter' | 'check' | 'cross' | 'mark' | 'comment'
  const [activeTool, setActiveTool] = useState("pen");
  const [penColor, setPenColor] = useState("#ef4444"); // Red by default for grading
  const penWidth = 3;
  const [stampValue, setStampValue] = useState("+1");

  // Layers of non-destructive annotations
  // Array of: { id, type: 'stroke'|'stamp'|'comment', color, width, points, x, y, text, value }
  const [annotations, setAnnotations] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  // The stroke in progress lives in a ref too: pointer events can arrive faster
  // than React re-renders, and reading state would drop points (or the stroke).
  const strokeRef = useRef(null);

  // Zoom & view controls
  const paperBoxRef = useRef(null);
  const zoom = useFitScale(paperBoxRef, PAPER_WIDTH, isOpen);

  // Evaluation & Question marks breakdown
  const [questionMarks, setQuestionMarks] = useState({});
  const [overallFeedback, setOverallFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Every photo / PDF the student sent, in order. Falls back to the old
  // single-file fields for submissions made before multi-upload existed.
  const { sheets, audios } = useMemo(() => {
    let list = Array.isArray(submission?.attachments) && submission.attachments.length
      ? submission.attachments
      : parseAttachments(submission?.attachmentsJson);
    if (list.length === 0) {
      const legacy = submission?.answerSheetUrl || submission?.fileUrl || submission?.file_url;
      if (legacy) list = [{ url: legacy, type: isPdfUrl(legacy) ? "pdf" : "image" }];
    }
    const visual = list
      .filter((f) => f && f.url && (f.type === "image" || f.type === "pdf"))
      .map((f) => ({ url: filesApi.resolveFileUrl(f.url, token), type: f.type }));
    const sounds = list.filter((f) => f && f.url && f.type === "audio");
    if (submission?.audioUrl && !sounds.some((f) => f.url === submission.audioUrl)) {
      sounds.push({ url: submission.audioUrl, type: "audio", name: "Voice answer" });
    }
    return { sheets: visual, audios: sounds };
  }, [submission, token]);
  const hasSheets = sheets.length > 0;
  const paper = usePaperSheets(sheets, isOpen && hasSheets);

  // The corrected PDF: set once the teacher has sent the paper back
  const [corrected, setCorrected] = useState({ url: "", blob: null });
  const [sendNote, setSendNote] = useState("");

  // Initialize questions and saved correction data
  useEffect(() => {
    if (!isOpen || !submission) return;

    // Load existing question marks
    if (submission.questionMarksJson) {
      try {
        setQuestionMarks(JSON.parse(submission.questionMarksJson));
      } catch {
        setQuestionMarks({});
      }
    } else {
      // Initialize questions from exam questions or default 5 questions
      const initial = {};
      if (examOrAssignment?.questions && examOrAssignment.questions.length > 0) {
        examOrAssignment.questions.forEach((q, idx) => {
          initial[`Q${idx + 1}`] = "";
        });
      } else {
        initial["Q1"] = "";
        initial["Q2"] = "";
        initial["Q3"] = "";
      }
      setQuestionMarks(initial);
    }

    // Load existing annotations
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

    setOverallFeedback(submission.feedback || submission.reviewFeedback || "");
    setSaveSuccessMsg("");
    setCorrected({ url: submission.correctedPdfUrl || "", blob: null });
    setSendNote("");
  }, [isOpen, submission, examOrAssignment]);

  // Redraw canvas whenever annotations, zoom, or current stroke change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed annotations
    annotations.forEach((item) => {
      drawAnnotationItem(ctx, item);
    });

    // Draw active drawing stroke if in progress
    if (currentStroke) {
      drawAnnotationItem(ctx, currentStroke);
    }
  }, [annotations, currentStroke, zoom, paper.totalHeight, paper.status]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    if (activeTool === "scroll") return;
    const coords = getCanvasCoords(e);

    if (activeTool === "pen" || activeTool === "highlighter") {
      strokeRef.current = {
        type: "stroke",
        color: activeTool === "highlighter" ? "#facc15" : penColor,
        width: activeTool === "highlighter" ? 18 : penWidth,
        isHighlighter: activeTool === "highlighter",
        points: [coords],
      };
      setCurrentStroke(strokeRef.current);
    } else if (activeTool === "check") {
      addAnnotation({
        type: "stamp",
        stampType: "check",
        x: coords.x,
        y: coords.y,
      });
    } else if (activeTool === "cross") {
      addAnnotation({
        type: "stamp",
        stampType: "cross",
        x: coords.x,
        y: coords.y,
      });
    } else if (activeTool === "mark") {
      addAnnotation({
        type: "stamp",
        stampType: "mark",
        color: penColor,
        value: stampValue,
        x: coords.x,
        y: coords.y,
      });
    } else if (activeTool === "comment") {
      const text = prompt("Enter evaluation comment / note for student:");
      if (text && text.trim()) {
        addAnnotation({
          type: "comment",
          text: text.trim(),
          x: coords.x,
          y: coords.y,
        });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!strokeRef.current) return;
    const coords = getCanvasCoords(e);
    strokeRef.current = { ...strokeRef.current, points: [...strokeRef.current.points, coords] };
    setCurrentStroke(strokeRef.current);
  };

  const handleMouseUp = () => {
    if (!strokeRef.current) return;
    const finished = strokeRef.current;
    strokeRef.current = null;
    setCurrentStroke(null);
    addAnnotation(finished);
  };

  const addAnnotation = (item) => {
    const withId = { ...item, id: crypto.randomUUID() };
    setAnnotations((prev) => [...prev, withId]);
  };

  const handleUndo = () => {
    if (annotations.length === 0) return;
    setAnnotations((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    if (annotations.length === 0) return;
    if (window.confirm("Clear all annotation marks from this paper?")) {
      setAnnotations([]);
    }
  };

  // Calculate total marks live
  const totalAwarded = Object.values(questionMarks).reduce((sum, val) => {
    const num = parseFloat(val);
    return !isNaN(num) ? sum + num : sum;
  }, 0);

  const maxTotal = parseFloat(examOrAssignment?.maxMarks || 100);
  const percentage = maxTotal > 0 ? Math.round((totalAwarded / maxTotal) * 100) : 0;
  const isPassing = percentage >= 40;

  const handleAddQuestion = () => {
    const nextQNum = Object.keys(questionMarks).length + 1;
    setQuestionMarks((prev) => ({
      ...prev,
      [`Q${nextQNum}`]: "",
    }));
  };

  const handleSaveEvaluation = async (publish = false) => {
    if (!token || !submission) return;
    setSaving(true);
    setSaveSuccessMsg("");

    try {
      let correctedPdfUrl;
      let pdfBlob = null;

      // Sending back = flatten every page with the teacher's marks into a PDF
      // and store it, so the student (and WhatsApp) get one clean file.
      if (publish && hasSheets && paper.status === "ready" && paper.pages.length > 0) {
        pdfBlob = await buildCorrectedPdf(paper.pages, annotations);
        const base = (paperTitle || "paper").replace(/[^a-z0-9]+/gi, "_").slice(0, 40);
        const file = new File([pdfBlob], `corrected_${base}_${(submission.student_name || "student").replace(/[^a-z0-9]+/gi, "_")}.pdf`, { type: "application/pdf" });
        const up = await filesApi.upload(token, file, "corrected");
        correctedPdfUrl = up.fileUrl;
      }

      if (isNote) {
        await notesApi.review(token, submission.id, {
          correctionData: JSON.stringify(annotations),
          feedback: overallFeedback.trim(),
          correctedPdfUrl,
        });
      } else {
        const payload = {
          marksObtained: String(totalAwarded),
          marks_obtained: totalAwarded,
          feedback: overallFeedback.trim(),
          status: publish ? "Graded" : "Draft Graded",
          correctionData: JSON.stringify(annotations),
          questionMarksJson: JSON.stringify(questionMarks),
          correctedPdfUrl,
        };
        if (isExam) await examsApi.grade(token, submission.id, payload);
        else await assignmentsApi.grade(token, submission.id, payload);
      }

      if (correctedPdfUrl) setCorrected({ url: correctedPdfUrl, blob: pdfBlob });
      setSaveSuccessMsg(publish ? "Sent back to the student's portal." : "Correction draft saved.");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert(`Could not save correction: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ---- WhatsApp -----------------------------------------------------------
  // The phone number comes from the student's roster entry
  const [rosterPhone, setRosterPhone] = useState("");
  const knownPhone = student?.phone || submission?.studentPhone || "";
  const studentId = submission?.student_id ?? submission?.studentId;
  useEffect(() => {
    if (!isOpen || knownPhone || !studentId || !token) return undefined;
    let cancelled = false;
    studentsApi
      .list(token)
      .then((list) => {
        const match = Array.isArray(list) ? list.find((x) => x.id === studentId) : null;
        if (!cancelled && match?.phone) setRosterPhone(match.phone);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen, knownPhone, studentId, token]);
  const phoneRaw = knownPhone || rosterPhone;
  const phone = whatsappNumber(phoneRaw);
  const absoluteCorrectedUrl = corrected.url
    ? new URL(filesApi.resolveFileUrl(corrected.url), window.location.origin).href
    : "";
  const waText = `Hello ${submission?.student_name || ""}, your corrected ${paperTitle || "paper"} is ready. Open it here: ${absoluteCorrectedUrl}`;

  const openWhatsApp = () => {
    setSendNote("");
    const target = phone ? `https://wa.me/${phone}` : "https://wa.me/";
    window.open(`${target}?text=${encodeURIComponent(waText)}`, "_blank", "noopener");
    if (!phone) setSendNote("No phone number is saved for this student, so pick the chat in WhatsApp yourself.");
  };

  // On phones, share the PDF file itself; elsewhere fall back to the link
  const sharePdf = async () => {
    setSendNote("");
    try {
      let blob = corrected.blob;
      if (!blob) blob = await (await fetch(filesApi.resolveFileUrl(corrected.url))).blob();
      const file = new File([blob], "corrected-paper.pdf", { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: waText });
      } else {
        openWhatsApp();
      }
    } catch (err) {
      if (err?.name !== "AbortError") setSendNote("Couldn't share the file. Use the WhatsApp link button instead.");
    }
  };

  if (!isOpen || !submission) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4">
      <div className="w-full max-w-[96vw] h-[95vh] bg-slate-900 rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-700 text-white">
        {/* Top Control Bar */}
        <div className="px-3 sm:px-6 py-3 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#008388]/30 text-teal-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  ACASH Paper Correction Studio
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-900 text-cyan-300">
                  {submission.student_name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {paperTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Non-destructive grading layer • Original student paper remains untouched
              </p>
            </div>
          </div>

          {/* Interactive Tools Palette */}
          <div className="flex items-center gap-2 bg-slate-900/90 rounded-2xl p-1.5 border border-slate-700 max-w-full overflow-x-auto order-last sm:order-none">
            {/* Scroll (hand): lets a finger scroll the paper instead of drawing */}
            <button
              onClick={() => setActiveTool("scroll")}
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                activeTool === "scroll" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Scroll the paper"
            >
              <Hand size={15} /> <span className="hidden sm:inline">Scroll</span>
            </button>

            {/* Pen Tool */}
            <button
              onClick={() => setActiveTool("pen")}
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                activeTool === "pen"
                  ? "bg-[#008388] text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Red/Green Ink Pen"
            >
              <Pen size={15} /> <span className="hidden sm:inline">Pen</span>
            </button>

            {/* Highlighter Tool */}
            <button
              onClick={() => setActiveTool("highlighter")}
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                activeTool === "highlighter"
                  ? "bg-yellow-500 text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Fluorescent Highlighter"
            >
              <Highlighter size={15} /> <span className="hidden sm:inline">Highlight</span>
            </button>

            {/* Checkmark Stamp (✓) */}
            <button
              onClick={() => setActiveTool("check")}
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                activeTool === "check"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Stamp Correct Answer (✓)"
            >
              <Check size={16} className="text-emerald-400" /> <span className="hidden sm:inline">✓ Correct</span>
            </button>

            {/* Crossmark Stamp (✗) */}
            <button
              onClick={() => setActiveTool("cross")}
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                activeTool === "cross"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Stamp Mistake / Cross (✗)"
            >
              <XCircle size={15} className="text-rose-400" /> <span className="hidden sm:inline">✗ Mistake</span>
            </button>

            {/* Mark Badge (+1, +2, +5) */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-700">
              <button
                onClick={() => setActiveTool("mark")}
                className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                  activeTool === "mark"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title="Stamp On-Paper Marks"
              >
                <Award size={14} /> <span className="hidden sm:inline">Award Mark</span>
              </button>
              {activeTool === "mark" && (
                <select
                  value={stampValue}
                  onChange={(e) => setStampValue(e.target.value)}
                  className="bg-slate-800 text-white text-xs font-bold rounded-lg px-2 py-1 outline-none border border-slate-700"
                >
                  <option value="+1">+1</option>
                  <option value="+2">+2</option>
                  <option value="+3">+3</option>
                  <option value="+5">+5</option>
                  <option value="+10">+10</option>
                  <option value="-1">-1</option>
                  <option value="-0.5">-½</option>
                </select>
              )}
            </div>

            {/* Comment Tool */}
            <button
              onClick={() => setActiveTool("comment")}
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                activeTool === "comment"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Sticky Teacher Note"
            >
              <MessageSquare size={14} /> <span className="hidden sm:inline">Comment</span>
            </button>

            {/* Color Select */}
            {activeTool === "pen" && (
              <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
                {["#ef4444", "#10b981", "#3b82f6", "#f59e0b"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPenColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition ${
                      penColor === c ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Undo & Clear */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
              <button
                onClick={handleUndo}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Undo last stroke"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={handleClearAll}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Clear all strokes"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Workspace: Left Paper View + Overlay Canvas | Right Evaluation Panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Paper View Container */}
          <div ref={paperBoxRef} className="flex-1 min-h-0 bg-slate-950 p-2 sm:p-4 overflow-auto relative select-none">
            {hasSheets ? (
              <div className="mx-auto" style={{ width: PAPER_WIDTH * zoom, height: paper.totalHeight * zoom }}>
              <div
                className="relative bg-white shadow-2xl rounded-2xl overflow-hidden"
                style={{
                  width: `${PAPER_WIDTH}px`,
                  height: `${paper.totalHeight}px`,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                }}
              >
                {/* Underlying student paper: every page, stacked */}
                {paper.pages.map((pg, i) => (
                  <img
                    key={i}
                    src={pg.src}
                    alt={`Answer sheet page ${i + 1}`}
                    draggable={false}
                    style={{ width: `${PAPER_WIDTH}px`, height: `${pg.height}px`, display: "block" }}
                    className="pointer-events-none"
                  />
                ))}
                {paper.status === "loading" && (
                  <p className="absolute inset-0 flex items-start justify-center pt-24 text-sm font-semibold text-slate-500">
                    Opening the answer sheet...
                  </p>
                )}
                {paper.status === "error" && (
                  <p role="alert" className="absolute inset-0 flex items-start justify-center pt-24 px-8 text-center text-sm font-semibold text-rose-600">
                    {paper.error}
                  </p>
                )}

                {/* Vector Drawing Overlay Canvas */}
                <canvas
                  ref={canvasRef}
                  width={PAPER_WIDTH}
                  height={paper.totalHeight}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    handleMouseDown(e);
                  }}
                  onPointerMove={handleMouseMove}
                  onPointerUp={handleMouseUp}
                  onPointerCancel={handleMouseUp}
                  className={`absolute inset-0 z-20 ${activeTool === "scroll" ? "cursor-grab touch-pan-y" : "cursor-crosshair touch-none"}`}
                />
              </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-900 rounded-3xl border border-slate-800 max-w-md">
                <FileText size={48} className="mx-auto text-slate-600 mb-3" />
                <h4 className="font-bold text-white text-base">No Scanned Answer Sheet Uploaded</h4>
                <p className="text-xs text-slate-400 mt-1">
                  The student submitted textual answers or did not attach a document. You can still award marks in the right-hand panel.
                </p>
                {submission.textContent && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-800 text-left text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {submission.textContent}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Evaluation & Marks Sidebar */}
          <div className="w-full lg:w-96 max-h-[48vh] lg:max-h-none shrink-0 bg-slate-800/95 border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col justify-between overflow-hidden">
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* What else the student sent */}
              {(audios.length > 0 || submission.textContent || examOrAssignment?.questionPaperUrl) && (
                <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Student's submission</p>
                  {examOrAssignment?.questionPaperUrl && (
                    <a
                      href={filesApi.resolveFileUrl(examOrAssignment.questionPaperUrl, token)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200"
                    >
                      <FileText size={13} /> Open question paper
                    </a>
                  )}
                  {audios.map((a, i) => (
                    <div key={`${a.url}-${i}`}>
                      <p className="mb-1 text-[11px] text-slate-400">{a.name || "Voice note"}</p>
                      <audio controls preload="metadata" src={filesApi.resolveFileUrl(a.url, token)} className="h-8 w-full" />
                    </div>
                  ))}
                  {submission.textContent && (
                    <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-800 p-3 text-xs text-slate-300">
                      {submission.textContent}
                    </p>
                  )}
                </div>
              )}

              {!isNote && (<>
              {/* Scorecard Header */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Score</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isPassing ? "bg-emerald-900/80 text-emerald-300" : "bg-rose-900/80 text-rose-300"
                    }`}
                  >
                    {isPassing ? "Passing" : "Review Needed"} ({percentage}%)
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-white">{totalAwarded}</span>
                  <span className="text-sm font-semibold text-slate-400">/ {maxTotal} Marks</span>
                </div>
              </div>

              {/* Question-wise Marks Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Question-Wise Marks
                  </label>
                  <button
                    onClick={handleAddQuestion}
                    className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Question
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {Object.entries(questionMarks).map(([qKey, marksVal]) => (
                    <div
                      key={qKey}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-700"
                    >
                      <span className="text-xs font-bold text-slate-300">{qKey}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={marksVal}
                          onChange={(e) =>
                            setQuestionMarks((prev) => ({
                              ...prev,
                              [qKey]: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="w-20 px-2.5 py-1 text-center font-bold text-sm bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-400"
                        />
                        <span className="text-xs text-slate-400">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              </>)}

              {/* Faculty Qualitative Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Teacher Feedback & Guidance
                </label>
                <textarea
                  rows={4}
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  placeholder="Provide praise for clear steps, point out where marks were lost, and suggest practice questions..."
                  className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 resize-none leading-relaxed"
                />
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-semibold text-center animate-in fade-in">
                  {saveSuccessMsg}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-900 border-t border-slate-700 flex flex-col gap-2">
              {corrected.url && (
                <div className="mb-1 space-y-2 rounded-2xl border border-emerald-700/60 bg-emerald-950/40 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Corrected PDF ready</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={openWhatsApp}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-2 text-xs font-bold text-slate-900 hover:brightness-95"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </button>
                    <button
                      onClick={sharePdf}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-700 py-2 text-xs font-semibold text-white hover:bg-slate-600"
                      title="Share the PDF file itself (works on phones)"
                    >
                      <Share2 size={14} /> Share file
                    </button>
                  </div>
                  <a
                    href={filesApi.resolveFileUrl(corrected.url, token)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    <Download size={12} /> Open / download PDF
                  </a>
                  <p className="text-[10px] leading-snug text-slate-400">
                    {phone ? `Opens WhatsApp to ${phoneRaw}.` : "No phone saved for this student: you'll pick the chat in WhatsApp."}{" "}
                    You press Send there. WhatsApp doesn't allow a website to send messages on its own.
                  </p>
                  {sendNote && <p className="text-[11px] text-amber-300">{sendNote}</p>}
                </div>
              )}

              {!isNote && (
                <button
                  onClick={() => handleSaveEvaluation(false)}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Save size={14} /> Save Correction Draft
                </button>
              )}

              <button
                onClick={() => handleSaveEvaluation(true)}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <Send size={14} /> {saving ? "Preparing PDF..." : isNote ? "Send Back to Student" : corrected.url ? "Re-send Corrected Paper" : "Publish Results to Student"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    , document.body
  );
}
