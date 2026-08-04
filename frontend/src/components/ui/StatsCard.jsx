import React from "react";
import Card from "./Card";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "bg-[#008388]",
  change,
}) {
  return (
    <Card hover>

      <div className="flex justify-between items-start">

        <div>

          <p className="text-gray-500 text-sm font-medium">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {value}
          </h2>

          {change && (
            <p className="mt-3 text-sm text-green-600 font-medium">
              {change}
            </p>
          )}

        </div>

        <div
          className={`
            ${color}
            w-14
            h-14
            rounded-2xl
            flex
            items-center
            justify-center
            text-white
          `}
        >
          {Icon && <Icon size={28} />}
        </div>

      </div>

    </Card>
  );
}