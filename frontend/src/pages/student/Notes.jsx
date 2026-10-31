import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  PenTool,
  Download,
  Clock,
  GraduationCap,
  Eye,
  Plus,
  Lock,
} from "lucide-react";
import useNotes from "../../hooks/useNotes";
import useSubjects from "../../hooks/useSubjects";
import useMyNotes from "../../hooks/useMyNotes";
import NoteCard from "../../components/notes/NoteCard";
import MyUploadModal from "../../components/notes/MyUploadModal";
import AnnotationCanvas from "../../components/notes/AnnotationCanvas";
import NoteReaderModal from "../../components/notes/NoteReaderModal";

export default function StudentNotes() {
  const { notes, loading } = useNotes();
  const { subjects } = useSubjects();
  const {
    myNotes,
    loading: myLoading,
    error: myError,
    retry: retryMyNotes,
    addMyNote,
    deleteMyNote,
  } = useMyNotes();

  const [tab, setTab] = useState("teachers"); // "teachers" | "mine"
  const [uploadOpen, setUploadOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Reader and Annotation Studio Modal state
  const [readingNote, setReadingNote] = useState(null);
  const [activeNoteForAnnotation, setActiveNoteForAnnotation] = useState(null);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  const subjectList = useMemo(() => {
    return subjects.map((s) => s.subjectName || s.name);
  }, [subjects]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const sMatch = selectedSubject === "all" || n.subject === selectedSubject;
      const q = search.toLowerCase();
      const qMatch =
        !search ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q));
      return sMatch && qMatch;
    });
  }, [notes, selectedSubject, search]);

  const filteredMine = useMemo(() => {
    const q = search.toLowerCase();
    return myNotes.filter((n) => {
      const sMatch = selectedSubject === "all" || n.subject === selectedSubject;
      const qMatch =
        !search ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q));
      return sMatch && qMatch;
    });
  }, [myNotes, selectedSubject, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles size={14} /> Knowledge Archives
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Study Materials & Notes</h1>
          <p className="text-slate-500 text-sm mt-1">
            Access lecture PDFs, study summaries, and annotate them directly in your interactive studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWhiteboardOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow-md transition active:scale-95"
          >
            <PenTool size={16} /> Open Whiteboard Scratchpad
          </button>
        </div>
      </div>

      {/* Teacher notes vs. the student's own private uploads */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1" role="tablist" aria-label="Notes source">
          {[
            { id: "teachers", label: "From my teachers" },
            { id: "mine", label: "My uploads" },
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

        {tab === "mine" && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-xs shadow-sm hover:bg-slate-800 transition active:scale-95"
          >
            <Plus size={15} /> Add upload
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedSubject("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              selectedSubject === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Realms
          </button>
          {subjectList.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                selectedSubject === sub
                  ? "bg-[#008388] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition shadow-sm"
          />
        </div>
      </div>

      {tab === "teachers" && (
        <>
      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
                  {note.subject || "General"}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase">
                  {note.type || "PDF"}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 text-base mt-4 line-clamp-1">{note.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                {note.description || "Classroom lecture material and structured reference guide."}
              </p>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <GraduationCap size={13} /> {note.uploadedBy || "Faculty"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {note.uploadedAt}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setReadingNote(note)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow transition active:scale-95"
              >
                <Eye size={14} /> Read Note
              </button>

              <button
                onClick={() => setActiveNoteForAnnotation(note)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                title="Annotate & Markup in Studio"
              >
                <PenTool size={14} />
              </button>

              {note.fileUrl && (
                <button
                  onClick={() => setReadingNote(note)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                  title="Preview / Download"
                >
                  <Download size={14} />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-slate-400">
            <BookOpen size={36} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-sm">No notes found for your enrolled classes.</p>
          </div>
        )}
      </div>
        </>
      )}

      {tab === "mine" && (
        <>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400 -mt-2">
            <Lock size={12} /> Your teachers and admins can see these. Other students can't.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMine.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                canDelete
                onDelete={(id) => deleteMyNote(id).catch((err) => alert(`Could not delete: ${err.message}`))}
                onOpenReader={(n) => setReadingNote(n)}
                onAnnotate={(n) => setActiveNoteForAnnotation(n)}
              />
            ))}

            {myError && (
              <div className="col-span-full py-12 text-center">
                <p className="text-sm font-semibold text-rose-600">{myError}</p>
                <button
                  type="button"
                  onClick={retryMyNotes}
                  className="mt-3 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Try again
                </button>
              </div>
            )}

            {!myError && !myLoading && filteredMine.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400">
                <BookOpen size={36} className="mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-sm">
                  {myNotes.length === 0 ? "You haven't added anything yet." : "No uploads match your filters."}
                </p>
                {myNotes.length === 0 && (
                  <p className="text-xs mt-1">
                    Add photos of your handwritten notes, PDFs, text or useful links.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* In-app Note Reader */}
      {readingNote && (
        <NoteReaderModal
          note={readingNote}
          isOpen={Boolean(readingNote)}
          onClose={() => setReadingNote(null)}
          onAnnotate={(n) => setActiveNoteForAnnotation(n)}
        />
      )}

      {/* Annotation Studio Modal for specific note */}
      {activeNoteForAnnotation && (
        <AnnotationCanvas
          note={activeNoteForAnnotation}
          isOpen={Boolean(activeNoteForAnnotation)}
          onClose={() => setActiveNoteForAnnotation(null)}
        />
      )}

      {uploadOpen && (
        <MyUploadModal
          subjects={subjectList.filter(Boolean)}
          onSave={addMyNote}
          onClose={() => setUploadOpen(false)}
        />
      )}

      {/* Standalone Whiteboard Scratchpad */}
      {isWhiteboardOpen && (
        <AnnotationCanvas
          note={{ id: "scratchpad", title: "Whiteboard Scratchpad" }}
          isOpen={isWhiteboardOpen}
          onClose={() => setIsWhiteboardOpen(false)}
        />
      )}
    </div>
  );
}
