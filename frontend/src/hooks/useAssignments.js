import { useState, useEffect, useCallback } from "react";
import { assignmentsApi } from "../services/api";
import { useAuth } from "./useAuth";
import { isPastDue } from "../components/assignments/assignmentHelpers";

// The offline cache is kept per user, so the next person to log in on the same
// browser can't briefly see the previous user's assignments.
const storageKey = (userId) => (userId ? `acash_assignments_${userId}` : null);

try {
  localStorage.removeItem("acash_assignments"); // old shared cache
} catch {
  // storage unavailable
}

function saveCache(userId, list) {
  try {
    const key = storageKey(userId);
    if (key) localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // the cache is optional
  }
}

export default function useAssignments() {
  const { token, user } = useAuth();
  const userId = user?.id;
  const [assignments, setAssignments] = useState(() => {
    try {
      const key = storageKey(userId);
      const stored = key ? localStorage.getItem(key) : null;
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await assignmentsApi.list(token);
      if (Array.isArray(data)) {
        const mapped = data.map((a) => ({
          ...a,
          id: a.id,
          title: a.title,
          description: a.description || "",
          className: a.className || "",
          batch: a.batch || "",
          subject: a.subject || "",
          dueDate: a.dueDate || "",
          maxMarks: a.maxMarks || "",
          attachments: Array.isArray(a.attachments) ? a.attachments : [],
          createdBy: a.createdBy || "Faculty",
          createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString() : "Recently",
          submissionsCount: a.submissions_count || 0,
        }));
        setAssignments(mapped);
        saveCache(userId, mapped);
      }
    } catch (err) {
      console.warn("Could not fetch assignments from backend, using cache", err);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Add New Assignment
  const addAssignment = async (assignment) => {
    if (token) {
      try {
        const payload = {
          title: assignment.title,
          description: assignment.description || "",
          className: assignment.className || "",
          subject: assignment.subject || "",
          batch: assignment.batch || "",
          dueDate: assignment.dueDate || "",
          maxMarks: String(assignment.maxMarks || "100"),
          attachments: assignment.attachments || [],
        };
        const res = await assignmentsApi.create(token, payload);
        if (res && res.id) {
          await fetchAssignments();
          return res;
        }
      } catch (err) {
        console.warn("Could not create assignment on backend:", err);
        throw err;
      }
    }
  };

  // Update Assignment
  const editAssignment = async (updated) => {
    if (token && typeof updated.id === "number") {
      try {
        const payload = {
          title: updated.title,
          description: updated.description || "",
          className: updated.className || "",
          subject: updated.subject || "",
          batch: updated.batch || "",
          dueDate: updated.dueDate || "",
          maxMarks: String(updated.maxMarks || "100"),
          attachments: updated.attachments || [],
        };
        await assignmentsApi.update(token, updated.id, payload);
        await fetchAssignments();
      } catch (err) {
        console.warn("Could not update assignment on backend:", err);
        throw err;
      }
    }
  };

  // Delete Assignment
  const deleteAssignment = async (id) => {
    if (token && typeof id === "number") {
      try {
        await assignmentsApi.remove(token, id);
        await fetchAssignments();
      } catch (err) {
        console.warn("Could not delete assignment on backend:", err);
      }
    }
  };

  const getStatus = (assignment) => {
    if ((assignment?.status || "").toLowerCase() === "closed") return "Closed";
    return isPastDue(assignment?.dueDate) ? "Overdue" : "Active";
  };

  return {
    assignments,
    loading,
    addAssignment,
    editAssignment,
    deleteAssignment,
    getStatus,
    refreshAssignments: fetchAssignments,
  };
}
