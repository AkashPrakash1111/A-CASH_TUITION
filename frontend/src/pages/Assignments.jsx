import { useMemo, useState } from "react";
import { Plus, ClipboardList, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import StatsCard from "../components/ui/StatsCard";

import ClassSelector from "../components/notes/ClassSelector";
import AssignmentCard from "../components/assignments/AssignmentCard";
import AssignmentFormModal from "../components/assignments/AssignmentFormModal";
import SubmissionsDrawer from "../components/assignments/SubmissionsDrawer";

import useAssignments from "../hooks/useAssignments";
import useBatches from "../hooks/useBatches";
import useSubjects from "../hooks/useSubjects";

export default function Assignments() {
  const {
    assignments,
    addAssignment,
    editAssignment,
    deleteAssignment,
    getStatus,
    refreshAssignments,
  } = useAssignments();

  const { batches } = useBatches();
  const { subjects } = useSubjects();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [activeGradingAssignment, setActiveGradingAssignment] = useState(null);

  const classList = useMemo(() => {
    return [...new Set(batches.map((b) => b.className))];
  }, [batches]);

  const subjectList = useMemo(() => {
    return subjects.map((s) => s.name || s.subjectName || "").filter(Boolean);
  }, [subjects]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const classMatch =
        !selectedClass || assignment.className === selectedClass;

      const subjectMatch =
        !selectedSubject || assignment.subject === selectedSubject;

      const searchMatch =
        !search ||
        assignment.title.toLowerCase().includes(search.toLowerCase());

      return classMatch && subjectMatch && searchMatch;
    });
  }, [assignments, selectedClass, selectedSubject, search]);

  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter((a) => getStatus(a) === "Active").length;
    const overdue = assignments.filter((a) => getStatus(a) === "Overdue").length;
    const submissions = assignments.reduce(
      (sum, a) => sum + (a.submissionsCount || 0),
      0
    );

    return { total, active, overdue, submissions };
  }, [assignments, getStatus]);

  const openAddModal = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingAssignment(null);
    setIsModalOpen(false);
  };

  // Throws on failure so the form can show the reason and stay open
  const handleSave = async (data) => {
    if (editingAssignment) {
      await editAssignment({ ...editingAssignment, ...data });
    } else {
      await addAssignment(data);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (confirmDelete) {
      deleteAssignment(id);
    }
  };

  return (
    <div className="p-8">

      <PageHeader
        title="Assignments"
        subtitle="Create, track and manage assignments for your students."
        buttonText="New Assignment"
        buttonIcon={Plus}
        onButtonClick={openAddModal}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatsCard
          title="Total Assignments"
          value={stats.total}
          icon={ClipboardList}
          color="bg-[#008388]"
        />

        <StatsCard
          title="Active"
          value={stats.active}
          icon={Clock}
          color="bg-blue-500"
        />

        <StatsCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          color="bg-red-500"
        />

        <StatsCard
          title="Submissions Received"
          value={stats.submissions}
          icon={CheckCircle2}
          color="bg-green-500"
        />

      </div>

      <div className="mt-8">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assignments..."
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

          {filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm text-center py-20">
              <ClipboardList size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 font-semibold text-slate-600">
                No assignments yet
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first assignment to get started.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  status={getStatus(assignment)}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onViewSubmissions={setActiveGradingAssignment}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      {isModalOpen && (
        <AssignmentFormModal
          onClose={closeModal}
          onSave={handleSave}
          assignment={editingAssignment}
          classes={classList}
          subjects={subjectList}
          batches={batches}
        />
      )}

      {activeGradingAssignment && (
        <SubmissionsDrawer
          key={activeGradingAssignment.id}
          assignment={activeGradingAssignment}
          onClose={() => setActiveGradingAssignment(null)}
          onGraded={refreshAssignments}
        />
      )}

    </div>
  );
}
