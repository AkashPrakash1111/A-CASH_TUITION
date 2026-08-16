import { FolderOpen, Plus } from "lucide-react";
import AnimatedButton from "./AnimatedButton";

export default function EmptyState({
  title = "Nothing Here Yet",
  description = "Content will appear here once you add it.",
  illustration = null,
  actionLabel,
  onAction,
}) {
  return (
    <div
      className="
        w-full
        rounded-[32px]
        border
        border-dashed
        border-slate-200
        bg-gradient-to-br
        from-white
        to-slate-50
        p-12
        flex
        flex-col
        items-center
        justify-center
        text-center
      "
    >
      {/* Illustration */}

      {illustration ? (
        <img
          src={illustration}
          alt={title}
          className="w-48 h-48 object-contain mb-6"
        />
      ) : (
        <div
          className="
            w-28
            h-28
            rounded-full
            bg-cyan-50
            flex
            items-center
            justify-center
            shadow-sm
            mb-6
          "
        >
          <FolderOpen
            size={56}
            className="text-[#008388]"
          />
        </div>
      )}

      {/* Title */}

      <h2 className="text-2xl font-bold text-slate-800">
        {title}
      </h2>

      {/* Description */}

      <p
        className="
          mt-3
          max-w-md
          text-slate-500
          leading-7
        "
      >
        {description}
      </p>

      {/* Button */}

      {actionLabel && onAction && (
        <div className="mt-8">
          <AnimatedButton onClick={onAction}>
            <Plus size={18} />

            <span>{actionLabel}</span>
          </AnimatedButton>
        </div>
      )}
    </div>
  );
}