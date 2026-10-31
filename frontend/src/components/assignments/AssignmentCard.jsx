import {
  Calendar,
  BookOpen,
  GraduationCap,
  Paperclip,
  Users,
  Pencil,
  Trash2,
} from "lucide-react";

import { formatDue, summarizeAttachments } from "./assignmentHelpers";

const statusStyle = {
  Active: "bg-green-100 text-green-700",
  Closed: "bg-slate-200 text-slate-600",
  Overdue: "bg-red-100 text-red-700",
};

export default function AssignmentCard({
  assignment,
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
            {assignment.title}
          </h3>

          {assignment.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {assignment.description}
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

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF8F8] text-[#008388] text-xs font-medium">
          <GraduationCap size={14} />
          {assignment.className}
          {assignment.batch ? ` · Batch ${assignment.batch}` : " · All batches"}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF3FF] text-blue-600 text-xs font-medium">
          <BookOpen size={14} />
          {assignment.subject}
        </span>

        {assignment.maxMarks && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
            {assignment.maxMarks} Marks
          </span>
        )}

      </div>

      {/* Attachments */}

      {assignment.attachments?.length > 0 && (
        <div className="px-6 mt-4">
          <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Paperclip size={16} />
            </div>
            <p className="text-sm font-medium truncate">
              {summarizeAttachments(assignment.attachments)}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Footer */}

      <div className="flex items-center justify-between px-6 py-5 mt-4 border-t border-slate-100">

        <div className="flex items-center gap-4 text-gray-500">

          <div className="flex items-center gap-1.5 text-sm">
            <Calendar size={16} />
            <span>Due {formatDue(assignment.dueDate)}</span>
          </div>

          <button
            onClick={() => onViewSubmissions && onViewSubmissions(assignment)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#008388] hover:text-[#006b6f] hover:underline"
          >
            <Users size={16} />
            <span>{assignment.submissionsCount || 0} submitted</span>
          </button>

        </div>

        <div className="flex gap-2">

          <button
            onClick={() => onEdit(assignment)}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center"
          >
            <Pencil size={16} className="text-slate-600" />
          </button>

          <button
            onClick={() => onDelete(assignment.id)}
            className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>

        </div>

      </div>

    </div>
  );
}
