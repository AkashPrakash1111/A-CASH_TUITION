import { useState } from "react";

const STORAGE_KEY = "acash_exams";

export default function useExams() {
  const [exams, setExams] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const save = (updatedExams) => {
    setExams(updatedExams);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedExams)
    );
  };

  // Add New Exam
  const addExam = (exam) => {
    const newExam = {
      id: crypto.randomUUID(),

      examName: exam.examName,

      examType: exam.examType || "Unit Test",

      description: exam.description || "",

      className: exam.className,

      subject: exam.subject,

      examDate: exam.examDate,

      startTime: exam.startTime || "",

      duration: exam.duration || "",

      maxMarks: exam.maxMarks || "",

      passingMarks: exam.passingMarks || "",

      createdBy: exam.createdBy || "Admin",

      createdAt: new Date().toLocaleString(),

      resultsPublished: false,
    };

    save([newExam, ...exams]);
  };

  // Update Existing Exam
  const editExam = (updatedExam) => {
    const updated = exams.map((exam) =>
      exam.id === updatedExam.id
        ? { ...exam, ...updatedExam }
        : exam
    );

    save(updated);
  };

  // Delete Exam
  const deleteExam = (id) => {
    const updated = exams.filter(
      (exam) => exam.id !== id
    );

    save(updated);
  };

  // Toggle whether results have been published for an exam
  const togglePublished = (id) => {
    const updated = exams.map((exam) =>
      exam.id === id
        ? { ...exam, resultsPublished: !exam.resultsPublished }
        : exam
    );

    save(updated);
  };

  // Derive a live status from date/time/duration so it never goes stale
  const getStatus = (exam) => {
    if (!exam.examDate) return "Upcoming";

    const now = new Date();

    const start = new Date(
      `${exam.examDate}T${exam.startTime || "00:00"}`
    );

    let end;

    if (exam.startTime && exam.duration) {
      end = new Date(
        start.getTime() + Number(exam.duration) * 60000
      );
    } else {
      // No precise time window — treat the whole day as the exam window
      end = new Date(exam.examDate);
      end.setHours(23, 59, 59, 999);
    }

    if (now.getTime() < start.getTime()) return "Upcoming";
    if (now.getTime() <= end.getTime()) return "Ongoing";
    return "Completed";
  };

  return {
    exams,

    addExam,

    editExam,

    deleteExam,

    togglePublished,

    getStatus,
  };
}
