import { useMemo, useState } from "react";
import { Plus, BookOpen } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";

import ClassFilterBar from "../components/subjects/ClassFilterBar";
import SubjectCard from "../components/subjects/SubjectCard";
import SubjectModal from "../components/subjects/SubjectModal";
import SubjectDetailModal from "../components/subjects/SubjectDetailModal";
import CurriculumInsights from "../components/subjects/CurriculumInsights";

import useSubjects from "../hooks/useSubjects";
import useBatches from "../hooks/useBatches";

export default function Subjects() {
  const { subjects, addSubject, editSubject, deleteSubject } = useSubjects();
  const { batches } = useBatches();

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [viewingSubject, setViewingSubject] = useState(null);

  // Batches offering each subject, grouped by subject name — real data
  // from the Batches module rather than fabricated counts.
  const batchesBySubject = useMemo(() => {
    const map = {};

    batches.forEach((batch) => {
      if (!batch.subject) return;
      if (!map[batch.subject]) map[batch.subject] = [];
      map[batch.subject].push(batch);
    });

    return map;
  }, [batches]);

  const totalBatchesOffering = useMemo(() => {
    return batches.filter((b) => b.subject).length;
  }, [batches]);

  const classList = useMemo(() => {
    const unique = new Set(
      subjects.map((s) => s.className).filter(Boolean)
    );
    return [...unique].sort();
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const searchMatch =
        !search ||
        subject.name.toLowerCase().includes(search.toLowerCase()) ||
        (subject.teacher || "").toLowerCase().includes(search.toLowerCase()) ||
        (subject.className || "").toLowerCase().includes(search.toLowerCase());

      const classMatch =
        !selectedClass || subject.className === selectedClass;

      return searchMatch && classMatch;
    });
  }, [subjects, search, selectedClass]);

  const openAddModal = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setEditingSubject(null);
    setIsFormOpen(false);
  };

  const handleSave = async (subjectData) => {
    try {
      if (editingSubject) {
        await editSubject({ ...editingSubject, ...subjectData });
      } else {
        await addSubject(subjectData);
      }
      closeFormModal();
    } catch (err) {
      alert(`Could not save subject: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (confirmDelete) {
      try {
        await deleteSubject(id);
      } catch (err) {
        alert(`Could not delete subject: ${err.message}`);
      }
    }
  };

  const handleExportCsv = () => {
    const header = ["Subject", "Class", "Teacher", "Description", "Status"];

    const rows = subjects.map((s) => [
      s.name,
      s.className || "",
      s.teacher || "",
      s.description || "",
      s.status,
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
    link.download = "subject-list.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">

      <PageHeader
        title="Subjects"
        subtitle="Manage the subjects taught across your classes."
        buttonText="Add Subject"
        buttonIcon={Plus}
        onButtonClick={openAddModal}
      />

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
        <ClassFilterBar
          classes={classList}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
        />
      </div>

      <div className="mt-6">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects by name, class or teacher..."
        />
      </div>

      <div className="grid grid-cols-12 gap-8 mt-8">

        {/* Left — Subject cards */}

        <div className="col-span-12 lg:col-span-9">

          {filteredSubjects.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm text-center py-20">
              <BookOpen size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 font-semibold text-slate-600">
                No subjects found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try a different search or add a new subject.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSubjects.map((subject) => {
                const subjectBatches = batchesBySubject[subject.name] || [];

                const studentsCount = subjectBatches.reduce(
                  (sum, b) => sum + (parseInt(b.enrolled) || 0),
                  0
                );

                return (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    batchesCount={subjectBatches.length}
                    studentsCount={studentsCount}
                    onView={setViewingSubject}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}

        </div>

        {/* Right — Curriculum insights */}

        <div className="col-span-12 lg:col-span-3">
          <CurriculumInsights
            subjects={subjects}
            totalBatchesOffering={totalBatchesOffering}
            onExportCsv={handleExportCsv}
          />
        </div>

      </div>

      <SubjectModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        onSave={handleSave}
        initialData={editingSubject}
      />

      <SubjectDetailModal
        isOpen={Boolean(viewingSubject)}
        onClose={() => setViewingSubject(null)}
        subject={viewingSubject}
        batches={
          viewingSubject ? batchesBySubject[viewingSubject.name] || [] : []
        }
      />

    </div>
  );
}
