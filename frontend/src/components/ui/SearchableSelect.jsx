import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, X, Search, Plus } from "lucide-react";

export default function SearchableSelect({
  label,
  options = [],
  value = "",
  onChange,
  placeholder = "Select or type...",
  error,
  disabled = false,
  required = false,
  allowCustom = true,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to uniform array of { value, label }
  const normalizedOptions = useMemo(() => {
    return (options || []).map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      if (opt && typeof opt === "object") {
        const val = opt.value ?? opt.id ?? opt.name ?? opt.subjectName ?? opt.batchName ?? "";
        const lbl = opt.label ?? opt.name ?? opt.subjectName ?? opt.batchName ?? String(val);
        return { value: String(val), label: String(lbl) };
      }
      return { value: String(opt), label: String(opt) };
    });
  }, [options]);

  // Selected item label (supports custom typed value if not in options)
  const selectedOption = useMemo(() => {
    if (!value) return null;
    const found = normalizedOptions.find((opt) => String(opt.value).toLowerCase() === String(value).toLowerCase());
    if (found) return found;
    return { value: String(value), label: String(value) };
  }, [normalizedOptions, value]);

  // Filtered options based on search input
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const term = searchTerm.toLowerCase();
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(term) || opt.value.toLowerCase().includes(term)
    );
  }, [normalizedOptions, searchTerm]);

  // Check if search term already exactly matches an option
  const exactMatch = useMemo(() => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    return normalizedOptions.some((opt) => opt.label.toLowerCase() === term || opt.value.toLowerCase() === term);
  }, [normalizedOptions, searchTerm]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optValue) => {
    onChange?.(optValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setSearchTerm("");
  };

  const handleCustomAdd = () => {
    if (searchTerm.trim()) {
      handleSelect(searchTerm.trim());
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block mb-1.5 text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Selector trigger */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          } else if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={`w-full min-h-[42px] px-3.5 py-2 rounded-2xl bg-white border flex items-center justify-between gap-2 cursor-pointer transition text-xs select-none shadow-sm ${
          disabled
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            : isOpen
            ? "border-[#008388] ring-2 ring-[#008388]/20"
            : error
            ? "border-rose-300 hover:border-rose-400"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex-1 truncate">
          {selectedOption ? (
            <span className="font-semibold text-slate-800">{selectedOption.label}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-slate-100 hover:text-slate-600 transition"
              title="Clear selection"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-[#008388]" : ""}`}
          />
        </div>
      </div>

      {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search / Type bar inside dropdown */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search or type to add..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#008388] focus:ring-1 focus:ring-[#008388]"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (filteredOptions.length > 0 && exactMatch) {
                      handleSelect(filteredOptions[0].value);
                    } else if (allowCustom && searchTerm.trim()) {
                      handleCustomAdd();
                    } else if (filteredOptions.length > 0) {
                      handleSelect(filteredOptions[0].value);
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
            {/* Allow adding custom typed option */}
            {allowCustom && searchTerm.trim() && !exactMatch && (
              <button
                type="button"
                onClick={handleCustomAdd}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition font-semibold text-[#008388] bg-[#008388]/5 hover:bg-[#008388]/10"
              >
                <Plus size={14} />
                <span>Use &ldquo;{searchTerm.trim()}&rdquo;</span>
              </button>
            )}

            {filteredOptions.length === 0 && (!allowCustom || !searchTerm.trim()) ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value).toLowerCase() === String(value).toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition font-medium ${
                      isSelected
                        ? "bg-[#008388]/10 text-[#008388] font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="text-[#008388] shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
