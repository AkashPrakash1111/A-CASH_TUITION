import { GraduationCap, Eye, Pencil, Trash2 } from "lucide-react";

import { getOccupancy } from "./occupancy";
import { getClassColor } from "./classColor";
import WeekStrip from "./WeekStrip";
import { getSubjectVisual } from "../subjects/subjectVisuals";
import TeacherAvatar from "../teachers/TeacherAvatar";

export default function BatchCard({ batch, onView, onEdit, onDelete }) {
  const isActive = batch.status === "Active";

  const { capacity, enrolled, pct, barColor, textColor } = getOccupancy(batch);

  const { icon: SubjectIcon, color: subjectColor } = getSubjectVisual(batch.subject);

  const classColor = getClassColor(batch.className);

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

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${subjectColor}`}>
          <SubjectIcon size={24} />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-800 truncate">
              {batch.batchName}
            </h3>

            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isActive ? "bg-green-500" : "bg-slate-300"
              }`}
              title={batch.status}
            />
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">

            {batch.className && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${classColor.badge}`}>
                <GraduationCap size={12} />
                {batch.className}
              </span>
            )}

            {pct >= 100 && (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                Full
              </span>
            )}

          </div>

        </div>

      </div>

      {/* Subject + Teacher */}

      <div className="mt-5 space-y-2.5">

        {batch.subject && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SubjectIcon size={14} className="shrink-0" />
            <span className="truncate">{batch.subject}</span>
          </div>
        )}

        {batch.teacher && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TeacherAvatar name={batch.teacher} size="w-6 h-6" textSize="text-[9px]" />
            <span className="truncate">{batch.teacher}</span>
          </div>
        )}

        {batch.time && (
          <div className="flex items-center justify-between gap-3">
            <WeekStrip days={batch.days} />
            <span className="text-xs font-medium text-gray-400 shrink-0">
              {batch.time}
            </span>
          </div>
        )}

      </div>

      <div className="flex-1" />

      {/* Occupancy */}

      <div className="mt-5 pt-5 border-t border-slate-100">

        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-medium text-slate-600">
            Occupancy
          </span>
          <span className={`font-bold ${textColor}`}>
            {enrolled}/{capacity || "--"}
          </span>
        </div>

        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

      </div>

      {/* Actions */}

      <div className="grid grid-cols-3 gap-2 mt-5">

        <button
          onClick={() => onView(batch)}
          className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600"
        >
          <Eye size={15} />
          View
        </button>

        <button
          onClick={() => onEdit(batch)}
          className="h-10 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600"
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          onClick={() => onDelete(batch.id)}
          className="h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center gap-1.5 text-sm font-medium text-red-600"
        >
          <Trash2 size={15} />
          Delete
        </button>

      </div>

    </div>
  );
}
