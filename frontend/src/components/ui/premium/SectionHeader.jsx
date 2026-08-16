import { ChevronRight } from "lucide-react";
import AnimatedButton from "./AnimatedButton";

export default function SectionHeader({
  title,
  subtitle,
  breadcrumb = [],
  primaryAction,
  secondaryAction,
  children,
}) {
  return (
    <div
      className="
        bg-white/70
        backdrop-blur-xl
        border
        border-white/60
        rounded-[32px]
        shadow-[0_15px_45px_rgba(15,23,42,0.08)]
        p-8
        mb-8
      "
    >
      {/* Breadcrumb */}

      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">

          {breadcrumb.map((item, index) => (
            <div key={index} className="flex items-center gap-2">

              <span>{item}</span>

              {index !== breadcrumb.length - 1 && (
                <ChevronRight size={16} />
              )}

            </div>
          ))}

        </div>
      )}

      {/* Main Row */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        {/* Left */}

        <div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-800">

            {title}

          </h1>

          {subtitle && (
            <p className="text-slate-500 mt-2 text-lg">

              {subtitle}

            </p>
          )}

        </div>

        {/* Right */}

        <div className="flex flex-wrap items-center gap-3">

          {children}

          {secondaryAction && (
            <AnimatedButton
              variant="secondary"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </AnimatedButton>
          )}

          {primaryAction && (
            <AnimatedButton
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </AnimatedButton>
          )}

        </div>

      </div>
    </div>
  );
}