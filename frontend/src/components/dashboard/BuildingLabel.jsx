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
        aria-label={`${title} — ${subtitle}`}
        title={`${title} — ${subtitle}`}
        style={{ fontSize: "clamp(9px, 1.2cqw, 13px)" }}
        className="
          flex
          items-center
          gap-[0.8em]
          whitespace-nowrap

          rounded-full

          border
          border-white/70

          bg-white/88
          backdrop-blur-xl

          px-[1.1em]
          py-[0.55em]

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
            h-[2.6em]
            w-[2.6em]
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
            size="1.4em"
            className="
              text-[#008388]
              transition-all
              duration-300
              group-hover:text-white
            "
          />
        </div>

        {/* Text */}

        <div className="text-left leading-tight hidden @min-[430px]:block">
          <h3
            className="
              text-[1em]
              font-semibold
              text-slate-800
            "
          >
            {title}
          </h3>

          <p
            className="
              text-[0.85em]
              text-slate-500
              hidden
              @min-[560px]:block
            "
          >
            {subtitle}
          </p>
        </div>

        {/* Arrow */}

        <ChevronRight
          size="1.2em"
          className="
            hidden
            @min-[560px]:block
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
            h-[0.7em]
            w-[0.7em]
            shrink-0

            rounded-full

            bg-emerald-400

            shadow-[0_0_10px_rgba(52,211,153,0.8)]
          "
        />
      </button>
    </div>
  );
}