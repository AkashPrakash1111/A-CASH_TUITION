import { NavLink } from "react-router-dom";
import {
  House,
  Users,
  GraduationCap,
  BookOpen,
  Layers3,
  NotebookPen,
  FileText,
  ClipboardCheck,
  Video,
  Bot,
  ChartColumn,
  Settings,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: House, path: "/admin/dashboard" },
  { name: "Students", icon: Users, path: "/admin/students" },
  { name: "Teachers", icon: GraduationCap, path: "/admin/teachers" },
  { name: "Subjects", icon: BookOpen, path: "/admin/subjects" },
  { name: "Batches", icon: Layers3, path: "/admin/batches" },
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
    <aside
      className="
        h-full
        rounded-[32px]
        bg-white/80
        backdrop-blur-xl
        border border-white/60
        shadow-[0_20px_60px_rgba(15,23,42,0.08)]
        flex
        flex-col
        overflow-hidden
      "
    >
      {/* Logo */}

      <div className="px-7 py-8 border-b border-slate-100">

        <div className="flex items-center gap-4">

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-gradient-to-br
              from-cyan-500
              to-blue-600
              flex
              items-center
              justify-center
              text-white
              shadow-lg
            "
          >
            <ShieldCheck size={28} />
          </div>

          <div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
              ACASH
            </h1>

            <p className="text-sm text-slate-500">
              Tuition Portal
            </p>

          </div>

        </div>

      </div>

      {/* Menu */}

      <nav className="flex-1 px-5 py-6 space-y-2 overflow-y-auto">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `
                group
                flex
                items-center
                gap-4
                rounded-2xl
                px-4
                py-3
                transition-all
                duration-300
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#008388] to-cyan-500 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`
                      w-11
                      h-11
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      transition-all
                      ${
                        isActive
                          ? "bg-white/20"
                          : "bg-slate-100 group-hover:bg-white"
                      }
                    `}
                  >
                    <Icon size={20} />
                  </div>

                  <span className="font-semibold">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

      </nav>

      {/* Bottom Profile */}

      <div className="border-t border-slate-100 p-5">

        <div className="rounded-2xl bg-gradient-to-r from-[#008388] to-cyan-500 p-4 text-white">

          <div className="flex items-center gap-3">

            <div
              className="
                w-12
                h-12
                rounded-full
                bg-white
                text-[#008388]
                font-bold
                flex
                items-center
                justify-center
              "
            >
              A
            </div>

            <div>

              <p className="font-bold">
                Admin
              </p>

              <p className="text-sm text-white/80">
                ACASH Tuition
              </p>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}