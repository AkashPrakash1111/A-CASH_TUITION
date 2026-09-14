import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  // Keep the page number list short even when there are many pages.
  const pageNumbers = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      pageNumbers.push(p);
    } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
      pageNumbers.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between mt-5 text-sm">
      <p className="text-slate-500">
        Showing {start} to {end} of {totalItems} students
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:border-[#008388] hover:text-[#008388] transition"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                p === page
                  ? "bg-[#008388] text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:border-[#008388] hover:text-[#008388] transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
