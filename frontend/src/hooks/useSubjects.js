import { useEffect, useState } from "react";
import { subjectsApi } from "../services/api";
import { useAuth } from "./useAuth";

function normalizeSubject(s) {
  if (!s) return s;
  const resolved = s.name || s.subjectName || "";
  return {
    ...s,
    name: resolved,
    subjectName: resolved,
  };
}

export default function useSubjects() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    subjectsApi
      .list(token)
      .then((data) => setSubjects(Array.isArray(data) ? data.map(normalizeSubject) : []))
      .catch((err) => console.error("Failed to load subjects:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const addSubject = async (subject) => {
    const created = await subjectsApi.create(token, subject);
    const normalized = normalizeSubject(created);
    setSubjects((prev) => [normalized, ...prev]);
    return normalized;
  };

  const editSubject = async (updatedSubject) => {
    const saved = await subjectsApi.update(token, updatedSubject.id, updatedSubject);
    const normalized = normalizeSubject(saved);
    setSubjects((prev) =>
      prev.map((subject) => (subject.id === normalized.id ? normalized : subject))
    );
    return normalized;
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
