import { Users, GraduationCap, Layers3, NotebookPen } from "lucide-react";

import useStudents from "../../hooks/useStudents";
import useTeachers from "../../hooks/useTeachers";
import useBatches from "../../hooks/useBatches";
import useNotes from "../../hooks/useNotes";

const CARDS = [
  {
    key: "students",
    label: "Total Students",
    icon: Users,
    accent: "from-cyan-500 to-blue-600",
  },
  {
    key: "teachers",
    label: "Total Teachers",
    icon: GraduationCap,
    accent: "from-[#008388] to-cyan-500",
  },
  {
    key: "batches",
    label: "Active Batches",
    icon: Layers3,
    accent: "from-blue-500 to-indigo-600",
  },
  {
    key: "notes",
    label: "Notes Uploaded",
    icon: NotebookPen,
    accent: "from-teal-500 to-emerald-500",
  },
];

export default function StatsRow() {
  const { students } = useStudents();
  const { teachers } = useTeachers();
  const { batches } = useBatches();
  const { notes } = useNotes();

  const counts = {
    students: students.length,
    teachers: teachers.length,
    batches: batches.length,
    notes: notes.length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {CARDS.map(({ key, label, icon: Icon, accent }) => (
        <div
          key={key}
          className="
            rounded-[28px]
            bg-white
            border border-slate-100
            shadow-[0_10px_30px_rgba(15,23,42,0.05)]
            p-6
            flex items-center gap-4
          "
        >
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-md shrink-0`}
          >
            <Icon size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-2xl font-extrabold text-slate-800">
              {counts[key]}
            </p>
            <p className="text-sm text-slate-500 truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
