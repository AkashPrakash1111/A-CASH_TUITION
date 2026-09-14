import { History, Trash2 } from "lucide-react";

export default function HistoryStrip({ history, onSelect, onClear }) {
  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm mt-6 p-6">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-slate-400" />
          <h3 className="font-bold text-slate-800 text-sm">
            Recent Generations
          </h3>
        </div>

        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
        >
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry) => {
          const preview = Object.values(entry.inputs).filter(Boolean).join(" · ");

          return (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 transition"
            >
              <p className="text-sm font-medium text-slate-700 truncate">
                {preview || "Untitled"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {entry.createdAt}
              </p>
            </button>
          );
        })}
      </div>

    </div>
  );
}
