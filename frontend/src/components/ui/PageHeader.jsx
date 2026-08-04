import React from "react";
import Button from "./Button";

export default function PageHeader({
  title,
  subtitle,
  buttonText,
  buttonIcon: Icon,
  onButtonClick,
  children,
}) {
  return (
    <div className="mb-8">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-gray-500 text-lg">
              {subtitle}
            </p>
          )}

        </div>

        <div className="flex items-center gap-3">

          {children}

          {buttonText && (
            <Button
              size="lg"
              onClick={onButtonClick}
              className="flex items-center gap-2 shadow-md"
            >
              {Icon && <Icon size={20} />}
              {buttonText}
            </Button>
          )}

        </div>

      </div>

    </div>
  );
}