import { Loader2 } from "lucide-react";

const variants = {
  primary: `
    bg-[#008388]
    text-white
    hover:bg-[#006d71]
    shadow-lg
    hover:shadow-xl
  `,

  secondary: `
    bg-white
    text-slate-700
    border
    border-slate-200
    hover:bg-slate-50
    shadow-sm
  `,

  outline: `
    border-2
    border-[#008388]
    text-[#008388]
    hover:bg-[#008388]
    hover:text-white
  `,

  danger: `
    bg-red-500
    text-white
    hover:bg-red-600
  `,
};

const sizes = {
  sm: "px-4 py-2 text-sm",

  md: "px-6 py-3 text-base",

  lg: "px-8 py-4 text-lg",
};

export default function AnimatedButton({
  children,

  variant = "primary",

  size = "md",

  className = "",

  type = "button",

  loading = false,

  disabled = false,

  leftIcon,

  rightIcon,

  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2

        rounded-2xl

        font-semibold

        transition-all
        duration-300

        hover:-translate-y-1
        active:translate-y-0
        active:scale-95

        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:translate-y-0
        disabled:active:scale-100

        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <Loader2
          size={18}
          className="animate-spin"
        />
      ) : (
        <>
          {leftIcon}

          <span>{children}</span>

          {rightIcon}
        </>
      )}
    </button>
  );
}