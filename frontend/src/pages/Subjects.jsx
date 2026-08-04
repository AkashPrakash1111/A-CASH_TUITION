import { useMemo, useState } from "react";
import useSubjects from "../hooks/useSubjects";
import Button from "../components/ui/Button";
import SubjectTable from "../components/subjects/SubjectTable";
import SubjectModal from "../components/subjects/SubjectModal";

export default function Subjects() {
  const {
    subjects,
    addSubject,
    editSubject,
    deleteSubject,
  } = useSubjects();

  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubjects = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(term) ||
      subject.teacher.toLowerCase().includes(term) ||
      subject.className.toLowerCase().includes(term)
    );
  }, [subjects, searchTerm]);

  const handleAdd = () => {
    setSelectedSubject(null);
    setShowModal(true);
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setShowModal(true);
  };

  const handleSave = (subjectData) => {
    if (selectedSubject) {
      editSubject({
        ...selectedSubject,
        ...subjectData,
      });
    } else {
      addSubject(subjectData);
    }

    setShowModal(false);
    setSelectedSubject(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      deleteSubject(id);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-gray-500 mt-2">
            Manage all subjects in your tuition portal.
          </p>
        </div>

        <Button onClick={handleAdd}>
          + Add Subject
        </Button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by subject, teacher or class..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#008388]"
        />
      </div>

      <SubjectTable
        subjects={filteredSubjects}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SubjectModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSubject(null);
        }}
        onSave={handleSave}
        initialData={selectedSubject}
      />
    </div>
  );
}