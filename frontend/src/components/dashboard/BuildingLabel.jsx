import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function BuildingLabel({
  title,
  subtitle,
  icon: Icon,
  route,
  top,
  left,
}) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        top,
        left,
      }}
      className="
        absolute
        z-40
        -translate-x-1/2
        -translate-y-1/2
        group
      "
    >
      {/* Connector */}

      <div
        className="
          absolute
          left-1/2
          top-full
          -translate-x-1/2

          h-6
          w-[2px]

          bg-gradient-to-b
          from-cyan-300
          to-transparent
        "
      />

      {/* Label */}

      <button
        onClick={() => navigate(route)}
        className="
          flex
          items-center
          gap-3

          rounded-full

          border
          border-white/70

          bg-white/88
          backdrop-blur-xl

          px-4
          py-2

          shadow-xl

          transition-all
          duration-300

          hover:scale-105
          hover:bg-white
          hover:shadow-2xl
        "
      >
        {/* Icon */}

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center

            rounded-full

            bg-cyan-100

            transition-all
            duration-300

            group-hover:bg-[#008388]
          "
        >
          <Icon
            size={18}
            className="
              text-[#008388]
              transition-all
              duration-300
              group-hover:text-white
            "
          />
        </div>

        {/* Text */}

        <div className="text-left leading-tight">
          <h3
            className="
              text-[13px]
              font-semibold
              text-slate-800
            "
          >
            {title}
          </h3>

          <p
            className="
              text-[11px]
              text-slate-500
            "
          >
            {subtitle}
          </p>
        </div>

        {/* Arrow */}

        <ChevronRight
          size={16}
          className="
            text-slate-400

            opacity-0

            transition-all
            duration-300

            group-hover:translate-x-1
            group-hover:opacity-100
          "
        />

        {/* Status Dot */}

        <div
          className="
            h-2.5
            w-2.5

            rounded-full

            bg-emerald-400

            shadow-[0_0_10px_rgba(52,211,153,0.8)]
          "
        />
      </button>
    </div>
  );
}