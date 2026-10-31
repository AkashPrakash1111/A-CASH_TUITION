import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, role, roles }) {
  const { user, token, checking } = useAuth();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8FC] text-[#008388] font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#008388] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Entering ACASH Digital Campus...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Allowed roles check
  const allowed = roles ? roles : role ? [role] : null;

  if (allowed && !allowed.includes(user.role)) {
    const roleRedirects = {
      admin: "/admin/dashboard",
      teacher: "/teacher/dashboard",
      student: "/student/dashboard",
      parent: "/student/dashboard",
    };
    return <Navigate to={roleRedirects[user.role] || "/login"} replace />;
  }

  return children;
}
