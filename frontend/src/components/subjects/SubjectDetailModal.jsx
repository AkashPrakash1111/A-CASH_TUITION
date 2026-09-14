import { X, User, GraduationCap, BadgeCheck, Layers3, Users } from "lucide-react";

import { getSubjectVisual } from "./subjectVisuals";

export default function SubjectDetailModal({
  isOpen,
  onClose,
  subject,
  batches = [],
}) {
  if (!isOpen || !subject) return null;

  const { icon: Icon, color } = getSubjectVisual(subject.name);

  const isActive = subject.status === "Active";

  const totalStudents = batches.reduce(
    (sum, b) => sum + (parseInt(b.enrolled) || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {subject.name}
              </h2>

              <div className="flex items-center gap-2 mt-1.5">
                {subject.className && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    <GraduationCap size={12} />
                    {subject.className}
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
                  {subject.status}
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

        {/* Description */}

        {subject.description && (
          <p className="mt-6 text-sm text-gray-500 bg-slate-50 rounded-2xl p-4">
            {subject.description}
          </p>
        )}

        {/* Teacher + Quick stats */}

        <div className="grid grid-cols-2 gap-4 mt-6">

          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <User size={18} className="text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Lead Teacher</p>
              <p className="text-sm font-semibold text-slate-700 truncate">
                {subject.teacher || "Not assigned"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Layers3 size={20} className="text-blue-600 mb-2" />
              <p className="text-xl font-bold text-slate-800">
                {batches.length}
              </p>
              <p className="text-xs text-gray-400">Batches</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Users size={20} className="text-amber-600 mb-2" />
              <p className="text-xl font-bold text-slate-800">
                {totalStudents}
              </p>
              <p className="text-xs text-gray-400">Students</p>
            </div>

          </div>

        </div>

        {/* Batches offering this subject */}

        <div className="mt-8">

          <h3 className="font-bold text-slate-800 mb-4">
            Batches Offering This Subject
          </h3>

          {batches.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-6 text-center text-sm text-gray-400">
              No batches are teaching this subject yet.
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-700 truncate">
                      {batch.batchName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {batch.className}
                      {batch.teacher ? ` · ${batch.teacher}` : ""}
                      {batch.days ? ` · ${batch.days}` : ""}
                      {batch.time ? ` · ${batch.time}` : ""}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 shrink-0 ml-3">
                    {batch.enrolled || 0}/{batch.capacity || "--"}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
