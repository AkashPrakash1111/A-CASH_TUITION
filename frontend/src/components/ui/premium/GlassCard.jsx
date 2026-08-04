import React from "react";

export default function GlassCard({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        relative
        overflow-hidden

        rounded-[32px]

        border
        border-white/40

        bg-white/70

        backdrop-blur-xl

        shadow-[0_20px_60px_rgba(15,23,42,0.08)]

        transition-all
        duration-300

        hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)]

        ${className}
      `}
    >
      {/* Glow */}

      <div
        className="
          absolute
          top-0
          left-0
          right-0

          h-24

          bg-gradient-to-r
          from-cyan-100/60
          via-transparent
          to-blue-100/60

          pointer-events-none
        "
      />

      {/* Content */}

      <div className="relative z-10 p-6">

        {children}

      </div>

    </div>
  );
}