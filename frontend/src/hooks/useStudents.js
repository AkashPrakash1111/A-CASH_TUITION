import { useState, useEffect } from "react";
import initialStudents from "../data/students";

export default function useStudents() {
  // Load students from localStorage on first render
  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem("students");

    if (savedStudents) {
      return JSON.parse(savedStudents);
    }

    return initialStudents;
  });

  // Save students whenever they change
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  const addStudent = (student) => {
    const newStudent = {
      id: Date.now(),
      ...student,
    };

    setStudents((prev) => [...prev, newStudent]);
  };

  const editStudent = (updatedStudent) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };

  const deleteStudent = (id) => {
    setStudents((prev) =>
      prev.filter((student) => student.id !== id)
    );
  };

  return {
    students,
    addStudent,
    editStudent,
    deleteStudent,
  };
}