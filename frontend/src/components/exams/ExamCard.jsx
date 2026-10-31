import {
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  Pencil,
  Trash2,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

const statusStyle = {
  Upcoming: "bg-blue-100 text-blue-700",
  Ongoing: "bg-amber-100 text-amber-700",
  Completed: "bg-slate-200 text-slate-700",
};

const typeStyle = {
  "Unit Test": "bg-[#EAF8F8] text-[#008388]",
  "Mid Term": "bg-purple-50 text-purple-600",
  "Final Term": "bg-red-50 text-red-600",
  "Surprise Test": "bg-orange-50 text-orange-600",
};

export default function ExamCard({
  exam,
  status,
  onEdit,
  onDelete,
  onViewSubmissions,
}) {
  return (
    <div
      className="
        bg-white
        rounded-[28px]
        border
        border-slate-200
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
        overflow-hidden
        flex
        flex-col
      "
    >
      {/* Header */}

      <div className="flex items-start justify-between p-6 pb-4">

        <div className="min-w-0">

          <h3 className="font-bold text-lg text-slate-800 truncate">
            {exam.examName}
          </h3>

          {exam.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {exam.description}
            </p>
          )}

        </div>

        <span
          className={`
            shrink-0
            ml-3
            px-4
            py-1.5
            rounded-full
            text-xs
            font-semibold
            ${statusStyle[status] || "bg-gray-100 text-gray-600"}
          `}
        >
          {status}
        </span>

      </div>

      {/* Tags */}

      <div className="px-6 flex flex-wrap gap-2">

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            typeStyle[exam.examType] || "bg-gray-100 text-gray-600"
          }`}
        >
          {exam.examType}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF8F8] text-[#008388] text-xs font-medium">
          <GraduationCap size={14} />
          {exam.className}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF3FF] text-blue-600 text-xs font-medium">
          <BookOpen size={14} />
          {exam.subject}
        </span>

      </div>

      {/* Marks */}

      <div className="px-6 mt-4">
        <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Award size={16} />
          </div>
          <p className="text-sm font-medium">
            {exam.maxMarks || "--"} Marks
            {exam.passingMarks ? ` · Pass: ${exam.passingMarks}` : ""}
          </p>
        </div>
      </div>

      <div className="flex-1" />

      {/* Footer */}

      <div className="flex items-center justify-between px-6 py-5 mt-4 border-t border-slate-100 flex-wrap gap-3">

        <div className="flex items-center gap-4 text-gray-500">

          <div className="flex items-center gap-1.5 text-sm">
            <Calendar size={16} />
            <span>{exam.examDate}</span>
          </div>

          {exam.startTime && (
            <div className="flex items-center gap-1.5 text-sm">
              <Clock size={16} />
              <span>
                {exam.startTime}
                {exam.duration ? ` · ${exam.duration}m` : ""}
              </span>
            </div>
          )}

        </div>

        <div className="flex gap-2">

          <button
            onClick={() => onViewSubmissions(exam)}
            className="px-3 h-9 rounded-xl flex items-center gap-1.5 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100"
          >
            <ClipboardCheck size={14} />
            Submissions
          </button>

          <button
            onClick={() => onEdit(exam)}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center"
          >
            <Pencil size={16} className="text-slate-600" />
          </button>

          <button
            onClick={() => onDelete(exam.id)}
            className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>

        </div>

      </div>

    </div>
  );
}
