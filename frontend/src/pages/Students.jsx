import { useState } from "react";
import useStudents from "../hooks/useStudents";

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

  // Open Add Modal
  const handleAdd = () => {
    setSelectedStudent(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Save (Add or Edit)
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

  // Delete Student
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (confirmDelete) {
      deleteStudent(id);
    }
  };

  return (
    <div className="p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Students
          </h1>

          <p className="text-gray-500 mt-2">
            Manage all students in your tuition portal.
          </p>

        </div>

        <button
          onClick={handleAdd}
          className="bg-[#008388] text-white px-6 py-3 rounded-xl hover:opacity-90"
        >
          + Add Student
        </button>

      </div>

      {/* Table */}

      <StudentTable
        students={students}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}

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