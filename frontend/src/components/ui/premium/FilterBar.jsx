import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
} from "lucide-react";

import AnimatedButton from "./AnimatedButton";

export default function FilterBar({
  search = "",
  onSearchChange,
  searchPlaceholder = "Search...",

  filters = null,

  sortOptions = [],

  selectedSort = "",

  onSortChange,

  onFilterClick,

  onExport,

  children,
}) {
  return (
    <div
      className="
        bg-white/70
        backdrop-blur-xl
        border
        border-white/60
        rounded-[24px]
        shadow-sm
        p-4
        flex
        flex-wrap
        items-center
        justify-between
        gap-4
      "
    >
      {/* Left */}

      <div className="flex flex-wrap items-center gap-3 flex-1">

        {/* Search */}

        <div className="relative min-w-[280px] flex-1 max-w-md">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              pl-11
              pr-4
              py-3
              outline-none
              transition
              focus:border-[#008388]
              focus:ring-4
              focus:ring-[#008388]/10
            "
          />

        </div>

        {/* Custom Filters */}

        {filters}

        {/* Extra Components */}

        {children}

      </div>

      {/* Right */}

      <div className="flex flex-wrap items-center gap-3">

        {/* Sort */}

        {sortOptions.length > 0 && (
          <div className="relative">

            <ArrowUpDown
              size={16}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <select
              value={selectedSort}
              onChange={onSortChange}
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                pl-10
                pr-10
                py-3
                outline-none
                focus:border-[#008388]
              "
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

          </div>
        )}

        {/* Filter Button */}

        {onFilterClick && (
          <AnimatedButton
            variant="secondary"
            onClick={onFilterClick}
          >
            <SlidersHorizontal size={18} />

            <span>Filters</span>

          </AnimatedButton>
        )}

        {/* Export */}

        {onExport && (
          <AnimatedButton
            variant="secondary"
            onClick={onExport}
          >
            <Download size={18} />

            <span>Export</span>

          </AnimatedButton>
        )}

      </div>

    </div>
  );
}