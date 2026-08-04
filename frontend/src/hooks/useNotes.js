import { useState } from "react";

const STORAGE_KEY = "acash_notes";

export default function useNotes() {
  const [notes, setNotes] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const save = (updatedNotes) => {
    setNotes(updatedNotes);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedNotes)
    );
  };

  // Add New Note
  const addNote = (note) => {
    const newNote = {
      id: crypto.randomUUID(),

      className: note.className,

      subject: note.subject,

      title: note.title,

      description: note.description || "",

      type: note.type, // pdf | image | text

      fileName: note.fileName || "",

      fileUrl: note.fileUrl || "",

      textContent: note.textContent || "",

      uploadedBy: note.uploadedBy || "Admin",

      uploadedAt: new Date().toLocaleString(),

      status: "Published",
    };

    save([...notes, newNote]);
  };

  // Update Existing Note
  const editNote = (updatedNote) => {
    const updated = notes.map((note) =>
      note.id === updatedNote.id
        ? updatedNote
        : note
    );

    save(updated);
  };

  // Delete Note
  const deleteNote = (id) => {
    const updated = notes.filter(
      (note) => note.id !== id
    );

    save(updated);
  };

  // Search Notes
  const searchNotes = (query) => {
    if (!query) return notes;

    return notes.filter((note) => {
      const text = query.toLowerCase();

      return (
        note.title.toLowerCase().includes(text) ||
        note.subject.toLowerCase().includes(text) ||
        note.className.toLowerCase().includes(text) ||
        note.uploadedBy.toLowerCase().includes(text)
      );
    });
  };

  // Filter Notes
  const filterNotes = ({
    className,
    subject,
  }) => {
    return notes.filter((note) => {
      const classMatch =
        !className ||
        note.className === className;

      const subjectMatch =
        !subject ||
        note.subject === subject;

      return classMatch && subjectMatch;
    });
  };

  return {
    notes,

    addNote,

    editNote,

    deleteNote,

    searchNotes,

    filterNotes,
  };
}