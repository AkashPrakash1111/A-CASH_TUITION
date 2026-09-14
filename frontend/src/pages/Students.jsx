import { useMemo, useState } from "react";
import { Search, Plus, ChevronRight } from "lucide-react";
import useStudents from "../hooks/useStudents";
import { useAuth } from "../hooks/useAuth";
import { adminApi } from "../services/api";
import StudentTable from "../components/students/StudentTable";
import StudentStatsPanel from "../components/students/StudentStatsPanel";
import Pagination from "../components/students/Pagination";
import StudentModal from "../components/students/StudentModal";

const PAGE_SIZE = 8;

export default function Students() {
  const {
    students,
    addStudent,
    editStudent,
    deleteStudent,
  } = useStudents();

  const { token } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  // Options are derived from real data rather than hardcoded, so the
  // filters always match whatever classes/batches actually exist.
  const classOptions = useMemo(
    () => [...new Set(students.map((s) => s.className).filter(Boolean))].sort(),
    [students]
  );
  const batchOptions = useMemo(
    () => [...new Set(students.map((s) => s.batch).filter(Boolean))].sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(term) ||
        (student.parent || "").toLowerCase().includes(term) ||
        (student.phone || "").toLowerCase().includes(term);

      const matchesClass = !classFilter || student.className === classFilter;
      const matchesBatch = !batchFilter || student.batch === batchFilter;
      const matchesStatus = !statusFilter || student.status === statusFilter;

      return matchesSearch && matchesClass && matchesBatch && matchesStatus;
    });
  }, [students, searchTerm, classFilter, batchFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const pagedStudents = filteredStudents.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reset to page 1 whenever a filter/search actually narrows the results,
  // so you don't land on an empty "page 3" after filtering down to 2 results.
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleAdd = () => {
    setSelectedStudent(null);
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleSave = async (studentData) => {
    setSaving(true);

    if (selectedStudent) {
      try {
        await editStudent({
          ...selectedStudent,
          ...studentData,
        });
        setShowModal(false);
        setSelectedStudent(null);
      } catch (err) {
        alert(`Could not update student: ${err.message}`);
      } finally {
        setSaving(false);
      }
      return;
    }

    const { password, ...rosterData } = studentData;

    try {
      await adminApi.createUser(token, {
        name: studentData.name,
        email: studentData.email,
        password,
        role: "student",
      });

      await addStudent(rosterData);
      setShowModal(false);
      setSelectedStudent(null);
    } catch (err) {
      alert(`Could not create student: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
      } catch (err) {
        alert(`Could not delete student: ${err.message}`);
      }
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <span>Dashboard</span>
            <ChevronRight size={12} />
            <span className="text-[#008388] font-medium">Students</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-500 mt-1.5">
            Manage and track all student information.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#008388] to-cyan-500 text-white font-medium px-5 py-3 shadow-[0_10px_25px_rgba(0,131,136,0.25)] hover:shadow-[0_14px_32px_rgba(0,131,136,0.35)] transition-all"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name or phone..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)}
            className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#008388]/20 focus:border-[#008388] transition"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => handleFilterChange(setClassFilter)(e.target.value)}
          className="border border-slate-200 rounded-2xl px-4 py-3 text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#008388]/20 focus:border-[#008388] transition bg-white"
        >
          <option value="">All Classes</option>
          {classOptions.map((c) => (
            <option key={c} value={c}>
              Class {c}
            </option>
          ))}
        </select>

        <select
          value={batchFilter}
          onChange={(e) => handleFilterChange(setBatchFilter)(e.target.value)}
          className="border border-slate-200 rounded-2xl px-4 py-3 text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#008388]/20 focus:border-[#008388] transition bg-white"
        >
          <option value="">All Batches</option>
          {batchOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
          className="border border-slate-200 rounded-2xl px-4 py-3 text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#008388]/20 focus:border-[#008388] transition bg-white"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Content: table + stats sidebar */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div>
          <StudentTable
            students={pagedStudents}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>

        <StudentStatsPanel students={students} />
      </div>

      <StudentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedStudent(null);
        }}
        onSave={handleSave}
        initialData={selectedStudent}
        saving={saving}
      />
    </div>
  );
}
