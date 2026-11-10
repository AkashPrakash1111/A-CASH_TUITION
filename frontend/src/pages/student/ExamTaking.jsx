import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  UploadCloud,
  FileText,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { examsApi, filesApi } from "../../services/api";
import { normalizeExam, normalizeQuestions } from "../../utils/examUtils";
import AttachmentPicker from "../../components/assignments/AttachmentPicker";

export default function ExamTaking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Exam taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId or index]: answerValue }
  const [flagged, setFlagged] = useState({}); // { [qId or index]: boolean }
  const [attachments, setAttachments] = useState([]); // photos / PDFs / voice notes

  // Countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(3600);
  const timerRef = useRef(null);

  // Submit Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadExam() {
      if (!token || !id) return;
      try {
        setLoading(true);
        const raw = await examsApi.get(token, id);
        const data = { ...normalizeExam(raw), questions: normalizeQuestions(raw.questions) };
        setExam(data);

        // Timer comes from the duration the admin set
        setSecondsRemaining((data.duration_minutes || 60) * 60);
      } catch (err) {
        console.error("Failed to load exam", err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [id, token]);

  const submitRef = useRef(null);

  // Timer Tick
  useEffect(() => {
    if (loading || submitted) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, submitted]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQuestions = exam?.questions || [];
  const activeQ = currentQuestions[currentIndex] || {};
  const paperUrl = exam?.questionPaperUrl ? filesApi.resolveFileUrl(exam.questionPaperUrl, token) : "";
  const activeQKey = activeQ.id || currentIndex;

  const handleSelectOption = (opt) => {
    setAnswers((prev) => ({ ...prev, [activeQKey]: opt }));
  };

  const handleTextAnswer = (txt) => {
    setAnswers((prev) => ({ ...prev, [activeQKey]: txt }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({ ...prev, [activeQKey]: !prev[activeQKey] }));
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      await examsApi.submit(token, id, {
        answers_json: JSON.stringify(answers),
        attachments: attachments.map(({ name, type, url }) => ({ name, type, url })),
      });

      setSubmitted(true);
      setIsSubmitModalOpen(false);
    } catch (err) {
      alert(`Could not submit exam: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Keep the timer pointed at the newest handler so it submits the student's
  // real answers rather than the empty ones from the first render.
  useEffect(() => {
    submitRef.current = handleFinalSubmit;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8FC] p-8 text-center text-slate-500">
        <p className="font-semibold text-sm">Entering Secure Exam Arena...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 text-center shadow-2xl border border-purple-100">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Exam Submitted!</h2>
          <p className="text-xs text-slate-500 mt-2">
            Your responses for <strong>{exam?.title}</strong> have been securely recorded. Your score and faculty evaluation will be published shortly.
          </p>
          <button
            onClick={() => navigate("/student/exams")}
            className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md"
          >
            Return to Examination Arena
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).filter((k) => Boolean(answers[k])).length;
  const isTimeCritical = secondsRemaining < 300; // < 5 mins

  return (
    <div className="min-h-screen bg-[#F4F8FC] pb-12">
      {/* Top Fixed Exam Banner */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to exit the exam arena? Your ongoing timer will not pause.")) {
                navigate("/student/exams");
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {exam?.subject_name || exam?.subject || "Examination"}
            </span>
            <h1 className="font-extrabold text-slate-800 text-base line-clamp-1">{exam?.title}</h1>
          </div>
        </div>

        {/* Live Countdown & Finish Button */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono font-bold text-sm shadow-sm border ${
              isTimeCritical
                ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse"
                : "bg-slate-900 border-slate-800 text-cyan-300"
            }`}
          >
            <Clock size={16} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition active:scale-95"
          >
            Finish Exam
          </button>
        </div>
      </header>

      {/* Main Examination Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Palette (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Question Palette</h3>
              <span className="text-xs text-slate-400">
                {answeredCount} / {currentQuestions.length} Done
              </span>
            </div>

            {/* Question Buttons */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {currentQuestions.map((q, idx) => {
                const qKey = q.id || idx;
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[qKey]);
                const isFlagged = Boolean(flagged[qKey]);

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl text-xs font-bold relative transition flex items-center justify-center border ${
                      isCurrent
                        ? "bg-purple-600 text-white border-purple-600 ring-2 ring-purple-300 shadow"
                        : isAnswered
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Answered
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200" /> Unanswered
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600" /> Current
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Flagged
              </div>
            </div>
          </div>

          {paperUrl && (
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                <FileText size={16} className="text-purple-600" /> Official Question Paper
              </h4>
              <a
                href={paperUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-semibold text-xs hover:bg-purple-100"
              >
                Open question paper
              </a>
            </div>
          )}

          {/* Handwritten Answer Sheet Upload */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <FileText size={16} className="text-purple-600" /> Attach Handwritten Answer Sheets
            </h4>
            <p className="text-[11px] text-slate-500">
              Take photos with your camera or pick as many as you like from your gallery. PDFs and voice notes work too.
            </p>
            <AttachmentPicker value={attachments} onChange={setAttachments} disabled={submitting} />
          </div>
        </div>

        {/* Right Active Question Pane (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentQuestions.length === 0 ? (
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm text-center space-y-2">
              <p className="font-bold text-slate-800 text-sm">No typed questions in this exam</p>
              <p className="text-xs text-slate-500">
                {paperUrl
                  ? "Open the official question paper on the left, write your answers on paper, and attach photos of your answer sheets before finishing."
                  : "Your teacher has not added any questions yet. Please check back later."}
              </p>
            </div>
          ) : (
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-extrabold text-slate-800 text-sm">
                Question {currentIndex + 1} of {currentQuestions.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700">
                  {activeQ.marks} Marks
                </span>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
                    flagged[activeQKey]
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Flag size={12} />
                  {flagged[activeQKey] ? "Flagged" : "Flag"}
                </button>
              </div>
            </div>

            {/* Prompt */}
            <div>
              <p className="text-slate-800 font-semibold text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                {activeQ.text}
              </p>
            </div>

            {/* Answer Input */}
            {activeQ.type === "mcq" ? (
              <div className="space-y-3 pt-2">
                {activeQ.options.map((option, idx) => {
                  const isSelected = answers[activeQKey] === option;
                  const letter = ["A", "B", "C", "D"][idx] || String(idx + 1);

                  return (
                    <label
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? "bg-purple-50 border-purple-400 text-purple-900 shadow-sm"
                          : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-purple-600 text-white" : "bg-white text-slate-500 border border-slate-200"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm font-medium">{option}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">Written Response / Derivation:</label>
                <textarea
                  rows={6}
                  value={answers[activeQKey] || ""}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  placeholder="Type your complete solution, steps, and final answer here..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition leading-relaxed"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-30 transition"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                onClick={() => setCurrentIndex((prev) => Math.min(currentQuestions.length - 1, prev + 1))}
                disabled={currentIndex === currentQuestions.length - 1}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-sm hover:bg-purple-700 disabled:opacity-30 transition"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
            <ShieldAlert size={36} className="mx-auto text-purple-600 mb-3" />
            <h3 className="text-xl font-extrabold text-slate-800">Finish & Submit Exam?</h3>
            <p className="text-xs text-slate-500 mt-2">
              You have answered <strong>{answeredCount}</strong> of <strong>{currentQuestions.length}</strong> questions.
            </p>

            {answeredCount < currentQuestions.length && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-50 text-amber-800 text-xs font-medium">
                ⚠️ You have {currentQuestions.length - answeredCount} unanswered question(s). You can still return and complete them before submitting.
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Yes, Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
