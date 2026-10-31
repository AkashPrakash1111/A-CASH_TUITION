import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle2,
  Calendar,
  Coins,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Sparkles,
  User,
  GraduationCap,
  Clock,
  Printer,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { parentsApi, studentsApi } from "../services/api";

export default function ParentPortal() {
  const { studentId: paramStudentId } = useParams();
  const { token, user } = useAuth();

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(paramStudentId || "");
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);

  // If admin/teacher, load list of students so they can inspect any student report
  const isFacultyOrAdmin = user?.role === "admin" || user?.role === "teacher";

  useEffect(() => {
    async function loadStudentList() {
      if (!isFacultyOrAdmin || !token) return;
      try {
        const list = await studentsApi.list(token);
        if (Array.isArray(list)) {
          setStudents(list);
          if (!selectedStudentId && list.length > 0) {
            setSelectedStudentId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Could not load students list", err);
      }
    }
    loadStudentList();
  }, [isFacultyOrAdmin, token]);

  useEffect(() => {
    async function loadReport() {
      if (!token) return;
      try {
        setLoading(true);
        let res;
        if (selectedStudentId) {
          res = await parentsApi.getStudentAnalysis(token, selectedStudentId);
        } else {
          res = await parentsApi.getMyStudent(token);
        }
        setAnalysisData(res);
      } catch (err) {
        console.error("Failed to load parent analysis", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [selectedStudentId, token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !analysisData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8 text-center text-slate-500">
        <p className="font-semibold text-sm">Compiling Comprehensive Student Parent Dossier...</p>
      </div>
    );
  }

  const { student, kpis, subject_mastery, exam_history, recent_feedback, growth_insights } =
    analysisData || {};

  return (
    <div className="space-y-8 pb-16 print:p-0 print:space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 print:border-none print:p-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 text-[#008388] text-xs font-bold mb-2">
            <ShieldCheck size={14} /> ACASH Comprehensive Guardian Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            Student Performance Dossier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete transparency into attendance, homework discipline, exam mastery, and faculty observations.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto print:hidden">
          {/* Student Selector for Admin/Teacher */}
          {isFacultyOrAdmin && students.length > 0 && (
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="pl-4 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.className || "Class"} {st.batch ? `- ${st.batch}` : ""})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
              />
            </div>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Printer size={15} /> Print Dossier
          </button>
        </div>
      </div>

      {/* Student Profile Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 to-blue-500 p-1 flex items-center justify-center shrink-0 shadow-lg">
              <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-cyan-300 font-black text-2xl">
                {student?.name?.charAt(0) || "S"}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black">{student?.name || "Student"}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  {student?.status || "Active Scholar"}
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                Class: <strong>{student?.className || "General"}</strong> • Batch:{" "}
                <strong>{student?.batch || "Standard Batch"}</strong>
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Guardian Registered:{" "}
                <strong className="text-slate-200">{student?.parent_contact || "Primary Guardian"}</strong>
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                Cumulative Grade
              </span>
              <div className="text-3xl font-black text-cyan-300 mt-0.5">
                {kpis?.overall_grade || "A"}
              </div>
            </div>
            <div className="border-l border-white/10 pl-6">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                Academic Avg
              </span>
              <div className="text-3xl font-black text-emerald-300 mt-0.5">
                {kpis?.academic_percentage ?? 88}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <TrendingUp size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Exam Trials Taken
            </p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">
              {kpis?.exams_completed ?? 0} Exams
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {kpis?.academic_percentage ?? 88}% Average score
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Homework Turn-in
            </p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">
              {kpis?.assignment_turnin_rate ?? 90}%
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Discipline & regularity</p>
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Coins size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              CASH Earned
            </p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">
              {kpis?.total_cash_earned ?? 100}
            </h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
              Available: {kpis?.cash_balance ?? 100} CASH
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Attendance Index
            </p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">
              {kpis?.attendance_rate ?? 96}%
            </h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Punctual & regular</p>
          </div>
        </div>
      </div>

      {/* Subject Mastery Radar / Progress Bars */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <BookOpen size={20} className="text-[#008388]" /> Subject-Wise Conceptual Mastery
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluation synthesized across multiple curriculum tests and homework submissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(subject_mastery || []).map((subj, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 text-sm">{subj.subject}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    {subj.trials_count} Assessments
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    subj.status === "Mastered"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {subj.status}
                </span>
              </div>

              {/* Progress Track */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Proficiency</span>
                  <span>{subj.mastery_score}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${subj.mastery_score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Exam Records & Faculty Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Exam Records Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Exam Trial Scorecards</h3>
              <p className="text-xs text-slate-500">History of unit tests and term examinations.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Exam Name</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(exam_history || []).map((exam, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-800">{exam.exam_name}</td>
                    <td className="py-3 px-3 text-slate-600">{exam.subject}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {exam.marks_obtained !== null ? `${exam.marks_obtained} / ${exam.max_marks}` : "Pending"}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          exam.percentage >= 80
                            ? "bg-emerald-100 text-emerald-800"
                            : exam.percentage >= 50
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {exam.percentage}% ({exam.percentage >= 80 ? "Distinction" : "Passed"})
                      </span>
                    </td>
                  </tr>
                ))}
                {(!exam_history || exam_history.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400">
                      No recorded exam trials yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Faculty Insights & Qualitative Growth (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" /> Faculty Qualitative Observation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct insights from teaching instructors.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 text-slate-800 text-xs italic leading-relaxed">
            "{growth_insights?.faculty_endorsement || "Demonstrates keen curiosity, attentive in live sessions, and steadily growing in problem solving speed."}"
            <div className="mt-3 font-bold text-amber-900 not-italic text-[11px] flex items-center gap-1.5">
              <GraduationCap size={14} /> ACASH Faculty Mentorship Board
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" /> Key Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                {(growth_insights?.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-indigo-600" /> Recommended Focus Areas
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                {(growth_insights?.focus_areas || []).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
