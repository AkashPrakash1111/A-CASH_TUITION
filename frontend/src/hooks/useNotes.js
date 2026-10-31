import { useState, useEffect, useCallback } from "react";
import { notesApi } from "../services/api";
import { useAuth } from "./useAuth";

// The offline cache is per user. A single shared key meant the next person to
// log in on the same browser could briefly see the previous user's notes.
const storageKey = (userId) => (userId ? `acash_notes_${userId}` : null);

// Old shared cache from earlier versions: remove so it can't leak.
try {
  localStorage.removeItem("acash_notes");
} catch {
  // storage unavailable
}

function saveCache(userId, list) {
  try {
    const key = storageKey(userId);
    if (key) localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // storage full or unavailable; the cache is optional
  }
}

export default function useNotes() {
  const { token, user } = useAuth();
  const userId = user?.id;
  const [notes, setNotes] = useState(() => {
    try {
      const key = storageKey(userId);
      const stored = key ? localStorage.getItem(key) : null;
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync from backend
  const fetchNotes = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await notesApi.list(token);
      if (Array.isArray(data)) {
        // Normalize fields for UI compatibility
        const mapped = data.map((n) => ({
          ...n,
          id: n.id,
          title: n.title,
          description: n.description || "",
          className: n.className || "",
          subject: n.subject || "",
          batch: n.batch || "",
          type: n.type || "pdf",
          fileName: n.fileName || n.title,
          fileUrl: n.fileUrl || "",
          textContent: n.textContent || "",
          uploadedBy: n.uploadedBy || "Faculty",
          uploadedAt: n.created_at ? new Date(n.created_at).toLocaleDateString() : (n.uploadedAt || "Recently"),
          status: n.status || "Published",
        }));
        setNotes(mapped);
        saveCache(userId, mapped);
      }
    } catch (err) {
      console.warn("Could not fetch notes from server, using local cache", err);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const saveLocal = (updatedNotes) => {
    setNotes(updatedNotes);
    saveCache(userId, updatedNotes);
  };

  // Add New Note
  const addNote = async (note) => {
    if (token) {
      try {
        const payload = {
          title: note.title,
          description: note.description || "",
          className: note.className || "",
          subject: note.subject || "",
          batch: note.batch || "",
          type: note.type || "pdf",
          fileName: note.fileName || "",
          fileUrl: note.fileUrl || "",
          textContent: note.textContent || "",
          status: note.status || "Published",
        };
        const res = await notesApi.create(token, payload);
        if (res && res.id) {
          await fetchNotes();
          return res;
        }
      } catch (err) {
        console.warn("Could not save note to server:", err);
        throw err;
      }
    }
  };

  // Update Existing Note
  const editNote = async (updatedNote) => {
    if (token && typeof updatedNote.id === "number") {
      try {
        const payload = {
          title: updatedNote.title,
          description: updatedNote.description || "",
          className: updatedNote.className || "",
          subject: updatedNote.subject || "",
          batch: updatedNote.batch || "",
          type: updatedNote.type || "pdf",
          fileName: updatedNote.fileName || "",
          fileUrl: updatedNote.fileUrl || "",
          textContent: updatedNote.textContent || "",
          status: updatedNote.status || "Published",
        };
        await notesApi.update(token, updatedNote.id, payload);
        await fetchNotes();
      } catch (err) {
        console.warn("Could not update note on server:", err);
        throw err;
      }
    }
  };

  // Delete Note
  const deleteNote = async (id) => {
    if (token && typeof id === "number") {
      try {
        await notesApi.remove(token, id);
        await fetchNotes();
      } catch (err) {
        console.warn("Could not delete note on server:", err);
      }
    }
  };

  // Search Notes
  const searchNotes = (query) => {
    if (!query) return notes;
    const text = query.toLowerCase();
    return notes.filter((note) => {
      return (
        (note.title && note.title.toLowerCase().includes(text)) ||
        (note.subject && note.subject.toLowerCase().includes(text)) ||
        (note.className && note.className.toLowerCase().includes(text)) ||
        (note.uploadedBy && note.uploadedBy.toLowerCase().includes(text))
      );
    });
  };

  // Filter Notes
  const filterNotes = ({ className, subject }) => {
    return notes.filter((note) => {
      const classMatch = !className || note.className === className;
      const subjectMatch = !subject || note.subject === subject;
      return classMatch && subjectMatch;
    });
  };

  return {
    notes,
    loading,
    addNote,
    editNote,
    deleteNote,
    searchNotes,
    filterNotes,
    refreshNotes: fetchNotes,
  };
}