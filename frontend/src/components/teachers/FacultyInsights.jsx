import { Sparkles, Users, UserCheck, Layers3, Download, Clock } from "lucide-react";

const BAR_COLORS = [
  "bg-[#008388]",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

function timeAgo(dateString) {
  if (!dateString) return "";

  const then = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export default function FacultyInsights({
  teachers = [],
  totalBatchesAssigned = 0,
  onExportCsv,
}) {
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === "Active").length;
  const activePct = totalTeachers
    ? Math.round((activeTeachers / totalTeachers) * 100)
    : 0;

  const subjectCounts = teachers.reduce((acc, t) => {
    const key = t.subject || "Unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topSubjects = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxSubjectCount = topSubjects[0]?.[1] || 1;

  const recentTeachers = [...teachers]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-[#008388]" />
        <h2 className="text-lg font-bold text-slate-800">
          Faculty Insights
        </h2>
      </div>

      {/* Stat cards */}

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 space-y-5">

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF8F8] text-[#008388] flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {totalTeachers}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total Teachers</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {activeTeachers}
              <span className="text-sm font-medium text-gray-400 ml-1">
                / {totalTeachers}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Active · {activePct}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers3 size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {totalBatchesAssigned}
            </p>
            <p className="text-xs text-gray-400 mt-1">Batches Assigned</p>
          </div>
        </div>

      </div>

      {/* Subject distribution */}

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">

        <h3 className="font-bold text-slate-800 mb-4">
          Subject Distribution
        </h3>

        {topSubjects.length === 0 ? (
          <p className="text-sm text-gray-400">No teachers yet.</p>
        ) : (
          <div className="space-y-4">
            {topSubjects.map(([subject, count], index) => (
              <div key={subject}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-600 truncate">
                    {subject}
                  </span>
                  <span className="text-gray-400 shrink-0 ml-2">
                    {count}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`}
                    style={{ width: `${(count / maxSubjectCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Recently added */}

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">

        <h3 className="font-bold text-slate-800 mb-4">
          Recently Added
        </h3>

        {recentTeachers.length === 0 ? (
          <p className="text-sm text-gray-400">No teachers yet.</p>
        ) : (
          <div className="space-y-4">
            {recentTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EAF8F8] text-[#008388] flex items-center justify-center text-xs font-bold shrink-0">
                  {teacher.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {teacher.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {teacher.subject || "Unassigned"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <Clock size={12} />
                  {timeAgo(teacher.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Export */}

      <button
        onClick={onExportCsv}
        className="w-full rounded-[28px] bg-gradient-to-r from-[#008388] to-cyan-500 text-white p-5 flex items-center justify-between shadow-lg hover:shadow-xl transition"
      >
        <div className="text-left">
          <p className="font-bold">Export Faculty List</p>
          <p className="text-xs text-white/80 mt-0.5">
            Download as CSV
          </p>
        </div>
        <Download size={20} />
      </button>

    </div>
  );
}
