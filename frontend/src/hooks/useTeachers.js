import { useEffect, useState } from "react";
import initialTeachers from "../data/teachers";

export default function useTeachers() {
  const [teachers, setTeachers] = useState(() => {
    const saved = localStorage.getItem("teachers");

    if (saved) {
      return JSON.parse(saved);
    }

    return initialTeachers;
  });

  useEffect(() => {
    localStorage.setItem("teachers", JSON.stringify(teachers));
  }, [teachers]);

  const addTeacher = (teacher) => {
    setTeachers((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...teacher,
      },
    ]);
  };

  const editTeacher = (updatedTeacher) => {
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === updatedTeacher.id
          ? updatedTeacher
          : teacher
      )
    );
  };

  const deleteTeacher = (id) => {
    setTeachers((prev) =>
      prev.filter((teacher) => teacher.id !== id)
    );
  };

  return {
    teachers,
    addTeacher,
    editTeacher,
    deleteTeacher,
  };
}