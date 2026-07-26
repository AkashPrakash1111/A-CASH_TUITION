import React from "react";

const variants = {
  primary:
    "bg-[#008388] hover:bg-[#006d71] text-white",

  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-800",

  danger:
    "bg-red-500 hover:bg-red-600 text-white",

  warning:
    "bg-yellow-500 hover:bg-yellow-600 text-white",

  success:
    "bg-green-500 hover:bg-green-600 text-white",

  outline:
    "border border-[#008388] text-[#008388] hover:bg-[#008388] hover:text-white",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-xl
        font-medium
        transition-all
        duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}