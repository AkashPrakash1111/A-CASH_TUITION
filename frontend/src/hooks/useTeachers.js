import { useEffect, useState } from "react";
import { teachersApi } from "../services/api";
import { useAuth } from "./useAuth";

export default function useTeachers() {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    teachersApi
      .list(token)
      .then(setTeachers)
      .catch((err) => console.error("Failed to load teachers:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const addTeacher = async (teacher) => {
    const created = await teachersApi.create(token, teacher);
    setTeachers((prev) => [created, ...prev]);
    return created;
  };

  const editTeacher = async (updatedTeacher) => {
    const saved = await teachersApi.update(token, updatedTeacher.id, updatedTeacher);
    setTeachers((prev) =>
      prev.map((teacher) => (teacher.id === saved.id ? saved : teacher))
    );
    return saved;
  };

  const deleteTeacher = async (id) => {
    await teachersApi.remove(token, id);
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
  };

  return {
    teachers,
    loading,
    addTeacher,
    editTeacher,
    deleteTeacher,
  };
}
