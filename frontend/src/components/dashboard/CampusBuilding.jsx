import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function CampusBuilding({
  title,
  subtitle,
  icon: Icon,
  gradient,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="
        group
        cursor-pointer
        relative
        overflow-hidden
        rounded-[28px]
        bg-white
        border
        border-gray-200
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-2xl
      "
    >
      <div
        className={`
          absolute
          inset-0
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-300
          bg-gradient-to-br
          ${gradient}
        `}
      />

      <div className="relative z-10">

        <div
          className="
            w-16
            h-16
            rounded-2xl
            bg-white
            shadow-md
            flex
            items-center
            justify-center
            mb-6
        "
        >
          {Icon && (
            <Icon
              size={34}
              className="text-[#008388]"
            />
          )}
        </div>

        <h3 className="text-2xl font-bold">
          {title}
        </h3>

        <p className="text-gray-500 mt-2">
          {subtitle}
        </p>

        <div className="mt-8 flex items-center text-[#008388] font-semibold">

          Open Module

          <ArrowUpRight
            className="
              ml-2
              transition-transform
              group-hover:translate-x-1
              group-hover:-translate-y-1
            "
            size={18}
          />

        </div>

      </div>

    </div>
  );
}