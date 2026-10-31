import { useState, useEffect, useCallback } from "react";
import { examsApi } from "../services/api";
import { useAuth } from "./useAuth";
import { normalizeExam, examStatus } from "../utils/examUtils";

const STORAGE_KEY = "acash_exams";

export default function useExams() {
  const { token, user } = useAuth();
  const [exams, setExams] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);

  const fetchExams = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await examsApi.list(token);
      if (Array.isArray(data)) {
        const mapped = data.map((e) => ({
          ...normalizeExam(e),
          createdBy: e.teacher_name || e.createdBy || "Faculty",
          resultsPublished: e.results_published || e.resultsPublished || false,
        }));
        setExams(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn("Could not fetch exams from backend, using cache", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const saveLocal = (updated) => {
    setExams(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Add New Exam
  const addExam = async (exam) => {
    const localExam = {
      id: crypto.randomUUID(),
      examName: exam.examName || exam.title,
      title: exam.examName || exam.title,
      examType: exam.examType || "Unit Test",
      description: exam.description || "",
      className: exam.className || "",
      subject: exam.subject || "",
      examDate: exam.examDate || "",
      startTime: exam.startTime || "10:00 AM",
      duration: exam.duration || "60 mins",
      duration_minutes: parseInt(exam.duration) || 60,
      maxMarks: exam.maxMarks || 100,
      total_marks: exam.maxMarks || 100,
      passingMarks: exam.passingMarks || 40,
      passing_marks: exam.passingMarks || 40,
      questionPaperUrl: exam.questionPaperUrl || null,
      createdBy: user?.name || "Faculty",
      createdAt: new Date().toLocaleDateString(),
      resultsPublished: false,
      questions: exam.questions || [],
    };

    saveLocal([localExam, ...exams]);

    if (token) {
      try {
        const mappedQuestions = (exam.questions || []).map((q, idx) => ({
          questionText: q.questionText || q.question_text || "",
          questionType: q.questionType || q.question_type || "mcq",
          optionsJson: typeof q.optionsJson === "string" ? q.optionsJson : JSON.stringify(q.options || []),
          correctAnswer: q.correctAnswer || q.correct_answer || "",
          marks: String(q.marks || 1),
          explanation: q.explanation || "",
          sortOrder: idx + 1,
        }));

        const payload = {
          examName: exam.examName || exam.title,
          title: exam.examName || exam.title,
          description: exam.description || "",
          subject: exam.subject || "",
          className: exam.className || "",
          batch: exam.batch || exam.className || "",
          total_marks: Number(exam.maxMarks) || 100,
          maxMarks: String(exam.maxMarks || 100),
          passing_marks: Number(exam.passingMarks) || 40,
          passingMarks: String(exam.passingMarks || 40),
          duration_minutes: parseInt(exam.duration) || 60,
          duration: String(parseInt(exam.duration) || 60),
          scheduled_date: exam.examDate || "",
          examDate: exam.examDate || "",
          startTime: exam.startTime || "10:00 AM",
          exam_type: exam.examType || "Unit Test",
          examType: exam.examType || "Unit Test",
          questionPaperUrl: exam.questionPaperUrl || null,
          creationMethod: exam.creationMethod || "manual",
          extractionStatus: "verified",
          questions: mappedQuestions,
        };
        const res = await examsApi.create(token, payload);
        if (res && res.id) {
          fetchExams();
        }
      } catch (err) {
        console.warn("Could not create exam on backend:", err);
      }
    }
  };

  // Update Existing Exam
  const editExam = async (updatedExam) => {
    const updated = exams.map((exam) =>
      exam.id === updatedExam.id ? { ...exam, ...updatedExam } : exam
    );
    saveLocal(updated);

    if (token && typeof updatedExam.id === "number") {
      try {
        const mappedQuestions = (updatedExam.questions || []).map((q, idx) => ({
          questionText: q.questionText || q.question_text || "",
          questionType: q.questionType || q.question_type || "mcq",
          optionsJson: typeof q.optionsJson === "string" ? q.optionsJson : JSON.stringify(q.options || []),
          correctAnswer: q.correctAnswer || q.correct_answer || "",
          marks: String(q.marks || 1),
          explanation: q.explanation || "",
          sortOrder: idx + 1,
        }));

        await examsApi.update(token, updatedExam.id, {
          examName: updatedExam.examName || updatedExam.title,
          title: updatedExam.examName || updatedExam.title,
          description: updatedExam.description || "",
          examType: updatedExam.examType || "Unit Test",
          examDate: updatedExam.examDate || "",
          startTime: updatedExam.startTime || "10:00 AM",
          className: updatedExam.className || "",
          batch: updatedExam.batch || updatedExam.className || "",
          subject: updatedExam.subject || "",
          total_marks: Number(updatedExam.maxMarks) || 100,
          maxMarks: String(updatedExam.maxMarks || 100),
          passing_marks: Number(updatedExam.passingMarks) || 40,
          passingMarks: String(updatedExam.passingMarks || 40),
          duration_minutes: parseInt(updatedExam.duration) || 60,
          duration: String(parseInt(updatedExam.duration) || 60),
          questionPaperUrl: updatedExam.questionPaperUrl || null,
          questions: mappedQuestions,
        });
        fetchExams();
      } catch (err) {
        console.warn("Could not update exam on backend:", err);
      }
    }
  };

  // Delete Exam
  const deleteExam = async (id) => {
    const updated = exams.filter((exam) => exam.id !== id);
    saveLocal(updated);

    if (token && typeof id === "number") {
      try {
        await examsApi.delete(token, id);
      } catch (err) {
        console.warn("Could not delete exam on backend:", err);
      }
    }
  };

  const getStatus = (exam) => examStatus(exam);

  return {
    exams,
    loading,
    addExam,
    editExam,
    deleteExam,
    getStatus,
    refreshExams: fetchExams,
  };
}
