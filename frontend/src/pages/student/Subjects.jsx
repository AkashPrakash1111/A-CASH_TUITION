import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Sparkles,
  Layers,
  GraduationCap,
  FileText,
  ClipboardList,
  Search,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { subjectsApi, notesApi, assignmentsApi } from "../../services/api";

const SUBJECT_THEMES = [
  { bg: "from-blue-500 to-cyan-500", light: "bg-blue-50 text-blue-700", border: "border-blue-100" },
  { bg: "from-purple-500 to-indigo-500", light: "bg-purple-50 text-purple-700", border: "border-purple-100" },
  { bg: "from-emerald-500 to-teal-500", light: "bg-emerald-50 text-emerald-700", border: "border-emerald-100" },
  { bg: "from-amber-500 to-orange-500", light: "bg-amber-50 text-amber-700", border: "border-amber-100" },
  { bg: "from-rose-500 to-pink-500", light: "bg-rose-50 text-rose-700", border: "border-rose-100" },
];

export default function StudentSubjects() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [notesCount, setNotesCount] = useState({});
  const [assignmentsCount, setAssignmentsCount] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [subs, notes, assignments] = await Promise.allSettled([
          subjectsApi.list(token),
          notesApi.list(token),
          assignmentsApi.list(token),
        ]);

        if (subs.status === "fulfilled" && Array.isArray(subs.value)) {
          setSubjects(subs.value);
        }

        if (notes.status === "fulfilled" && Array.isArray(notes.value)) {
          const countMap = {};
          notes.value.forEach((n) => {
            const sName = n.subject_name || n.subject;
            if (sName) countMap[sName] = (countMap[sName] || 0) + 1;
          });
          setNotesCount(countMap);
        }

        if (assignments.status === "fulfilled" && Array.isArray(assignments.value)) {
          const aMap = {};
          assignments.value.forEach((a) => {
            const sName = a.subject_name || a.subject;
            if (sName) aMap[sName] = (aMap[sName] || 0) + 1;
          });
          setAssignmentsCount(aMap);
        }
      } catch (err) {
        console.error("Failed loading subjects", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const filtered = subjects.filter((s) => {
    const name = s.subject_name || s.name || "";
    const code = s.code || "";
    return name.toLowerCase().includes(search.toLowerCase()) || code.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles size={14} /> Knowledge Realms
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Curriculum Subjects</h1>
          <p className="text-slate-500 text-sm mt-1">
            Master each scientific, mathematical, and literary realm through comprehensive study materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition w-64"
            />
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((subject, idx) => {
          const theme = SUBJECT_THEMES[idx % SUBJECT_THEMES.length];
          const name = subject.subject_name || subject.name || "Subject";
          const totalNotes = notesCount[name] || 0;
          const totalAssignments = assignmentsCount[name] || 0;

          return (
            <div
              key={subject.id || idx}
              className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.bg} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition`}>
                    <BookOpen size={22} />
                  </div>
                  {subject.code && (
                    <span className="text-[11px] font-bold tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {subject.code}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mt-4">{name}</h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {subject.description || "Core curriculum subject designed to build deep conceptual clarity and practical problem solving."}
                </p>

                {/* Metrics */}
                <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileText size={15} className="text-blue-500" />
                    <span><strong>{totalNotes}</strong> Notes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <ClipboardList size={15} className="text-emerald-500" />
                    <span><strong>{totalAssignments}</strong> Quests</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to="/student/notes"
                  className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs text-center transition"
                >
                  Notes
                </Link>
                <Link
                  to="/student/assignments"
                  className="flex-1 py-2.5 rounded-xl bg-[#008388] hover:bg-[#006b6f] text-white font-semibold text-xs text-center transition shadow-sm"
                >
                  Assignments
                </Link>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-slate-400">
            <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-sm">No subjects found matching "{search}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
