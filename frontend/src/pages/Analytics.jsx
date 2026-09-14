import { useMemo } from "react";
import {
  Users,
  GraduationCap,
  Layers3,
  PieChart,
  ClipboardCheck,
  ClipboardList,
  Video,
  FileText,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import KPICard from "../components/analytics/KPICard";
import SectionCard from "../components/analytics/SectionCard";
import BarChart from "../components/analytics/BarChart";
import BarChartPanel from "../components/analytics/BarChartPanel";
import DonutChart from "../components/analytics/DonutChart";
import BatchOccupancyList from "../components/analytics/BatchOccupancyList";
import {
  groupByCount,
  topEntries,
  sumByKey,
  toChartData,
  weeklyTrend,
  percentage,
} from "../components/analytics/analyticsUtils";

import useStudents from "../hooks/useStudents";
import useTeachers from "../hooks/useTeachers";
import useBatches from "../hooks/useBatches";
import useAssignments from "../hooks/useAssignments";
import useExams from "../hooks/useExams";
import useLiveClasses from "../hooks/useLiveClasses";
import useNotes from "../hooks/useNotes";

export default function Analytics() {
  const { students } = useStudents();
  const { teachers } = useTeachers();
  const { batches } = useBatches();

  const { assignments, getStatus: getAssignmentStatus } = useAssignments();
  const { exams, getStatus: getExamStatus } = useExams();
  const { liveClasses, getStatus: getLiveClassStatus } = useLiveClasses();
  const { notes } = useNotes();

  // ---- Core KPIs ----

  const overallOccupancy = useMemo(() => {
    const totalCapacity = batches.reduce((sum, b) => sum + (Number(b.capacity) || 0), 0);
    const totalEnrolled = batches.reduce((sum, b) => sum + (Number(b.enrolled) || 0), 0);
    return percentage(totalEnrolled, totalCapacity);
  }, [batches]);

  // ---- Enrollment trend (last 8 weeks, real created_at timestamps) ----

  const enrollmentTrend = useMemo(() => weeklyTrend(students, 8), [students]);

  // ---- Distributions ----

  const studentsByClass = useMemo(
    () => topEntries(groupByCount(students, (s) => s.className), 8),
    [students]
  );

  const subjectPopularity = useMemo(
    () =>
      topEntries(
        sumByKey(
          batches.filter((b) => b.subject),
          (b) => b.subject,
          (b) => b.enrolled
        ),
        8
      ),
    [batches]
  );

  const teacherWorkload = useMemo(
    () => topEntries(groupByCount(batches.filter((b) => b.teacher), (b) => b.teacher), 8),
    [batches]
  );

  const genderComposition = useMemo(
    () => toChartData(groupByCount(students, (s) => s.gender)),
    [students]
  );

  const statusComposition = useMemo(
    () => toChartData(groupByCount(students, (s) => s.status)),
    [students]
  );

  // ---- Academic activity pulse (cross-module, real derived statuses) ----

  const activeAssignments = assignments.filter((a) => getAssignmentStatus(a) === "Active").length;
  const overdueAssignments = assignments.filter((a) => getAssignmentStatus(a) === "Overdue").length;

  const upcomingExams = exams.filter((e) => getExamStatus(e) === "Upcoming").length;
  const ongoingExams = exams.filter((e) => getExamStatus(e) === "Ongoing").length;

  const liveNow = liveClasses.filter((c) => getLiveClassStatus(c) === "Live Now").length;
  const upcomingLive = liveClasses.filter((c) => getLiveClassStatus(c) === "Upcoming").length;

  return (
    <div className="p-8">

      <PageHeader
        title="Analytics"
        subtitle="A real-time view of enrollment, staffing and academic activity."
      />

      {/* Core KPIs */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <KPICard
          icon={Users}
          label="Total Students"
          value={students.length}
          color="bg-[#EAF8F8] text-[#008388]"
        />

        <KPICard
          icon={GraduationCap}
          label="Total Teachers"
          value={teachers.length}
          color="bg-blue-50 text-blue-600"
        />

        <KPICard
          icon={Layers3}
          label="Total Batches"
          value={batches.length}
          color="bg-violet-50 text-violet-600"
        />

        <KPICard
          icon={PieChart}
          label="Overall Occupancy"
          value={`${overallOccupancy}%`}
          color="bg-amber-50 text-amber-600"
        />

      </div>

      {/* Enrollment trend */}

      <div className="mt-8">
        <SectionCard
          title="Enrollment Trend"
          subtitle="New student sign-ups over the last 8 weeks"
        >
          <BarChart data={enrollmentTrend} height={192} />
        </SectionCard>
      </div>

      {/* Distributions */}

      <div className="grid lg:grid-cols-3 gap-6 mt-8">

        <BarChartPanel title="Students by Class" data={studentsByClass} emptyLabel="No students yet." />

        <BarChartPanel title="Subject Popularity" data={subjectPopularity} emptyLabel="No batches yet." />

        <BarChartPanel title="Teacher Workload (Batches)" data={teacherWorkload} emptyLabel="No batches yet." />

      </div>

      {/* Composition + Occupancy */}

      <div className="grid lg:grid-cols-2 gap-6 mt-8">

        <SectionCard title="Student Composition">
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                By Gender
              </p>
              <DonutChart data={genderComposition} centerLabel="Students" centerValue={students.length} />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                By Status
              </p>
              <DonutChart data={statusComposition} centerLabel="Students" centerValue={students.length} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Batch Occupancy" subtitle="Fullest batches right now">
          <BatchOccupancyList batches={batches} />
        </SectionCard>

      </div>

      {/* Academic activity pulse */}

      <div className="mt-8">
        <h2 className="font-bold text-slate-800 mb-4">
          Academic Activity
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <KPICard
            icon={ClipboardList}
            label="Active Assignments"
            value={activeAssignments}
            sublabel={`${overdueAssignments} overdue`}
            color="bg-blue-50 text-blue-600"
          />

          <KPICard
            icon={ClipboardCheck}
            label="Upcoming Exams"
            value={upcomingExams}
            sublabel={`${ongoingExams} ongoing now`}
            color="bg-amber-50 text-amber-600"
          />

          <KPICard
            icon={Video}
            label="Live Classes Now"
            value={liveNow}
            sublabel={`${upcomingLive} upcoming`}
            color="bg-red-50 text-red-600"
          />

          <KPICard
            icon={FileText}
            label="Notes Shared"
            value={notes.length}
            sublabel="Total uploaded"
            color="bg-emerald-50 text-emerald-600"
          />

        </div>
      </div>

    </div>
  );
}
