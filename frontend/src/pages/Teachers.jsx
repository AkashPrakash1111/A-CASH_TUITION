import { useMemo, useState } from "react";
import { Plus, GraduationCap } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";

import SubjectFilterBar from "../components/teachers/SubjectFilterBar";
import TeacherCard from "../components/teachers/TeacherCard";
import TeacherModal from "../components/teachers/TeacherModal";
import TeacherDetailModal from "../components/teachers/TeacherDetailModal";
import FacultyInsights from "../components/teachers/FacultyInsights";

import useTeachers from "../hooks/useTeachers";
import useBatches from "../hooks/useBatches";

export default function Teachers() {
  const { teachers, addTeacher, editTeacher, deleteTeacher } = useTeachers();
  const { batches } = useBatches();

  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [viewingTeacher, setViewingTeacher] = useState(null);

  // Batches taught, grouped by teacher name — real data from the Batches
  // module rather than fabricated counts, so this stays in sync.
  const batchesByTeacher = useMemo(() => {
    const map = {};

    batches.forEach((batch) => {
      if (!batch.teacher) return;
      if (!map[batch.teacher]) map[batch.teacher] = [];
      map[batch.teacher].push(batch);
    });

    return map;
  }, [batches]);

  const totalBatchesAssigned = useMemo(() => {
    return batches.filter((b) => b.teacher).length;
  }, [batches]);

  const subjectList = useMemo(() => {
    const unique = new Set(
      teachers.map((t) => t.subject).filter(Boolean)
    );
    return [...unique].sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const searchMatch =
        !search ||
        teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        (teacher.subject || "").toLowerCase().includes(search.toLowerCase()) ||
        (teacher.phone || "").includes(search) ||
        (teacher.email || "").toLowerCase().includes(search.toLowerCase());

      const subjectMatch =
        !selectedSubject || teacher.subject === selectedSubject;

      return searchMatch && subjectMatch;
    });
  }, [teachers, search, selectedSubject]);

  const openAddModal = () => {
    setEditingTeacher(null);
    setIsFormOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setEditingTeacher(null);
    setIsFormOpen(false);
  };

  const handleSave = async (teacherData) => {
    try {
      if (editingTeacher) {
        await editTeacher(teacherData);
      } else {
        await addTeacher(teacherData);
      }
      closeFormModal();
    } catch (err) {
      alert(`Could not save teacher: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (confirmDelete) {
      try {
        await deleteTeacher(id);
      } catch (err) {
        alert(`Could not delete teacher: ${err.message}`);
      }
    }
  };

  const handleExportCsv = () => {
    const header = [
      "Name",
      "Subject",
      "Phone",
      "Email",
      "Qualification",
      "Experience",
      "Status",
    ];

    const rows = teachers.map((t) => [
      t.name,
      t.subject || "",
      t.phone || "",
      t.email || "",
      t.qualification || "",
      t.experience || "",
      t.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "faculty-list.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">

      <PageHeader
        title="Teachers"
        subtitle="Manage your faculty and their batch assignments."
        buttonText="Add Teacher"
        buttonIcon={Plus}
        onButtonClick={openAddModal}
      />

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
        <SubjectFilterBar
          subjects={subjectList}
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
        />
      </div>

      <div className="mt-6">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teachers by name, subject, phone or email..."
        />
      </div>

      <div className="grid grid-cols-12 gap-8 mt-8">

        {/* Left — Teacher cards */}

        <div className="col-span-12 lg:col-span-9">

          {filteredTeachers.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm text-center py-20">
              <GraduationCap size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 font-semibold text-slate-600">
                No teachers found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try a different search or add a new teacher.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => {
                const teacherBatches = batchesByTeacher[teacher.name] || [];

                const studentsCount = teacherBatches.reduce(
                  (sum, b) => sum + (parseInt(b.enrolled) || 0),
                  0
                );

                return (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    classesCount={teacherBatches.length}
                    studentsCount={studentsCount}
                    onView={setViewingTeacher}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}

        </div>

        {/* Right — Faculty insights */}

        <div className="col-span-12 lg:col-span-3">
          <FacultyInsights
            teachers={teachers}
            totalBatchesAssigned={totalBatchesAssigned}
            onExportCsv={handleExportCsv}
          />
        </div>

      </div>

      <TeacherModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        onSave={handleSave}
        teacher={editingTeacher}
      />

      <TeacherDetailModal
        isOpen={Boolean(viewingTeacher)}
        onClose={() => setViewingTeacher(null)}
        teacher={viewingTeacher}
        batches={
          viewingTeacher ? batchesByTeacher[viewingTeacher.name] || [] : []
        }
      />

    </div>
  );
}
