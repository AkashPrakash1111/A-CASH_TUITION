import { useMemo, useState } from "react";
import useStudents from "../hooks/useStudents";
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

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return students.filter((student) => {
      return (
        student.name.toLowerCase().includes(term) ||
        student.parent.toLowerCase().includes(term) ||
        student.phone.toLowerCase().includes(term)
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

  const handleSave = (studentData) => {
    if (selectedStudent) {
      editStudent({
        ...selectedStudent,
        ...studentData,
      });
    } else {
      addStudent(studentData);
    }

    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      deleteStudent(id);
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

      <div className="mb-6">
  <input
    type="text"
    placeholder="🔍 Search by name, parent or phone..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#008388]"
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
      />
    </div>
  );
}