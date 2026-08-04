import { useMemo, useState } from "react";

import AdminLayout from "../layouts/AdminLayout";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";

import ClassSelector from "../components/notes/ClassSelector";
import NoteUploadPanel from "../components/notes/NoteUploadPanel";
import StudentSubmissionCard from "../components/notes/StudentSubmissionCard";

import useNotes from "../hooks/useNotes";
import useBatches from "../hooks/useBatches";
import useSubjects from "../hooks/useSubjects";

export default function Notes() {
  const { notes, addNote } = useNotes();

  const { batches } = useBatches();

  const { subjects } = useSubjects();

  const [selectedClass, setSelectedClass] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");

  const [search, setSearch] = useState("");

  const classList = useMemo(() => {
    return [...new Set(batches.map((b) => b.className))];
  }, [batches]);

  const subjectList = useMemo(() => {
    return subjects.map((s) => s.subjectName);
  }, [subjects]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {

      const classMatch =
        !selectedClass ||
        note.className === selectedClass;

      const subjectMatch =
        !selectedSubject ||
        note.subject === selectedSubject;

      const searchMatch =
        !search ||
        note.title
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        classMatch &&
        subjectMatch &&
        searchMatch
      );
    });
  }, [
    notes,
    selectedClass,
    selectedSubject,
    search,
  ]);

  return (
    <AdminLayout>

      <div className="p-8">

        <PageHeader
          title="Notes"
          subtitle="Upload and manage study materials."
        />

        <div className="mt-6">

          <SearchBar
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search notes..."
          />

        </div>

        <div className="grid grid-cols-12 gap-8 mt-8">

          {/* Left */}

          <div className="col-span-3">

            <ClassSelector
              classes={classList}
              subjects={subjectList}
              selectedClass={selectedClass}
              selectedSubject={selectedSubject}
              onClassChange={setSelectedClass}
              onSubjectChange={setSelectedSubject}
            />

          </div>

          {/* Right */}

          <div className="col-span-9">

            <NoteUploadPanel
  onUpload={addNote}
  selectedClass={selectedClass}
  selectedSubject={selectedSubject}
/>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">

              {filteredNotes.map((note) => (

                <StudentSubmissionCard
                  key={note.id}
                  studentName={note.uploadedBy}
                  avatar="/avatars/student1.png"
                  noteTitle={note.title}
                  fileName={note.fileName || note.title}
                  fileSize="--"
                  submittedAt={note.uploadedAt}
                  status="Approved"
                />

              ))}

            </div>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}