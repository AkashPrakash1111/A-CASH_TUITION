import { useMemo, useState } from "react";
import { Plus, Layers3, LayoutGrid, CalendarRange } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";

import ClassFilterBar from "../components/batches/ClassFilterBar";
import BatchCard from "../components/batches/BatchCard";
import BatchModal from "../components/batches/BatchModal";
import BatchDetailModal from "../components/batches/BatchDetailModal";
import BatchInsights from "../components/batches/BatchInsights";
import WeeklyTimetable from "../components/batches/WeeklyTimetable";

import useBatches from "../hooks/useBatches";
import useStudents from "../hooks/useStudents";

export default function Batches() {
  const { batches, addBatch, editBatch, deleteBatch } = useBatches();
  const { students } = useStudents();

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [view, setView] = useState("cards"); // "cards" | "timetable"

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const [viewingBatch, setViewingBatch] = useState(null);

  // Students enrolled in each batch, grouped by batch name — real data
  // from the Students module rather than a fabricated roster.
  const studentsByBatch = useMemo(() => {
    const map = {};

    students.forEach((student) => {
      if (!student.batch) return;
      if (!map[student.batch]) map[student.batch] = [];
      map[student.batch].push(student);
    });

    return map;
  }, [students]);

  const classList = useMemo(() => {
    const unique = new Set(
      batches.map((b) => b.className).filter(Boolean)
    );
    return [...unique].sort();
  }, [batches]);

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const searchMatch =
        !search ||
        batch.batchName.toLowerCase().includes(search.toLowerCase()) ||
        (batch.subject || "").toLowerCase().includes(search.toLowerCase()) ||
        (batch.teacher || "").toLowerCase().includes(search.toLowerCase()) ||
        (batch.className || "").toLowerCase().includes(search.toLowerCase());

      const classMatch =
        !selectedClass || batch.className === selectedClass;

      return searchMatch && classMatch;
    });
  }, [batches, search, selectedClass]);

  const openAddModal = () => {
    setEditingBatch(null);
    setIsFormOpen(true);
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setEditingBatch(null);
    setIsFormOpen(false);
  };

  const handleSave = async (batchData) => {
    try {
      if (editingBatch) {
        await editBatch({ ...editingBatch, ...batchData });
      } else {
        await addBatch(batchData);
      }
      closeFormModal();
    } catch (err) {
      alert(`Could not save batch: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this batch?");

    if (confirmDelete) {
      try {
        await deleteBatch(id);
      } catch (err) {
        alert(`Could not delete batch: ${err.message}`);
      }
    }
  };

  const handleExportCsv = () => {
    const header = [
      "Batch",
      "Class",
      "Subject",
      "Teacher",
      "Days",
      "Time",
      "Enrolled",
      "Capacity",
      "Status",
    ];

    const rows = batches.map((b) => [
      b.batchName,
      b.className || "",
      b.subject || "",
      b.teacher || "",
      b.days || "",
      b.time || "",
      b.enrolled || "",
      b.capacity || "",
      b.status,
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
    link.download = "batch-list.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">

      <PageHeader
        title="Batches"
        subtitle="Manage all tuition batches and track seat occupancy."
        buttonText="Add Batch"
        buttonIcon={Plus}
        onButtonClick={openAddModal}
      />

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
        <ClassFilterBar
          classes={classList}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
        />

        <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 shrink-0">
          <button
            onClick={() => setView("cards")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              view === "cards"
                ? "bg-white text-[#008388] shadow-sm"
                : "text-slate-500"
            }`}
          >
            <LayoutGrid size={15} />
            Cards
          </button>

          <button
            onClick={() => setView("timetable")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              view === "timetable"
                ? "bg-white text-[#008388] shadow-sm"
                : "text-slate-500"
            }`}
          >
            <CalendarRange size={15} />
            Timetable
          </button>
        </div>
      </div>

      <div className="mt-6">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search batches by name, class, subject or teacher..."
        />
      </div>

      {view === "timetable" ? (

        <div className="mt-8">

          {filteredBatches.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm text-center py-20">
              <Layers3 size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 font-semibold text-slate-600">
                No batches found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try a different search or add a new batch.
              </p>
            </div>
          ) : (
            <WeeklyTimetable
              batches={filteredBatches}
              onView={setViewingBatch}
            />
          )}

        </div>

      ) : (

        <div className="grid grid-cols-12 gap-8 mt-8">

          {/* Left — Batch cards */}

          <div className="col-span-12 lg:col-span-9">

            {filteredBatches.length === 0 ? (
              <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm text-center py-20">
                <Layers3 size={40} className="mx-auto text-slate-300" />
                <p className="mt-4 font-semibold text-slate-600">
                  No batches found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different search or add a new batch.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    onView={setViewingBatch}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

          </div>

          {/* Right — Batch insights */}

          <div className="col-span-12 lg:col-span-3">
            <BatchInsights
              batches={batches}
              onExportCsv={handleExportCsv}
            />
          </div>

        </div>

      )}

      <BatchModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        onSave={handleSave}
        initialData={editingBatch}
      />

      <BatchDetailModal
        isOpen={Boolean(viewingBatch)}
        onClose={() => setViewingBatch(null)}
        batch={viewingBatch}
        students={
          viewingBatch ? studentsByBatch[viewingBatch.batchName] || [] : []
        }
      />

    </div>
  );
}
