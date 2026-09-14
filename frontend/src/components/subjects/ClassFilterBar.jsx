import { LayoutGrid } from "lucide-react";

export default function ClassFilterBar({
  classes = [],
  selectedClass,
  onSelectClass,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">

      <button
        onClick={() => onSelectClass("")}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border transition
          ${
            !selectedClass
              ? "bg-[#008388] text-white border-[#008388] shadow-md"
              : "bg-white text-slate-600 border-slate-200 hover:border-[#008388]"
          }
        `}
      >
        <LayoutGrid size={16} />
        All Classes
      </button>

      {classes.map((className) => {
        const active = selectedClass === className;

        return (
          <button
            key={className}
            onClick={() => onSelectClass(active ? "" : className)}
            className={`
              px-4 py-2.5 rounded-2xl text-sm font-semibold border transition
              ${
                active
                  ? "bg-[#008388] text-white border-[#008388] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#008388]"
              }
            `}
          >
            {className}
          </button>
        );
      })}

    </div>
  );
}
