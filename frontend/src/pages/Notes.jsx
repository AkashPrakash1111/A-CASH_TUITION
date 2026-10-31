import { useMemo, useState } from "react";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";

import ClassSelector from "../components/notes/ClassSelector";
import NoteUploadPanel from "../components/notes/NoteUploadPanel";
import NoteCard from "../components/notes/NoteCard";
import NoteReaderModal from "../components/notes/NoteReaderModal";

import useNotes from "../hooks/useNotes";
import useBatches from "../hooks/useBatches";
import useSubjects from "../hooks/useSubjects";
import useStudentUploads from "../hooks/useStudentUploads";
import { useAuth } from "../hooks/useAuth";

import AnnotationCanvas from "../components/notes/AnnotationCanvas";
import { PenTool } from "lucide-react";

export default function Notes() {
  const { notes, addNote, deleteNote } = useNotes();
  const { batches } = useBatches();
  const { subjects } = useSubjects();
  const { user } = useAuth();

  const [tab, setTab] = useState("class"); // "class" | "students"
  const {
    uploads,
    loading: uploadsLoading,
    error: uploadsError,
    reload: reloadUploads,
    removeUpload,
  } = useStudentUploads(tab === "students");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");

  const [annotatingNote, setAnnotatingNote] = useState(null);
  const [readingNote, setReadingNote] = useState(null);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  const classList = useMemo(() => {
    return [...new Set(batches.map((b) => b.className))];
  }, [batches]);

  const subjectList = useMemo(() => {
    return subjects.map((s) => s.name || s.subjectName || "").filter(Boolean);
  }, [subjects]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const classMatch = !selectedClass || note.className === selectedClass;
      const subjectMatch = !selectedSubject || note.subject === selectedSubject;
      const searchMatch = !search || note.title.toLowerCase().includes(search.toLowerCase());
      return classMatch && subjectMatch && searchMatch;
    });
  }, [notes, selectedClass, selectedSubject, search]);

  const filteredUploads = useMemo(() => {
    const q = search.toLowerCase();
    return uploads.filter((n) => {
      const classMatch = !selectedClass || n.className === selectedClass;
      const subjectMatch = !selectedSubject || n.subject === selectedSubject;
      const searchMatch =
        !search ||
        n.title.toLowerCase().includes(q) ||
        (n.uploadedBy || "").toLowerCase().includes(q);
      return classMatch && subjectMatch && searchMatch;
    });
  }, [uploads, selectedClass, selectedSubject, search]);

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Notes"
            subtitle="Upload and manage study materials."
          />
          <button
            onClick={() => setWhiteboardOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow-md transition active:scale-95"
          >
            <PenTool size={16} /> Open Whiteboard Studio
          </button>
        </div>

        <div className="mt-6">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "students" ? "Search by title or student name..." : "Search notes..."}
          />
        </div>

        <div className="mt-6 inline-flex rounded-2xl bg-slate-100 p-1" role="tablist" aria-label="Notes source">
          {[
            { id: "class", label: "Class notes" },
            { id: "students", label: "Student uploads" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                tab === t.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8 mt-8">
          {/* Left */}
          <div className="col-span-3">
            <ClassSelector
              classes={classList}
              subjects={subjectList}
              batches={batches}
              selectedClass={selectedClass}
              selectedSubject={selectedSubject}
              onClassChange={setSelectedClass}
              onSubjectChange={setSelectedSubject}
            />
          </div>

          {/* Right */}
          <div className="col-span-9">
            {tab === "class" ? (
              <>
            <NoteUploadPanel
              onUpload={addNote}
              selectedClass={selectedClass}
              selectedSubject={selectedSubject}
              classes={classList}
              subjects={subjectList}
            />

            <div className="grid lg:grid-cols-2 gap-6 mt-8">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpenReader={(n) => setReadingNote(n)}
                  onAnnotate={(n) => setAnnotatingNote(n)}
                  onDelete={(id) => deleteNote(id)}
                  canDelete={true}
                />
              ))}

              {filteredNotes.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 p-8">
                  <p className="font-semibold text-sm">No notes available in this category.</p>
                  <p className="text-xs text-slate-400 mt-1">Upload notes above to publish to students.</p>
                </div>
              )}
            </div>
              </>
            ) : (
              <>
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredUploads.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpenReader={(n) => setReadingNote(n)}
                  canDelete={user?.role === "admin"}
                  onDelete={(id) => removeUpload(id).catch((err) => alert(`Could not delete: ${err.message}`))}
                />
              ))}

              {uploadsError && (
                <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-100">
                  <p className="text-sm font-semibold text-rose-600">{uploadsError}</p>
                  <button
                    type="button"
                    onClick={reloadUploads}
                    className="mt-3 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!uploadsError && !uploadsLoading && filteredUploads.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 p-8">
                  <p className="font-semibold text-sm">
                    {uploads.length === 0 ? "No students have uploaded anything yet." : "No student uploads match your filters."}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Use the class and subject filters on the left to narrow this list.
                  </p>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        </div>
      </div>

      {readingNote && (
        <NoteReaderModal
          note={readingNote}
          isOpen={Boolean(readingNote)}
          onClose={() => setReadingNote(null)}
          onAnnotate={(n) => setAnnotatingNote(n)}
        />
      )}

      {annotatingNote && (
        <AnnotationCanvas
          note={annotatingNote}
          isOpen={Boolean(annotatingNote)}
          onClose={() => setAnnotatingNote(null)}
        />
      )}

      {whiteboardOpen && (
        <AnnotationCanvas
          note={{ id: "whiteboard-faculty", title: "Whiteboard Studio" }}
          isOpen={whiteboardOpen}
          onClose={() => setWhiteboardOpen(false)}
        />
      )}
    </>
  );
}