import { X, Calendar, Clock, GraduationCap, BadgeCheck, Phone } from "lucide-react";

import { getOccupancy } from "./occupancy";
import { getSubjectVisual } from "../subjects/subjectVisuals";
import TeacherAvatar from "../teachers/TeacherAvatar";

export default function BatchDetailModal({
  isOpen,
  onClose,
  batch,
  students = [],
}) {
  if (!isOpen || !batch) return null;

  const isActive = batch.status === "Active";

  const { capacity, enrolled, pct, barColor, textColor } = getOccupancy(batch);

  const { icon: SubjectIcon, color: subjectColor } = getSubjectVisual(batch.subject);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-4">

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${subjectColor}`}>
              <SubjectIcon size={26} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {batch.batchName}
              </h2>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {batch.className && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  <GraduationCap size={12} />
                  {batch.className}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                <BadgeCheck size={12} />
                {batch.status}
              </span>
              </div>
            </div>

          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center shrink-0"
          >
            <X size={20} />
          </button>

        </div>

        {/* Info grid */}

        <div className="grid grid-cols-2 gap-4 mt-6">

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">

            {batch.subject && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <SubjectIcon size={15} className="text-slate-400 shrink-0" />
                <span className="truncate">{batch.subject}</span>
              </div>
            )}

            {batch.teacher && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <TeacherAvatar name={batch.teacher} size="w-6 h-6" textSize="text-[9px]" />
                <span className="truncate">{batch.teacher}</span>
              </div>
            )}

            {batch.days && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Calendar size={15} className="text-slate-400 shrink-0" />
                <span>{batch.days}</span>
              </div>
            )}

            {batch.time && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Clock size={15} className="text-slate-400 shrink-0" />
                <span>{batch.time}</span>
              </div>
            )}

          </div>

          <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-slate-600">Occupancy</span>
              <span className={`font-bold ${textColor}`}>
                {enrolled}/{capacity || "--"}
              </span>
            </div>

            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {pct}% of seats filled
            </p>
          </div>

        </div>

        {/* Enrolled students */}

        <div className="mt-8">

          <h3 className="font-bold text-slate-800 mb-4">
            Enrolled Students ({students.length})
          </h3>

          {students.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-6 text-center text-sm text-gray-400">
              No students enrolled in this batch yet.
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF8F8] text-[#008388] flex items-center justify-center text-xs font-bold shrink-0">
                      {student.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-700 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {student.className}
                      </p>
                    </div>
                  </div>

                  {student.phone && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0 ml-3">
                      <Phone size={12} />
                      {student.phone}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
