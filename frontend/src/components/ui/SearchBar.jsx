import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="relative w-full">

      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          pl-12
          pr-4
          py-3.5
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
          outline-none
          transition-all
          duration-200
          focus:border-[#008388]
          focus:ring-4
          focus:ring-[#008388]/10
        "
      />

    </div>
  );
}