import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import useStudents from "../hooks/useStudents";
import { useAuth } from "../hooks/useAuth";
import { adminApi } from "../services/api";
import Button from "../components/ui/Button";
import StudentTable from "../components/students/StudentTable";
import StudentModal from "../components/students/StudentModal";

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
  const [saving, setSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return students.filter((student) => {
      return (
        student.name.toLowerCase().includes(term) ||
        (student.parent || "").toLowerCase().includes(term) ||
        (student.phone || "").toLowerCase().includes(term)
      );
    });
  }, [students, searchTerm]);

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
      // Editing never touches login credentials, so there's no backend
      // call to create a user here — just update the roster entry.
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

    // Adding a new student: create their real login account on the backend
    // first. Only save the roster entry if that actually succeeds —
    // otherwise we'd end up with a student who "exists" but can never log in.
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
      // modal stays open so the admin can fix the email/password and retry
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-gray-500 mt-2">
            Manage all students in your tuition portal.
          </p>
        </div>

        <Button onClick={handleAdd}>
  + Add Student
</Button>
      </div>

      {/* Search */}

      <div className="mb-6 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, parent or phone..."
          value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#008388]/20 focus:border-[#008388] transition"
        />
      </div>

      <StudentTable
        students={filteredStudents}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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