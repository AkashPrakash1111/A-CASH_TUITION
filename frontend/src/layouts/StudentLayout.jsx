import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  Sparkles,
  Compass,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  NotebookPen,
  FileText,
  ClipboardCheck,
  Video,
  Bot,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Gift,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import MagicBackdrop from "../components/magic/MagicBackdrop";
import { buildAvatarUrl, getDefaultAvatarConfig } from "../components/avatar/dicebearOptions";

const studentMenuItems = [
  { name: "Campus Hub", icon: Compass, path: "/student/dashboard" },
  { name: "Friends", icon: Users, path: "/student/friends" },
  { name: "My Teachers", icon: GraduationCap, path: "/student/teachers" },
  { name: "Subjects", icon: BookOpen, path: "/student/subjects" },
  { name: "CASHMART", icon: Gift, path: "/student/cashmart", badge: "Rewards" },
  { name: "ME-CASH", icon: UserCheck, path: "/student/me-cash", badge: "Atelier" },
  { name: "Study Notes", icon: NotebookPen, path: "/student/notes" },
  { name: "Assignments", icon: FileText, path: "/student/assignments" },
  { name: "Exams", icon: ClipboardCheck, path: "/student/exams" },
  { name: "Live Classes", icon: Video, path: "/student/live-classes" },
  { name: "AI Studio", icon: Bot, path: "/student/ai-studio" },
  { name: "My Progress", icon: TrendingUp, path: "/student/progress" },
  { name: "Parent View", icon: ShieldCheck, path: "/student/parent-view" },
  { name: "Settings", icon: Settings, path: "/student/settings" },
];

function parseAvatarConfig(user) {
  if (!user?.avatar_config) return getDefaultAvatarConfig();
  try {
    return JSON.parse(user.avatar_config);
  } catch {
    return getDefaultAvatarConfig();
  }
}

export default function StudentLayout() {
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
      <MagicBackdrop />

      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-800 leading-tight">ACASH</h1>
            <p className="text-[11px] font-medium text-[#008388]">Student World</p>
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
        {/* Student Sidebar */}
        <aside
          className={`fixed top-0 bottom-0 left-0 w-72 p-5 z-50 transition-transform duration-300 lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full rounded-[32px] bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] flex flex-col overflow-hidden">
            {/* Student Identity Card in Sidebar */}
            <div className="p-5 border-b border-slate-100/80 bg-gradient-to-b from-cyan-50/60 to-transparent">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-13 h-13 rounded-2xl p-1 bg-white shadow-md shrink-0 border border-slate-100 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => navigate("/student/me-cash")}
                  title="Customize in ME-CASH"
                >
                  <img src={avatarUrl} alt="Your character" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#008388]">Student</p>
                  </div>
                  <h2 className="font-bold text-slate-800 text-base truncate">{user?.name || "Student"}</h2>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Quick ME-CASH button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/student/me-cash");
                }}
                className="mt-3.5 w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-[#EAF8F8] text-[#008388] text-xs font-semibold hover:bg-[#008388] hover:text-white transition"
              >
                <Sparkles size={13} />
                <span>Open ME-CASH Studio</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
              {studentMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center justify-between rounded-2xl px-3.5 py-2.5 transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#008388] to-cyan-500 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100/70"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                              isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-white"
                            }`}
                          >
                            <Icon size={17} />
                          </div>
                          <span className="text-sm font-semibold">{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive ? "bg-white/30 text-white" : "bg-cyan-100 text-[#008388]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout Footer */}
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

        {/* Backdrop for mobile drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Child Routes Main Outlet */}
        <main className="flex-1 lg:ml-76 p-4 sm:p-6 lg:p-8 min-h-screen">
          <div className="min-h-[calc(100vh-64px)] rounded-[36px] bg-white/75 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
