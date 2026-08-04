import React from "react";

export default function Card({
  children,
  className = "",
  hover = false,
}) {
  return (
    <div
      className={`
        bg-white
        rounded-3xl
        border
        border-gray-200
        shadow-sm
        p-6
        transition-all
        duration-300
        ${
          hover
            ? "hover:-translate-y-1 hover:shadow-xl"
            : ""
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}