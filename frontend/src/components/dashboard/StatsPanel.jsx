import React from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers3,
} from "lucide-react";

import StatsCard from "../ui/StatsCard";

export default function StatsPanel() {
  const stats = [
    {
      title: "Students",
      value: "324",
      icon: Users,
      color: "bg-blue-500",
      change: "+18 this month",
    },
    {
      title: "Teachers",
      value: "18",
      icon: GraduationCap,
      color: "bg-emerald-500",
      change: "+2 new teachers",
    },
    {
      title: "Subjects",
      value: "42",
      icon: BookOpen,
      color: "bg-violet-500",
      change: "Across all classes",
    },
    {
      title: "Batches",
      value: "16",
      icon: Layers3,
      color: "bg-orange-500",
      change: "Morning & Evening",
    },
  ];

  return (
    <section className="mt-8">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold text-gray-900">
            Campus Overview
          </h2>

          <p className="text-gray-500 mt-1">
            Real-time overview of your tuition center.
          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
          />
        ))}

      </div>

    </section>
  );
}