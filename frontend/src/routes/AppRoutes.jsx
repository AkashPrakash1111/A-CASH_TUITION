import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import StudentLayout from "../layouts/StudentLayout";

// Auth & Errors
import Login from "../pages/auth/Login";
import NotFound from "../pages/errors/NotFound";

// Admin & Faculty Pages
import Home from "../pages/Home";
import Students from "../pages/Students";
import Teachers from "../pages/Teachers";
import Subjects from "../pages/Subjects";
import Batches from "../pages/Batches";
import Notes from "../pages/Notes";
import Assignments from "../pages/Assignments";
import Exams from "../pages/Exams";
import LiveClasses from "../pages/LiveClasses";
import AIStudio from "../pages/AIStudio";
import Analytics from "../pages/Analytics";
import Settings from "../pages/Settings";
import CashMartAdmin from "../pages/CashMartAdmin";
import ParentPortal from "../pages/ParentPortal";

// Student Living Campus Pages
import StudentDashboard from "../pages/student/Dashboard";
import StudentFriends from "../pages/student/Friends";
import StudentTeachers from "../pages/student/Teachers";
import StudentSubjects from "../pages/student/Subjects";
import MeCash from "../pages/student/MeCash";
import StudentNotes from "../pages/student/Notes";
import StudentAssignments from "../pages/student/Assignments";
import StudentExams from "../pages/student/Exams";
import ExamTaking from "../pages/student/ExamTaking";
import StudentLiveClasses from "../pages/student/LiveClasses";
import StudentProgress from "../pages/student/Progress";
import StudentCashMart from "../pages/student/CashMart";

// Admin Shell
function AdminShell() {
  return (
    <ProtectedRoute role="admin">
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
}

// Teacher Shell
function TeacherShell() {
  return (
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <Outlet />
      </TeacherLayout>
    </ProtectedRoute>
  );
}

// Student Shell
function StudentShell() {
  return (
    <ProtectedRoute role="student">
      <StudentLayout>
        <Outlet />
      </StudentLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* =======================================================
            ADMIN REALM
        ======================================================== */}
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
          <Route path="/admin/cashmart" element={<CashMartAdmin />} />
          <Route path="/admin/parent-analysis/:studentId?" element={<ParentPortal />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>

        {/* =======================================================
            TEACHER REALM
        ======================================================== */}
        <Route element={<TeacherShell />}>
          <Route path="/teacher/dashboard" element={<Home />} />
          <Route path="/teacher/students" element={<Students />} />
          <Route path="/teacher/batches" element={<Batches />} />
          <Route path="/teacher/subjects" element={<Subjects />} />
          <Route path="/teacher/notes" element={<Notes />} />
          <Route path="/teacher/assignments" element={<Assignments />} />
          <Route path="/teacher/exams" element={<Exams />} />
          <Route path="/teacher/live-classes" element={<LiveClasses />} />
          <Route path="/teacher/ai-studio" element={<AIStudio />} />
          <Route path="/teacher/analytics" element={<Analytics />} />
          <Route path="/teacher/parent-analysis/:studentId?" element={<ParentPortal />} />
          <Route path="/teacher/settings" element={<Settings />} />
        </Route>

        {/* =======================================================
            STUDENT LIVING CAMPUS
        ======================================================== */}
        <Route element={<StudentShell />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/friends" element={<StudentFriends />} />
          <Route path="/student/teachers" element={<StudentTeachers />} />
          <Route path="/student/subjects" element={<StudentSubjects />} />
          <Route path="/student/cashmart" element={<StudentCashMart />} />
          <Route path="/student/me-cash" element={<MeCash />} />
          <Route path="/student/notes" element={<StudentNotes />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/exams" element={<StudentExams />} />
          <Route path="/student/live-classes" element={<StudentLiveClasses />} />
          <Route path="/student/ai-studio" element={<AIStudio />} />
          <Route path="/student/progress" element={<StudentProgress />} />
          <Route path="/student/parent-view" element={<ParentPortal />} />
          <Route path="/student/settings" element={<Settings />} />
        </Route>

        {/* Focused Exam Taking Arena (full viewport without sidebar distractions) */}
        <Route
          path="/student/exams/:id/take"
          element={
            <ProtectedRoute role="student">
              <ExamTaking />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
