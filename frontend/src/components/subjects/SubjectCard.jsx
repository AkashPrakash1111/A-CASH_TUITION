import { User, GraduationCap, Layers3, Users, Eye, Pencil, Trash2 } from "lucide-react";

import { getSubjectVisual } from "./subjectVisuals";

export default function SubjectCard({
  subject,
  batchesCount = 0,
  studentsCount = 0,
  onView,
  onEdit,
  onDelete,
}) {
  const { icon: Icon, color } = getSubjectVisual(subject.name);

  const isActive = subject.status === "Active";

  return (
    <div
      className="
        bg-white
        rounded-[28px]
        border
        border-slate-200
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
        p-6
        flex
        flex-col
      "
    >
      {/* Header */}

      <div className="flex items-start gap-4">

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={24} />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-800 truncate">
              {subject.name}
            </h3>

            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isActive ? "bg-green-500" : "bg-slate-300"
              }`}
              title={subject.status}
            />
          </div>

          {subject.className && (
            <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              <GraduationCap size={12} />
              {subject.className}
            </span>
          )}

        </div>

      </div>

      {/* Teacher + description */}

      <div className="mt-5 space-y-2">

        {subject.teacher && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User size={14} className="shrink-0" />
            <span className="truncate">{subject.teacher}</span>
          </div>
        )}

        {subject.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {subject.description}
          </p>
        )}

      </div>

      <div className="flex-1" />

      {/* Stats */}

      <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers3 size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">
              {batchesCount}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Batches</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">
              {studentsCount}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Students</p>
          </div>
        </div>

      </div>

      {/* Actions */}

      <div className="grid grid-cols-3 gap-2 mt-5">

        <button
          onClick={() => onView(subject)}
          className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600"
        >
          <Eye size={15} />
          View
        </button>

        <button
          onClick={() => onEdit(subject)}
          className="h-10 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600"
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          onClick={() => onDelete(subject.id)}
          className="h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center gap-1.5 text-sm font-medium text-red-600"
        >
          <Trash2 size={15} />
          Delete
        </button>

      </div>

    </div>
  );
}
