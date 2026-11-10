import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  House,
  Users,
  Layers3,
  BookOpen,
  NotebookPen,
  FileText,
  ClipboardCheck,
  Video,
  Bot,
  ChartColumn,
  Settings,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Inbox,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { buildAvatarUrl, getDefaultAvatarConfig } from "../components/avatar/dicebearOptions";

const teacherMenuItems = [
  { name: "Dashboard", icon: House, path: "/teacher/dashboard" },
  { name: "Students", icon: Users, path: "/teacher/students" },
  { name: "Batches", icon: Layers3, path: "/teacher/batches" },
  { name: "Subjects", icon: BookOpen, path: "/teacher/subjects" },
  { name: "Notes & Annotations", icon: NotebookPen, path: "/teacher/notes" },
  { name: "Assignments", icon: FileText, path: "/teacher/assignments" },
  { name: "Exams", icon: ClipboardCheck, path: "/teacher/exams" },
  { name: "Submissions", icon: Inbox, path: "/teacher/submissions" },
  { name: "Live Classes", icon: Video, path: "/teacher/live-classes" },
  { name: "AI Studio", icon: Bot, path: "/teacher/ai-studio" },
  { name: "Analytics", icon: ChartColumn, path: "/teacher/analytics" },
  { name: "Settings", icon: Settings, path: "/teacher/settings" },
];

function parseAvatarConfig(user) {
  if (!user?.avatar_config) return getDefaultAvatarConfig();
  try {
    return JSON.parse(user.avatar_config);
  } catch {
    return getDefaultAvatarConfig();
  }
}

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentConfig = parseAvatarConfig(user);
  const avatarUrl = buildAvatarUrl(currentConfig);

  return (
    <div className="min-h-screen bg-[#F4F8FC] relative text-slate-800">
      {/* Soft Faculty Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute top-48 right-0 w-[420px] h-[420px] rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008388] to-blue-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-800 leading-tight">ACASH</h1>
            <p className="text-[11px] font-medium text-[#008388]">Faculty Portal</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Main Container */}
      <div className="relative flex z-10">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 bottom-0 left-0 w-72 p-5 z-50 transition-transform duration-300 lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full rounded-[32px] bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] flex flex-col overflow-hidden">
            {/* Faculty Identity Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-blue-50/50 to-transparent">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl p-1 bg-white shadow-md shrink-0 border border-slate-100">
                  <img src={avatarUrl} alt="Faculty Avatar" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Faculty</p>
                  </div>
                  <h2 className="font-bold text-slate-800 text-base truncate">{user?.name || "Teacher"}</h2>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
              {teacherMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#008388] to-blue-600 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100/70"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-white"
                          }`}
                        >
                          <Icon size={17} />
                        </div>
                        <span className="text-sm font-semibold">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Bottom Logout */}
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-500 transition"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 lg:ml-76 p-4 sm:p-6 lg:p-8 min-h-screen">
          <div className="min-h-[calc(100vh-64px)] rounded-[36px] bg-white/75 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
