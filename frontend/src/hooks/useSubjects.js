import { useEffect, useState } from "react";
import initialSubjects from "../data/subjects";

export default function useSubjects() {
  const [subjects, setSubjects] = useState(() => {
    const savedSubjects = localStorage.getItem("subjects");

    if (savedSubjects) {
      return JSON.parse(savedSubjects);
    }

    return initialSubjects;
  });

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = (subject) => {
    const newSubject = {
      id: Date.now(),
      ...subject,
    };

    setSubjects((prev) => [...prev, newSubject]);
  };

  const editSubject = (updatedSubject) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === updatedSubject.id ? updatedSubject : subject
      )
    );
  };

  const deleteSubject = (id) => {
    setSubjects((prev) =>
      prev.filter((subject) => subject.id !== id)
    );
  };

  return {
    subjects,
    addSubject,
    editSubject,
    deleteSubject,
  };
}