import { useMemo, useState } from "react";
import {
  Plus,
  ClipboardCheck,
  CalendarClock,
  Hourglass,
  CheckCircle2,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import StatsCard from "../components/ui/StatsCard";

import ClassSelector from "../components/notes/ClassSelector";
import ExamCard from "../components/exams/ExamCard";
import ExamFormModal from "../components/exams/ExamFormModal";
import ExamSubmissionsDrawer from "../components/exams/ExamSubmissionsDrawer";

import useExams from "../hooks/useExams";
import useBatches from "../hooks/useBatches";
import useSubjects from "../hooks/useSubjects";

export default function Exams() {
  const {
    exams,
    addExam,
    editExam,
    deleteExam,
    getStatus,
  } = useExams();

  const { batches } = useBatches();
  const { subjects } = useSubjects();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [reviewExam, setReviewExam] = useState(null);

  const classList = useMemo(() => {
    return [...new Set(batches.map((b) => b.className))];
  }, [batches]);

  const subjectList = useMemo(() => {
    return subjects.map((s) => s.name || s.subjectName || "").filter(Boolean);
  }, [subjects]);

  const filteredExams = useMemo(() => {
    return exams
      .filter((exam) => {
        const classMatch =
          !selectedClass || exam.className === selectedClass;

        const subjectMatch =
          !selectedSubject || exam.subject === selectedSubject;

        const searchMatch =
          !search ||
          exam.examName.toLowerCase().includes(search.toLowerCase());

        return classMatch && subjectMatch && searchMatch;
      })
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  }, [exams, selectedClass, selectedSubject, search]);

  const stats = useMemo(() => {
    const total = exams.length;
    const upcoming = exams.filter((e) => getStatus(e) === "Upcoming").length;
    const ongoing = exams.filter((e) => getStatus(e) === "Ongoing").length;
    const completed = exams.filter((e) => getStatus(e) === "Completed").length;

    return { total, upcoming, ongoing, completed };
  }, [exams, getStatus]);

  const openAddModal = () => {
    setEditingExam(null);
    setIsModalOpen(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingExam(null);
    setIsModalOpen(false);
  };

  const handleSave = (data) => {
    if (editingExam) {
      editExam({ ...editingExam, ...data });
    } else {
      addExam(data);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam?"
    );

    if (confirmDelete) {
      deleteExam(id);
    }
  };

  return (
    <div className="p-8">

      <PageHeader
        title="Exams"
        subtitle="Schedule exams and track results across classes."
        buttonText="Schedule Exam"
        buttonIcon={Plus}
        onButtonClick={openAddModal}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatsCard
          title="Total Exams"
          value={stats.total}
          icon={ClipboardCheck}
          color="bg-[#008388]"
        />

        <StatsCard
          title="Upcoming"
          value={stats.upcoming}
          icon={CalendarClock}
          color="bg-blue-500"
        />

        <StatsCard
          title="Ongoing"
          value={stats.ongoing}
          icon={Hourglass}
          color="bg-amber-500"
        />

        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          color="bg-slate-500"
        />

      </div>

      <div className="mt-8">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exams..."
        />
      </div>

      <div className="grid grid-cols-12 gap-8 mt-8">

        {/* Left */}

        <div className="col-span-12 lg:col-span-3">
          <ClassSelector
            classes={classList}
            subjects={subjectList}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            onClassChange={(value) =>
              setSelectedClass((prev) => (prev === value ? "" : value))
            }
            onSubjectChange={(value) =>
              setSelectedSubject((prev) => (prev === value ? "" : value))
            }
          />
        </div>

        {/* Right */}

        <div className="col-span-12 lg:col-span-9">

          {filteredExams.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm text-center py-20">
              <ClipboardCheck size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 font-semibold text-slate-600">
                No exams scheduled yet
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Schedule your first exam to get started.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  status={getStatus(exam)}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onViewSubmissions={setReviewExam}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      <ExamFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        exam={editingExam}
        classes={classList}
        subjects={subjectList}
      />

      {reviewExam && (
        <ExamSubmissionsDrawer exam={reviewExam} onClose={() => setReviewExam(null)} />
      )}

    </div>
  );
}
