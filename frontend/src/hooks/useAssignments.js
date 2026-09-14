import { useState } from "react";

const STORAGE_KEY = "acash_assignments";

export default function useAssignments() {
  const [assignments, setAssignments] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const save = (updatedAssignments) => {
    setAssignments(updatedAssignments);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedAssignments)
    );
  };

  // Add New Assignment
  const addAssignment = (assignment) => {
    const newAssignment = {
      id: crypto.randomUUID(),

      title: assignment.title,

      description: assignment.description || "",

      className: assignment.className,

      subject: assignment.subject,

      dueDate: assignment.dueDate,

      maxMarks: assignment.maxMarks || "",

      fileName: assignment.fileName || "",

      fileUrl: assignment.fileUrl || "",

      createdBy: assignment.createdBy || "Admin",

      createdAt: new Date().toLocaleString(),

      submissionsCount: 0,

      totalStudents: assignment.totalStudents || 0,
    };

    save([newAssignment, ...assignments]);
  };

  // Update Existing Assignment
  const editAssignment = (updatedAssignment) => {
    const updated = assignments.map((assignment) =>
      assignment.id === updatedAssignment.id
        ? { ...assignment, ...updatedAssignment }
        : assignment
    );

    save(updated);
  };

  // Delete Assignment
  const deleteAssignment = (id) => {
    const updated = assignments.filter(
      (assignment) => assignment.id !== id
    );

    save(updated);
  };

  // Derive a live status from the due date so it never goes stale
  const getStatus = (assignment) => {
    if (!assignment.dueDate) return "Active";

    const due = new Date(assignment.dueDate);
    const now = new Date();

    // Compare by date only, so "due today" still counts as active
    due.setHours(23, 59, 59, 999);

    return due.getTime() < now.getTime() ? "Overdue" : "Active";
  };

  return {
    assignments,

    addAssignment,

    editAssignment,

    deleteAssignment,

    getStatus,
  };
}
