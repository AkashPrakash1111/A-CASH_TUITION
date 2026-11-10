import { NavLink, useNavigate } from "react-router-dom";
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
  LogOut,
  Gift,
  HeartHandshake,
  Inbox,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { buildAvatarUrl, getDefaultAvatarConfig } from "../avatar/dicebearOptions";

function parseAvatar(configStr) {
  if (!configStr) return getDefaultAvatarConfig();
  try {
    return JSON.parse(configStr);
  } catch {
    return getDefaultAvatarConfig();
  }
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const rolePrefix = user?.role === "teacher" ? "/teacher" : "/admin";

  const menuItems = [
    { name: "Dashboard", icon: House, path: `${rolePrefix}/dashboard` },
    { name: "Students", icon: Users, path: `${rolePrefix}/students` },
    ...(user?.role === "admin"
      ? [{ name: "Teachers", icon: GraduationCap, path: "/admin/teachers" }]
      : []),
    { name: "Subjects", icon: BookOpen, path: `${rolePrefix}/subjects` },
    { name: "Batches", icon: Layers3, path: `${rolePrefix}/batches` },
    { name: "Notes", icon: NotebookPen, path: `${rolePrefix}/notes` },
    { name: "Assignments", icon: FileText, path: `${rolePrefix}/assignments` },
    { name: "Exams", icon: ClipboardCheck, path: `${rolePrefix}/exams` },
    { name: "Submissions", icon: Inbox, path: `${rolePrefix}/submissions` },
    { name: "Live Classes", icon: Video, path: `${rolePrefix}/live-classes` },
    { name: "AI Studio", icon: Bot, path: `${rolePrefix}/ai-studio` },
    { name: "Analytics", icon: ChartColumn, path: `${rolePrefix}/analytics` },
    ...(user?.role === "admin"
      ? [{ name: "CASHMART Admin", icon: Gift, path: "/admin/cashmart" }]
      : []),
    {
      name: "Parent Reports",
      icon: HeartHandshake,
      path: `${rolePrefix}/parent-analysis`,
    },
    { name: "Settings", icon: Settings, path: `${rolePrefix}/settings` },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "A";
  const avatarUrl = buildAvatarUrl(parseAvatar(user?.avatar_config));

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
      <div className="border-t border-slate-100 p-5 space-y-2">
        <div className="rounded-2xl bg-gradient-to-r from-[#008388] to-cyan-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-white/20
                p-0.5
                flex
                items-center
                justify-center
                overflow-hidden
                shadow-sm
              "
            >
              <img
                src={avatarUrl}
                alt={user?.name || "User Avatar"}
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.innerText = initial;
                }}
              />
            </div>

            <div className="min-w-0">
              <p className="font-bold truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-sm text-white/80 truncate">
                {user?.email || "ACASH Tuition"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            px-4
            py-3
            text-sm
            font-semibold
            text-slate-500
            hover:bg-red-50
            hover:text-red-500
            transition-colors
          "
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
