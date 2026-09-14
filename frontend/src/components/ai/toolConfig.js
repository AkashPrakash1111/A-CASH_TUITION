import { ClipboardCheck, FileText, CalendarClock, MessageCircleQuestion } from "lucide-react";

// Every field either pulls its options from live data (optionsFrom: "classes"
// | "subjects") or ships its own fixed "options" list. The form component
// resolves "optionsFrom" at render time using whatever classes/subjects
// exist in the tuition right now.

export const AI_TOOLS = [
  {
    id: "question-paper",
    label: "Question Paper Generator",
    description: "Draft a structured exam paper with sectioned questions.",
    icon: ClipboardCheck,
    color: "bg-blue-50 text-blue-600",
    fields: [
      { name: "className", label: "Class", type: "select", optionsFrom: "classes", required: true },
      { name: "subject", label: "Subject", type: "select", optionsFrom: "subjects", required: true },
      { name: "topic", label: "Topics / Chapters", type: "text", placeholder: "e.g. Algebra, Trigonometry", required: true, span: 2 },
      { name: "examType", label: "Exam Type", type: "select", options: ["Unit Test", "Mid Term", "Final Term"], required: true },
      { name: "totalMarks", label: "Total Marks", type: "number", placeholder: "e.g. 50", required: true },
      { name: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Moderate", "Hard", "Mixed"], required: true },
    ],
  },
  {
    id: "notes",
    label: "Notes & Study Material",
    description: "Generate clear revision notes for a topic.",
    icon: FileText,
    color: "bg-emerald-50 text-emerald-600",
    fields: [
      { name: "className", label: "Class", type: "select", optionsFrom: "classes", required: true },
      { name: "subject", label: "Subject", type: "select", optionsFrom: "subjects", required: true },
      { name: "topic", label: "Topic", type: "text", placeholder: "e.g. Photosynthesis", required: true, span: 2 },
      { name: "length", label: "Length", type: "select", options: ["Brief", "Detailed"], required: true, span: 2 },
    ],
  },
  {
    id: "lesson-plan",
    label: "Lesson Plan Builder",
    description: "Plan a class session with objectives and activities.",
    icon: CalendarClock,
    color: "bg-violet-50 text-violet-600",
    fields: [
      { name: "className", label: "Class", type: "select", optionsFrom: "classes", required: true },
      { name: "subject", label: "Subject", type: "select", optionsFrom: "subjects", required: true },
      { name: "topic", label: "Topic", type: "text", placeholder: "e.g. Newton's Laws of Motion", required: true, span: 2 },
      { name: "duration", label: "Session Duration (mins)", type: "number", placeholder: "e.g. 45", required: true, span: 2 },
    ],
  },
  {
    id: "doubt-solver",
    label: "Doubt Solver",
    description: "Get a clear, student-friendly explanation for a question.",
    icon: MessageCircleQuestion,
    color: "bg-amber-50 text-amber-600",
    fields: [
      { name: "className", label: "Class", type: "select", optionsFrom: "classes", required: false },
      { name: "subject", label: "Subject", type: "select", optionsFrom: "subjects", required: false },
      { name: "question", label: "Student's Question", type: "textarea", placeholder: "Paste or type the question here...", required: true, span: 2 },
    ],
  },
];
