import {
  Mail,
  Phone,
  GraduationCap,
  Layers3,
  Users,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import TeacherAvatar from "./TeacherAvatar";

export default function TeacherCard({
  teacher,
  classesCount = 0,
  studentsCount = 0,
  onView,
  onEdit,
  onDelete,
}) {
  const isActive = teacher.status === "Active";

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

        <div className="relative">
          <TeacherAvatar name={teacher.name} />

          <span
            className={`
              absolute
              -bottom-1
              -right-1
              w-4
              h-4
              rounded-full
              border-2
              border-white
              ${isActive ? "bg-green-500" : "bg-slate-300"}
            `}
            title={teacher.status}
          />
        </div>

        <div className="min-w-0 flex-1">

          <h3 className="font-bold text-lg text-slate-800 truncate">
            {teacher.name}
          </h3>

          {teacher.subject && (
            <span className="inline-block mt-1.5 px-3 py-1 rounded-full bg-[#EAF8F8] text-[#008388] text-xs font-semibold">
              {teacher.subject}
            </span>
          )}

        </div>

      </div>

      {/* Contact */}

      <div className="mt-5 space-y-2">

        {teacher.email && (
          <div className="flex items-center gap-2 text-sm text-gray-500 truncate">
            <Mail size={14} className="shrink-0" />
            <span className="truncate">{teacher.email}</span>
          </div>
        )}

        {teacher.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Phone size={14} className="shrink-0" />
            <span>{teacher.phone}</span>
          </div>
        )}

        {teacher.qualification && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <GraduationCap size={14} className="shrink-0" />
            <span className="truncate">
              {teacher.qualification}
              {teacher.experience ? ` · ${teacher.experience}` : ""}
            </span>
          </div>
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
              {classesCount}
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
          onClick={() => onView(teacher)}
          className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600"
        >
          <Eye size={15} />
          View
        </button>

        <button
          onClick={() => onEdit(teacher)}
          className="h-10 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600"
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          onClick={() => onDelete(teacher.id)}
          className="h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center gap-1.5 text-sm font-medium text-red-600"
        >
          <Trash2 size={15} />
          Delete
        </button>

      </div>

    </div>
  );
}
