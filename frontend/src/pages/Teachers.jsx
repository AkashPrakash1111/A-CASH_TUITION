import React, { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import TeacherModal from "../components/teachers/TeacherModal";
import TeacherTable from "../components/teachers/TeacherTable";
import useTeachers from "../hooks/useTeachers";

export default function Teachers() {
  const {
    teachers,
    addTeacher,
    editTeacher,
    deleteTeacher,
  } = useTeachers();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const openAddModal = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTeacher(null);
    setIsModalOpen(false);
  };

  const handleSave = (teacherData) => {
    if (selectedTeacher) {
      editTeacher(teacherData);
    } else {
      addTeacher(teacherData);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (confirmDelete) {
      deleteTeacher(id);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(search.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(search.toLowerCase()) ||
    teacher.phone.includes(search)
  );

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-[#008388]">
            Teacher Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all teachers
          </p>
        </div>

        <Button onClick={openAddModal}>
          + Add Teacher
        </Button>

      </div>

      <Input
        placeholder="Search teacher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TeacherTable
        teachers={filteredTeachers}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <TeacherModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        teacher={selectedTeacher}
      />

    </div>
  );
}