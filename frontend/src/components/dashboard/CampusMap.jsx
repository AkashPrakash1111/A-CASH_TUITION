import React from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers3,
  NotebookPen,
  ClipboardCheck,
  Video,
  Bot,
} from "lucide-react";

import CampusBuilding from "./CampusBuilding";

const modules = [
  {
    title: "Students",
    subtitle: "Manage all students",
    icon: Users,
    gradient: "from-blue-500/10 to-cyan-400/10",
  },
  {
    title: "Teachers",
    subtitle: "Faculty management",
    icon: GraduationCap,
    gradient: "from-green-500/10 to-emerald-400/10",
  },
  {
    title: "Subjects",
    subtitle: "Academic subjects",
    icon: BookOpen,
    gradient: "from-violet-500/10 to-fuchsia-400/10",
  },
  {
    title: "Batches",
    subtitle: "Organize classes",
    icon: Layers3,
    gradient: "from-orange-500/10 to-yellow-300/10",
  },
  {
    title: "Notes",
    subtitle: "Study materials",
    icon: NotebookPen,
    gradient: "from-pink-500/10 to-rose-300/10",
  },
  {
    title: "Exams",
    subtitle: "Assessments",
    icon: ClipboardCheck,
    gradient: "from-red-500/10 to-orange-300/10",
  },
  {
    title: "Live Classes",
    subtitle: "Online learning",
    icon: Video,
    gradient: "from-indigo-500/10 to-blue-300/10",
  },
  {
    title: "AI Studio",
    subtitle: "AI-powered learning",
    icon: Bot,
    gradient: "from-teal-500/10 to-cyan-300/10",
  },
];

export default function CampusMap() {
  return (
    <section className="mt-12">

      <div className="mb-8">

        <h2 className="text-3xl font-bold">
          Digital Campus
        </h2>

        <p className="text-gray-500 mt-2">
          Access every module from one intelligent workspace.
        </p>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

        {modules.map((module) => (

          <CampusBuilding
            key={module.title}
            {...module}
          />

        ))}

      </div>

    </section>
  );
}