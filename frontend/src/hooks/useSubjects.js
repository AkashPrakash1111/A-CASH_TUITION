import { useEffect, useState } from "react";
import { subjectsApi } from "../services/api";
import { useAuth } from "./useAuth";

export default function useSubjects() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    subjectsApi
      .list(token)
      .then(setSubjects)
      .catch((err) => console.error("Failed to load subjects:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const addSubject = async (subject) => {
    const created = await subjectsApi.create(token, subject);
    setSubjects((prev) => [created, ...prev]);
    return created;
  };

  const editSubject = async (updatedSubject) => {
    const saved = await subjectsApi.update(token, updatedSubject.id, updatedSubject);
    setSubjects((prev) =>
      prev.map((subject) => (subject.id === saved.id ? saved : subject))
    );
    return saved;
  };

  const deleteSubject = async (id) => {
    await subjectsApi.remove(token, id);
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
  };

  return {
    subjects,
    loading,
    addSubject,
    editSubject,
    deleteSubject,
  };
}
