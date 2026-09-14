import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

import Login from "../pages/auth/Login";
import Home from "../pages/Home";
import Batches from "../pages/Batches";
import StudentDashboard from "../pages/student/Dashboard";
import NotFound from "../pages/errors/NotFound";
import Students from "../pages/Students";
import Subjects from "../pages/Subjects";
import Notes from "../pages/Notes";
import Assignments from "../pages/Assignments";
import Exams from "../pages/Exams";
import LiveClasses from "../pages/LiveClasses";
import AIStudio from "../pages/AIStudio";
import Analytics from "../pages/Analytics";
import Settings from "../pages/Settings";
import Teachers from "../pages/Teachers";

// Applies auth + role check ONCE, then wraps every admin page in the
// sidebar/shell automatically via <Outlet/> — no need to import
// AdminLayout inside each individual page anymore.
function AdminShell() {
  return (
    <ProtectedRoute role="admin">
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route element={<AdminShell />}>
          <Route path="/admin/dashboard" element={<Home />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/teachers" element={<Teachers />} />
          <Route path="/admin/subjects" element={<Subjects />} />
          <Route path="/admin/batches" element={<Batches />} />
          <Route path="/admin/notes" element={<Notes />} />
          <Route path="/admin/assignments" element={<Assignments />} />
          <Route path="/admin/exams" element={<Exams />} />
          <Route path="/admin/live-classes" element={<LiveClasses />} />
          <Route path="/admin/ai-studio" element={<AIStudio />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>

        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
