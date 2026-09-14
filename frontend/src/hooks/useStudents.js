import { useEffect, useState } from "react";
import { studentsApi } from "../services/api";
import { useAuth } from "./useAuth";

export default function useStudents() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    studentsApi
      .list(token)
      .then(setStudents)
      .catch((err) => console.error("Failed to load students:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const addStudent = async (student) => {
    const created = await studentsApi.create(token, student);
    setStudents((prev) => [created, ...prev]);
    return created;
  };

  const editStudent = async (updatedStudent) => {
    const saved = await studentsApi.update(token, updatedStudent.id, updatedStudent);
    setStudents((prev) =>
      prev.map((student) => (student.id === saved.id ? saved : student))
    );
    return saved;
  };

  const deleteStudent = async (id) => {
    await studentsApi.remove(token, id);
    setStudents((prev) => prev.filter((student) => student.id !== id));
  };

  return {
    students,
    loading,
    addStudent,
    editStudent,
    deleteStudent,
  };
}
