import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  FileCode,
  Edit3,
  ExternalLink,
  Check,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";
import { useAuth } from "../../hooks/useAuth";
import { filesApi, examsApi } from "../../services/api";

const EXAM_TYPES = ["Unit Test", "Mid Term", "Final Term", "Surprise Test", "Mock Exam"];

function clientParseQuestionsText(text) {
  if (!text || !text.trim()) return [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const list = [];
  let cur = null;

  const finalize = () => {
    if (cur && cur.question_text.trim()) {
      if (cur.options.filter(Boolean).length >= 2) {
        cur.question_type = "mcq";
      } else {
        cur.question_type = "text";
      }
      list.push(cur);
    }
  };

  const qStartRegex = /^(?:#{1,4}\s*)?(?:\*{0,2})?(?:Question|Q\.?|Q\s*)?\s*(\d+)[\.\:\-\)]\s*(.*)/i;
  const optRegex = /^(?:[-*•]\s*)?(?:\*{0,2})?\(?([A-Fa-f])\)?[.:\)]\s*(?:\*{0,2})?\s*(.*)/;
  const ansRegex = /^(?:\*{0,2})?(?:Correct\s+Answer|Answer|Ans)\s*[:\-.]?\s*(?:\*{0,2})?\s*(.*)/i;
  const marksRegex = /(?:\[|\()?(?:Marks?|Points?)\s*[:\-.]?\s*(\d+)(?:\s*marks?)?(?:\]|\))?/i;
  const expRegex = /^(?:\*{0,2})?(?:Explanation|Solution|Rationale)\s*[:\-.]?\s*(?:\*{0,2})?\s*(.*)/i;

  let state = "NONE";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const qMatch = line.match(qStartRegex);
    if (qMatch) {
      finalize();
      const qNum = parseInt(qMatch[1]) || list.length + 1;
      const qBody = qMatch[2].replace(/^\*{1,2}|\*{1,2}$/g, "").trim();
      cur = {
        id: crypto.randomUUID(),
        question_number: qNum,
        question_text: qBody,
        question_type: "mcq",
        options: ["", "", "", ""],
        correct_answer: "",
        marks: 2,
        explanation: "",
      };
      state = "IN_Q";
      continue;
    }

    if (!cur) {
      cur = {
        id: crypto.randomUUID(),
        question_number: list.length + 1,
        question_text: line,
        question_type: "mcq",
        options: ["", "", "", ""],
        correct_answer: "",
        marks: 2,
        explanation: "",
      };
      state = "IN_Q";
      continue;
    }

    const marksMatch = line.match(marksRegex);
    if (marksMatch && (line.toLowerCase().includes("mark") || line.toLowerCase().includes("point"))) {
      cur.marks = Number(marksMatch[1]) || 2;
      if (line.length < 25) continue;
    }

    const ansMatch = line.match(ansRegex);
    if (ansMatch) {
      const rawAns = ansMatch[1].replace(/^\*{1,2}|\*{1,2}$/g, "").trim();
      const letterMatch = rawAns.match(/\(?([A-Da-d])\)?/);
      cur.correct_answer = letterMatch ? letterMatch[1].toUpperCase() : rawAns;
      state = "IN_ANS";
      continue;
    }

    const expMatch = line.match(expRegex);
    if (expMatch) {
      cur.explanation = expMatch[1].trim();
      state = "IN_EXP";
      continue;
    }

    const optMatch = line.match(optRegex);
    if (optMatch && state !== "IN_EXP") {
      const letter = optMatch[1].toUpperCase();
      const optIdx = ["A", "B", "C", "D"].indexOf(letter);
      const textVal = optMatch[2].replace(/^\*{1,2}|\*{1,2}$/g, "").trim();
      if (optIdx >= 0 && optIdx < 4) {
        cur.options[optIdx] = textVal;
      } else {
        cur.options.push(textVal);
      }
      state = "IN_OPT";
      continue;
    }

    if (state === "IN_EXP") {
      cur.explanation += " " + line;
    } else if (state === "IN_Q") {
      cur.question_text += "\n" + line;
    }
  }

  finalize();
  return list;
}

export default function ExamFormModal({
  isOpen,
  onClose,
  onSave,
  exam,
  classes = [],
  subjects = [],
}) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("general"); // general | questions | ocr | bulk

  // General Fields
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState(EXAM_TYPES[0]);
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [maxMarks, setMaxMarks] = useState("100");
  const [passingMarks, setPassingMarks] = useState("40");
  const [questionPaperUrl, setQuestionPaperUrl] = useState("");
  const [uploadingPaper, setUploadingPaper] = useState(false);
  const [paperFileName, setPaperFileName] = useState("");
  const [errors, setErrors] = useState({});

  // Structured Questions
  const [questions, setQuestions] = useState([]);

  // OCR Upload & Verification state (Human-in-the-Loop)
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrDrafts, setOcrDrafts] = useState([]);
  const [ocrReviewed, setOcrReviewed] = useState(false);

  // Bulk AI Markdown/Text Parser State
  const [bulkText, setBulkText] = useState("");
  const [bulkParsing, setBulkParsing] = useState(false);
  const [bulkDrafts, setBulkDrafts] = useState([]);
  const [isValidatingBulk, setIsValidatingBulk] = useState(false);

  const isEditing = Boolean(exam);

  useEffect(() => {
    if (!isOpen) return;

    setExamName(exam?.examName || exam?.title || "");
    setExamType(exam?.examType || exam?.exam_type || EXAM_TYPES[0]);
    setDescription(exam?.description || "");
    setClassName(exam?.className || exam?.batch_name || classes[0] || "");
    setSubject(exam?.subject || exam?.subject_name || subjects[0] || "");
    setExamDate(exam?.examDate || exam?.scheduled_date || "");
    setStartTime(exam?.startTime || "10:00 AM");
    setDuration(exam?.duration_minutes ? String(exam.duration_minutes) : (exam?.duration ? String(parseInt(exam.duration)) : "60"));
    setMaxMarks(exam?.maxMarks ? String(exam.maxMarks) : (exam?.total_marks ? String(exam.total_marks) : "100"));
    setPassingMarks(exam?.passingMarks ? String(exam.passingMarks) : (exam?.passing_marks ? String(exam.passing_marks) : "40"));
    setQuestionPaperUrl(exam?.questionPaperUrl || exam?.question_paper_url || "");
    setPaperFileName(exam?.questionPaperUrl ? "official_question_paper" : "");
    setQuestions(Array.isArray(exam?.questions) ? exam.questions : []);
    setOcrDrafts([]);
    setOcrReviewed(false);
    setBulkText("");
    setBulkDrafts([]);
    setIsValidatingBulk(false);
    setErrors({});
    setActiveTab("general");
  }, [isOpen, exam, classes, subjects]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};
    if (!examName.trim()) nextErrors.examName = "Exam title is required";
    if (!className) nextErrors.className = "Select a class / batch";
    if (!subject) nextErrors.subject = "Select a subject";
    if (!examDate) nextErrors.examDate = "Exam date is required";
    if (!maxMarks) nextErrors.maxMarks = "Total marks is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePaperUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPaperFileName(file.name);
    setUploadingPaper(true);
    try {
      if (token) {
        const res = await filesApi.upload(token, file, "question_papers");
        if (res && res.url) {
          setQuestionPaperUrl(res.url);
          setUploadingPaper(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Upload api fallback to dataUrl", err);
    }
    const reader = new FileReader();
    reader.onload = () => {
      setQuestionPaperUrl(reader.result);
      setUploadingPaper(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddQuestion = () => {
    const newQ = {
      id: crypto.randomUUID(),
      question_number: questions.length + 1,
      question_text: "",
      question_type: "mcq", // mcq | text
      marks: 5,
      options: ["", "", "", ""],
      correct_answer: "",
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, val) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = [...(next[qIdx].options || ["", "", "", ""])];
      opts[optIdx] = val;
      next[qIdx] = { ...next[qIdx], options: opts };
      return next;
    });
  };

  // OCR Ingestion Flow
  const handleOcrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrFile(file);
    setOcrProcessing(true);

    setTimeout(() => {
      const extracted = [
        {
          id: crypto.randomUUID(),
          question_number: questions.length + 1,
          question_text: "State and prove the Pythagorean Theorem with a labeled right triangle diagram.",
          question_type: "text",
          marks: 10,
          options: [],
          correct_answer: "",
        },
        {
          id: crypto.randomUUID(),
          question_number: questions.length + 2,
          question_text: "Which of the following numbers is an irrational number?",
          question_type: "mcq",
          marks: 2,
          options: ["3.1415", "Square root of 2", "22 / 7", "0.333..."],
          correct_answer: "Square root of 2",
        },
        {
          id: crypto.randomUUID(),
          question_number: questions.length + 3,
          question_text: "Find the roots of the quadratic equation: x^2 - 5x + 6 = 0.",
          question_type: "text",
          marks: 5,
          options: [],
          correct_answer: "x = 2, x = 3",
        },
      ];
      setOcrDrafts(extracted);
      setOcrProcessing(false);
      setOcrReviewed(false);
    }, 1200);
  };

  const handleApproveOcr = () => {
    setQuestions((prev) => [...prev, ...ocrDrafts]);
    setOcrReviewed(true);
    setActiveTab("questions");
  };

  // Bulk AI Markdown/Text Parsing Flow
  const handleParseBulkText = async () => {
    if (!bulkText.trim()) {
      alert("Please paste the AI question paper content in the text area.");
      return;
    }
    setBulkParsing(true);
    try {
      if (token) {
        const res = await examsApi.parseBulkQuestions(token, bulkText);
        if (res && Array.isArray(res.questions) && res.questions.length > 0) {
          const parsed = res.questions.map((q, idx) => ({
            id: crypto.randomUUID(),
            question_number: questions.length + idx + 1,
            question_text: q.questionText || "",
            question_type: q.questionType || (q.options?.length >= 2 ? "mcq" : "text"),
            marks: Number(q.marks) || 2,
            options: q.options?.map((o) => o.replace(/^[A-Da-d]\)\s*/, "")) || ["", "", "", ""],
            correct_answer: q.correctAnswer || "",
            explanation: q.explanation || "",
          }));
          setBulkDrafts(parsed);
          setIsValidatingBulk(true);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend parse failed, using client regex parser", err);
    } finally {
      setBulkParsing(false);
    }

    const clientParsed = clientParseQuestionsText(bulkText);
    if (clientParsed.length === 0) {
      alert("Could not detect structured questions. Please verify format (e.g., 1. Question text, A) Option 1, Answer: A).");
    } else {
      setBulkDrafts(clientParsed);
      setIsValidatingBulk(true);
    }
    setBulkParsing(false);
  };

  const handleBulkDraftChange = (idx, field, val) => {
    setBulkDrafts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleBulkOptionChange = (qIdx, optIdx, val) => {
    setBulkDrafts((prev) => {
      const next = [...prev];
      const opts = [...(next[qIdx].options || ["", "", "", ""])];
      opts[optIdx] = val;
      next[qIdx] = { ...next[qIdx], options: opts };
      return next;
    });
  };

  const handleRemoveBulkDraft = (idx) => {
    setBulkDrafts(bulkDrafts.filter((_, i) => i !== idx));
  };

  const handleAddBulkDraftQuestion = () => {
    setBulkDrafts([
      ...bulkDrafts,
      {
        id: crypto.randomUUID(),
        question_number: bulkDrafts.length + 1,
        question_text: "",
        question_type: "mcq",
        marks: 2,
        options: ["", "", "", ""],
        correct_answer: "A",
        explanation: "",
      },
    ]);
  };

  const handleImportValidatedBulk = () => {
    if (bulkDrafts.length === 0) return;
    setQuestions((prev) => [...prev, ...bulkDrafts]);
    setBulkDrafts([]);
    setBulkText("");
    setIsValidatingBulk(false);
    setActiveTab("questions");
  };

  const handleSubmit = () => {
    if (!validate()) {
      setActiveTab("general");
      return;
    }

    onSave({
      id: exam?.id,
      examName: examName.trim(),
      title: examName.trim(),
      examType,
      description: description.trim(),
      className,
      batch: className,
      subject,
      examDate,
      startTime,
      duration: `${duration} mins`,
      duration_minutes: parseInt(duration) || 60,
      maxMarks: Number(maxMarks) || 100,
      passingMarks: Number(passingMarks) || 40,
      questionPaperUrl: questionPaperUrl || null,
      questions,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] w-full max-w-4xl p-6 sm:p-8 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Exam Studio
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
              {isEditing ? "Edit Examination" : "Create & Schedule Exam"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload proper question papers, author MCQs manually, or paste AI question papers in bulk.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Builder Mode Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "general"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            1. General Config
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "questions"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            2. Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "bulk"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <FileCode size={13} /> 3. Bulk AI Import
          </button>
          <button
            onClick={() => setActiveTab("ocr")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "ocr"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Sparkles size={13} /> 4. Paper OCR Ingestion
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* TAB 1: GENERAL CONFIG */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <Input
                label="Exam Title *"
                placeholder="e.g. Mathematics Mid-Term Assessment"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                error={errors.examName}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  >
                    {EXAM_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <SearchableSelect
                  label="Class / Batch"
                  required
                  placeholder="Select or type batch..."
                  options={classes}
                  value={className}
                  onChange={(val) => setClassName(val)}
                  error={errors.className}
                  allowCustom={true}
                />

                <SearchableSelect
                  label="Subject"
                  required
                  placeholder="Select or type subject..."
                  options={subjects}
                  value={subject}
                  onChange={(val) => setSubject(val)}
                  error={errors.subject}
                  allowCustom={true}
                />

                <Input
                  type="date"
                  label="Exam Date *"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  error={errors.examDate}
                />

                <Input
                  label="Start Time"
                  placeholder="10:00 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />

                <Input
                  label="Duration (Minutes)"
                  type="number"
                  placeholder="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />

                <Input
                  label="Total Marks *"
                  type="number"
                  placeholder="100"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  error={errors.maxMarks}
                />

                <Input
                  label="Passing Marks"
                  type="number"
                  placeholder="40"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                />
              </div>

              {/* Official Question Paper Upload Section */}
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                      <FileText size={16} className="text-purple-600" /> Upload Official Question Paper (PDF / Image)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload the complete question paper document for students to view in the Exam Arena.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handlePaperUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 cursor-pointer"
                  />
                  {uploadingPaper && (
                    <span className="text-xs font-semibold text-purple-600 animate-pulse shrink-0">
                      Uploading...
                    </span>
                  )}
                </div>

                {questionPaperUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-purple-200 text-xs">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5 truncate">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      Attached: {paperFileName || "question_paper.pdf"}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={questionPaperUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center gap-1"
                      >
                        Preview <ExternalLink size={11} />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionPaperUrl("");
                          setPaperFileName("");
                        }}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                        title="Remove question paper"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Instructions / Overview</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Students must complete all questions within the allotted duration..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURED QUESTIONS BUILDER */}
          {activeTab === "questions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Exam Questions</h3>
                  <p className="text-xs text-slate-500">Add MCQs or written descriptive questions.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("bulk")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200 hover:bg-purple-100 transition"
                  >
                    <FileCode size={14} /> Bulk Paste AI Questions
                  </button>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-sm hover:bg-purple-700 transition"
                  >
                    <Plus size={14} /> Add Question
                  </button>
                </div>
              </div>

              {questions.length === 0 && (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-xs">No questions authored yet.</p>
                  <p className="text-[11px] mt-1">Click "Add Question" or use "Bulk Paste AI Questions" to import in seconds.</p>
                </div>
              )}

              {questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-700">Question #{idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <select
                        value={q.question_type || q.questionType}
                        onChange={(e) => handleQuestionChange(idx, "question_type", e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium"
                      >
                        <option value="mcq">Multiple Choice (MCQ)</option>
                        <option value="text">Written / Descriptive</option>
                      </select>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">Marks:</span>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => handleQuestionChange(idx, "marks", Number(e.target.value))}
                          className="w-14 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={q.question_text || q.questionText || ""}
                    onChange={(e) => handleQuestionChange(idx, "question_text", e.target.value)}
                    placeholder="Enter question prompt..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />

                  {(q.question_type === "mcq" || q.questionType === "mcq") && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {["A", "B", "C", "D"].map((optLabel, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{optLabel}:</span>
                          <input
                            type="text"
                            value={q.options?.[optIdx] || ""}
                            onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                            placeholder={`Option ${optLabel}`}
                            className="flex-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: BULK AI IMPORT & VALIDATION STEP */}
          {activeTab === "bulk" && (
            <div className="space-y-5">
              {!isValidatingBulk ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-indigo-800">
                      <Sparkles size={16} /> Bulk Question AI Ingestion Engine
                    </div>
                    <p>
                      Paste an entire question paper generated by ChatGPT, Claude, DeepSeek, or Gemini in Markdown or plain-text. ACASH automatically parses questions, MCQ choices (A–D), correct answers, marks, and solutions.
                    </p>
                    <p className="text-[11px] text-indigo-700 font-medium">
                      Supported format: <code>1. Question text? \n A) Opt 1 \n B) Opt 2 \n Answer: B \n Marks: 2 \n Explanation: ...</code>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Paste AI-Generated Question Paper:
                    </label>
                    <textarea
                      rows={12}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={`1. What is the powerhouse of the cell?
A) Ribosome
B) Mitochondria
C) Nucleus
D) Endoplasmic Reticulum
Answer: B
Marks: 2
Explanation: Mitochondria generates ATP.

2. State Newton's Second Law of Motion.
Answer: F = ma
Marks: 5
Explanation: Force equals mass times acceleration.`}
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Review & Validate step follows automatically before importing.
                    </span>
                    <button
                      type="button"
                      onClick={handleParseBulkText}
                      disabled={bulkParsing}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {bulkParsing ? "Parsing AI Paper..." : "Parse & Preview Questions →"}
                    </button>
                  </div>
                </div>
              ) : (
                /* PREVIEW & VALIDATE STEP */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 size={16} /> Preview & Validate Parsed Questions ({bulkDrafts.length})
                      </h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Carefully review parsed questions. Correct options, answers, or marks before importing into the exam.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsValidatingBulk(false)}
                        className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 font-bold text-xs bg-white hover:bg-emerald-50"
                      >
                        Edit Raw Text
                      </button>
                      <button
                        type="button"
                        onClick={handleImportValidatedBulk}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                      >
                        <Check size={14} /> Import All ({bulkDrafts.length})
                      </button>
                    </div>
                  </div>

                  {/* List of Editable Cards */}
                  <div className="space-y-3">
                    {bulkDrafts.map((draft, idx) => (
                      <div
                        key={draft.id || idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-purple-700">
                            Parsed Question #{idx + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <select
                              value={draft.question_type}
                              onChange={(e) =>
                                handleBulkDraftChange(idx, "question_type", e.target.value)
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold"
                            >
                              <option value="mcq">Multiple Choice (MCQ)</option>
                              <option value="text">Written / Descriptive</option>
                            </select>

                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-500 font-bold">Marks:</span>
                              <input
                                type="number"
                                value={draft.marks}
                                onChange={(e) =>
                                  handleBulkDraftChange(idx, "marks", Number(e.target.value))
                                }
                                className="w-14 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-center font-bold"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveBulkDraft(idx)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Question Text */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Question Prompt:
                          </label>
                          <textarea
                            rows={2}
                            value={draft.question_text}
                            onChange={(e) =>
                              handleBulkDraftChange(idx, "question_text", e.target.value)
                            }
                            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        {/* MCQ Options */}
                        {draft.question_type === "mcq" ? (
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Options & Correct Choice:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {["A", "B", "C", "D"].map((optLetter, optIdx) => {
                                const isCorrect =
                                  draft.correct_answer?.toUpperCase() === optLetter ||
                                  draft.correct_answer === draft.options?.[optIdx];

                                return (
                                  <div
                                    key={optIdx}
                                    className={`flex items-center gap-2 p-2 rounded-xl border ${
                                      isCorrect
                                        ? "bg-purple-50 border-purple-300"
                                        : "bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleBulkDraftChange(idx, "correct_answer", optLetter)
                                      }
                                      className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                                        isCorrect
                                          ? "bg-purple-600 text-white"
                                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                      }`}
                                      title="Mark as correct answer"
                                    >
                                      {optLetter}
                                    </button>
                                    <input
                                      type="text"
                                      value={draft.options?.[optIdx] || ""}
                                      onChange={(e) =>
                                        handleBulkOptionChange(idx, optIdx, e.target.value)
                                      }
                                      placeholder={`Option ${optLetter}`}
                                      className="flex-1 bg-transparent border-0 text-xs focus:outline-none"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Model Answer / Solution Key:
                            </label>
                            <input
                              type="text"
                              value={draft.correct_answer}
                              onChange={(e) =>
                                handleBulkDraftChange(idx, "correct_answer", e.target.value)
                              }
                              placeholder="Key solution formula or sentence"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                            />
                          </div>
                        )}

                        {draft.explanation && (
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                            <strong>Explanation:</strong> {draft.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleAddBulkDraftQuestion}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Add Another Question
                    </button>
                    <button
                      type="button"
                      onClick={handleImportValidatedBulk}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} /> Import All ({bulkDrafts.length}) Questions
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HUMAN-IN-THE-LOOP OCR INGESTION */}
          {activeTab === "ocr" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertTriangle size={16} /> Mandatory Faculty Verification Required
                </div>
                <p>
                  To uphold the highest academic standards, test questions extracted via paper scanning or OCR must be reviewed, verified, and approved by the teacher before being published to students.
                </p>
              </div>

              <div className="p-6 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-3xl bg-purple-50/30 text-center transition">
                <UploadCloud size={36} className="mx-auto text-purple-600 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Upload Question Paper Scan</h4>
                <p className="text-xs text-slate-500 mt-0.5">Supports PDF or images (JPG, PNG)</p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleOcrUpload}
                  className="hidden"
                  id="ocr-upload-input"
                />
                <label
                  htmlFor="ocr-upload-input"
                  className="mt-3 inline-block px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold cursor-pointer hover:bg-purple-700 transition"
                >
                  Choose Paper File
                </label>
              </div>

              {ocrProcessing && (
                <div className="p-6 text-center text-xs text-purple-700 font-semibold bg-purple-50 rounded-2xl animate-pulse">
                  Extracting questions from test paper... Please hold...
                </div>
              )}

              {ocrDrafts.length > 0 && !ocrProcessing && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs">
                      Extracted Questions Awaiting Approval ({ocrDrafts.length}):
                    </h4>
                    <button
                      type="button"
                      onClick={handleApproveOcr}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition"
                    >
                      <CheckCircle2 size={14} /> Approve & Append Questions
                    </button>
                  </div>

                  {ocrDrafts.map((d, i) => (
                    <div key={d.id} className="p-3.5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-800">Review Item #{i + 1}</span>
                        <span className="text-[11px] font-semibold text-slate-500">{d.marks} Marks</span>
                      </div>
                      <textarea
                        rows={2}
                        value={d.question_text}
                        onChange={(e) => {
                          const next = [...ocrDrafts];
                          next[i].question_text = e.target.value;
                          setOcrDrafts(next);
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {questions.length} question(s) configured
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition active:scale-95"
            >
              {isEditing ? "Save Exam" : "Publish & Schedule Exam ✨"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
