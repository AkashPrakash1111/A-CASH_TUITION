import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Home from "../pages/Home";
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
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<Home />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
<Route path="/admin/students" element={<Students />} />
<Route path="/admin/subjects" element={<Subjects />} />
<Route path="/admin/notes" element={<Notes />} />
<Route path="/admin/assignments" element={<Assignments />} />
<Route path="/admin/exams" element={<Exams />} />
<Route path="/admin/live-classes" element={<LiveClasses />} />
<Route path="/admin/ai-studio" element={<AIStudio />} />
<Route path="/admin/analytics" element={<Analytics />} />
<Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}