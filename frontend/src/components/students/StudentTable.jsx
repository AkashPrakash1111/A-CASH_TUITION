import { Pencil, Trash2, Users } from "lucide-react";
import { getMascotFor } from "./mascotAvatars";

export default function StudentTable({ students, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.05)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Student
            </th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Class
            </th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Batch
            </th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Phone
            </th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Status
            </th>
            <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-16">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Users size={32} strokeWidth={1.5} />
                  <p className="font-medium">No students match your filters</p>
                  <p className="text-sm">Try adjusting the search or filters above.</p>
                </div>
              </td>
            </tr>
          ) : (
            students.map((student) => {
              const mascot = getMascotFor(student.name);

              return (
                <tr
                  key={student.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-[#008388]/[0.03] transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ backgroundColor: mascot.bg }}
                      >
                        <img src={mascot.image} alt="" className="w-9 h-9 object-contain" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{student.name}</p>
                        {student.parent && (
                          <p className="text-xs text-slate-400">Parent: {student.parent}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                      Class {student.className}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                      {student.batch}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-600 text-sm">{student.phone}</td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          student.status === "Active" ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <span className={student.status === "Active" ? "text-emerald-600" : "text-slate-400"}>
                        {student.status}
                      </span>
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(student)}
                        title="Edit student"
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-[#008388] hover:text-[#008388] transition"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => onDelete(student.id)}
                        title="Delete student"
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-rose-400 hover:text-rose-500 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
