import { X } from "lucide-react";

export default function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  size = "lg",
  children,
  footer,
}) {
  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        backdrop-blur-sm
        p-6
      "
    >
      <div
        className={`
          w-full
          ${sizes[size]}
          rounded-[32px]
          bg-white
          shadow-2xl
          overflow-hidden
          animate-in
          zoom-in-95
          duration-200
        `}
      >
        {/* Header */}

        <div className="flex items-start justify-between px-8 py-6 border-b border-slate-100">

          <div>

            <h2 className="text-2xl font-bold text-slate-800">
              {title}
            </h2>

            {subtitle && (
              <p className="text-slate-500 mt-2">
                {subtitle}
              </p>
            )}

          </div>

          <button
            onClick={onClose}
            className="
              w-11
              h-11
              rounded-xl
              hover:bg-slate-100
              transition
              flex
              items-center
              justify-center
            "
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}

        <div className="p-8 max-h-[70vh] overflow-y-auto">

          {children}

        </div>

        {/* Footer */}

        {footer && (
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50">

            {footer}

          </div>
        )}
      </div>
    </div>
  );
}