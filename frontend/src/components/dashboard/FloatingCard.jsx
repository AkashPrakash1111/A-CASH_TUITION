import React from "react";

export default function FloatingCard({
  title,
  subtitle,
  icon: Icon,
  className = "",
}) {
  return (
    <div
      className={`
        bg-white/90
        backdrop-blur-xl
        rounded-3xl
        px-6
        py-5
        shadow-xl
        border
        border-white/70
        flex
        items-center
        gap-4
        hover:scale-105
        transition-all
        duration-300
        ${className}
      `}
    >
      {Icon && (
        <div
          className="
            w-14
            h-14
            rounded-2xl
            bg-[#008388]
            flex
            items-center
            justify-center
            text-white
            shadow-lg
          "
        >
          <Icon size={28} />
        </div>
      )}

      <div>

        <h3 className="font-bold text-gray-800 text-lg">
          {title}
        </h3>

        <p className="text-gray-500 text-sm mt-1">
          {subtitle}
        </p>

      </div>

    </div>
  );
}