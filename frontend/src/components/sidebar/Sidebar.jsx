import { NavLink } from "react-router-dom";
import {
  House,
  Users,
  BookOpen,
  NotebookPen,
  FileText,
  ClipboardCheck,
  Video,
  Bot,
  ChartColumn,
  Settings,
} from "lucide-react";

const menuItems = [
  { name: "Home", icon: House, path: "/admin/dashboard" },
  { name: "Students", icon: Users, path: "/admin/students" },
  { name: "Subjects", icon: BookOpen, path: "/admin/subjects" },
  { name: "Notes", icon: NotebookPen, path: "/admin/notes" },
  { name: "Assignments", icon: FileText, path: "/admin/assignments" },
  { name: "Exams", icon: ClipboardCheck, path: "/admin/exams" },
  { name: "Live Classes", icon: Video, path: "/admin/live-classes" },
  { name: "AI Studio", icon: Bot, path: "/admin/ai-studio" },
  { name: "Analytics", icon: ChartColumn, path: "/admin/analytics" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col">

      {/* Logo */}

      <div className="h-20 flex items-center justify-center border-b">

        <h1 className="text-2xl font-bold text-teal-700">
          ACASH
        </h1>

      </div>

      {/* Navigation */}

      <nav className="flex-1 px-4 py-6">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
  key={item.name}
  to={item.path}
  className={({ isActive }) =>
    `w-full flex items-center gap-4 p-3 rounded-xl mb-2 transition
    ${
      isActive
        ? "bg-[#008388] text-white shadow-md"
        : "hover:bg-teal-50 hover:text-[#008388]"
    }`
  }
>
              <Icon size={22} />

              <span className="font-medium">

                {item.name}

              </span>

            </NavLink>

          );
        })}

      </nav>

    </aside>
  );
}