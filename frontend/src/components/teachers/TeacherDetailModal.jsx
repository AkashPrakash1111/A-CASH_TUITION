import { X, Mail, Phone, GraduationCap, BadgeCheck, Layers3, Users, Clock } from "lucide-react";

import TeacherAvatar from "./TeacherAvatar";

export default function TeacherDetailModal({
  isOpen,
  onClose,
  teacher,
  batches = [],
}) {
  if (!isOpen || !teacher) return null;

  const isActive = teacher.status === "Active";

  const totalStudents = batches.reduce(
    (sum, b) => sum + (parseInt(b.enrolled) || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-4">
            <TeacherAvatar name={teacher.name} size="w-20 h-20" textSize="text-2xl" />

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {teacher.name}
              </h2>

              <div className="flex items-center gap-2 mt-1.5">
                {teacher.subject && (
                  <span className="px-3 py-1 rounded-full bg-[#EAF8F8] text-[#008388] text-xs font-semibold">
                    {teacher.subject}
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
                  {teacher.status}
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

        {/* Contact + Quick stats */}

        <div className="grid grid-cols-2 gap-4 mt-8">

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">

            {teacher.email && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Mail size={15} className="text-slate-400 shrink-0" />
                <span className="truncate">{teacher.email}</span>
              </div>
            )}

            {teacher.phone && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Phone size={15} className="text-slate-400 shrink-0" />
                <span>{teacher.phone}</span>
              </div>
            )}

            {teacher.qualification && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <GraduationCap size={15} className="text-slate-400 shrink-0" />
                <span className="truncate">{teacher.qualification}</span>
              </div>
            )}

            {teacher.created_at && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Clock size={15} className="text-slate-400 shrink-0" />
                <span>
                  Joined {new Date(teacher.created_at).toLocaleDateString()}
                </span>
              </div>
            )}

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

        {/* Assigned batches */}

        <div className="mt-8">

          <h3 className="font-bold text-slate-800 mb-4">
            Assigned Batches
          </h3>

          {batches.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-6 text-center text-sm text-gray-400">
              No batches assigned to this teacher yet.
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
                      {batch.className} · {batch.subject}
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
