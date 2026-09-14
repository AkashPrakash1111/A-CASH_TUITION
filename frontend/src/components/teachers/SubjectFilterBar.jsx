import { LayoutGrid } from "lucide-react";

export default function SubjectFilterBar({
  subjects = [],
  selectedSubject,
  onSelectSubject,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">

      <button
        onClick={() => onSelectSubject("")}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border transition
          ${
            !selectedSubject
              ? "bg-[#008388] text-white border-[#008388] shadow-md"
              : "bg-white text-slate-600 border-slate-200 hover:border-[#008388]"
          }
        `}
      >
        <LayoutGrid size={16} />
        All Subjects
      </button>

      {subjects.map((subject) => {
        const active = selectedSubject === subject;

        return (
          <button
            key={subject}
            onClick={() => onSelectSubject(active ? "" : subject)}
            className={`
              px-4 py-2.5 rounded-2xl text-sm font-semibold border transition
              ${
                active
                  ? "bg-[#008388] text-white border-[#008388] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#008388]"
              }
            `}
          >
            {subject}
          </button>
        );
      })}

    </div>
  );
}
