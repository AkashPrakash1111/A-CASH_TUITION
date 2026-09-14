import { useMemo, useState } from "react";
import { Plus, Video, Radio, CalendarClock, History } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import StatsCard from "../components/ui/StatsCard";

import ClassSelector from "../components/notes/ClassSelector";
import LiveClassCard from "../components/liveclasses/LiveClassCard";
import LiveClassFormModal from "../components/liveclasses/LiveClassFormModal";

import useLiveClasses from "../hooks/useLiveClasses";
import useBatches from "../hooks/useBatches";
import useSubjects from "../hooks/useSubjects";
import useTeachers from "../hooks/useTeachers";

export default function LiveClasses() {
  const {
    liveClasses,
    addLiveClass,
    editLiveClass,
    deleteLiveClass,
    getStatus,
  } = useLiveClasses();

  const { batches } = useBatches();
  const { subjects } = useSubjects();
  const { teachers } = useTeachers();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLiveClass, setEditingLiveClass] = useState(null);

  const classList = useMemo(() => {
    return [...new Set(batches.map((b) => b.className))];
  }, [batches]);

  const subjectList = useMemo(() => {
    return subjects.map((s) => s.subjectName);
  }, [subjects]);

  const teacherList = useMemo(() => {
    return teachers.map((t) => t.name);
  }, [teachers]);

  const filteredLiveClasses = useMemo(() => {
    return liveClasses
      .filter((item) => {
        const classMatch =
          !selectedClass || item.className === selectedClass;

        const subjectMatch =
          !selectedSubject || item.subject === selectedSubject;

        const searchMatch =
          !search || item.title.toLowerCase().includes(search.toLowerCase());

        return classMatch && subjectMatch && searchMatch;
      })
      .sort(
        (a, b) =>
          new Date(`${a.scheduledDate}T${a.startTime || "00:00"}`) -
          new Date(`${b.scheduledDate}T${b.startTime || "00:00"}`)
      );
  }, [liveClasses, selectedClass, selectedSubject, search]);

  const stats = useMemo(() => {
    const total = liveClasses.length;
    const live = liveClasses.filter((c) => getStatus(c) === "Live Now").length;
    const upcoming = liveClasses.filter((c) => getStatus(c) === "Upcoming").length;
    const ended = liveClasses.filter((c) => getStatus(c) === "Ended").length;

    return { total, live, upcoming, ended };
  }, [liveClasses, getStatus]);

  const openAddModal = () => {
    setEditingLiveClass(null);
    setIsModalOpen(true);
  };

  const openEditModal = (liveClass) => {
    setEditingLiveClass(liveClass);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingLiveClass(null);
    setIsModalOpen(false);
  };

  const handleSave = (data) => {
    if (editingLiveClass) {
      editLiveClass({ ...editingLiveClass, ...data });
    } else {
      addLiveClass(data);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this live class?"
    );

    if (confirmDelete) {
      deleteLiveClass(id);
    }
  };

  return (
    <div className="p-8">

      <PageHeader
        title="Live Classes"
        subtitle="Schedule and join live sessions with your students."
        buttonText="Schedule Class"
        buttonIcon={Plus}
        onButtonClick={openAddModal}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatsCard
          title="Total Sessions"
          value={stats.total}
          icon={Video}
          color="bg-[#008388]"
        />

        <StatsCard
          title="Live Now"
          value={stats.live}
          icon={Radio}
          color="bg-red-500"
        />

        <StatsCard
          title="Upcoming"
          value={stats.upcoming}
          icon={CalendarClock}
          color="bg-blue-500"
        />

        <StatsCard
          title="Ended"
          value={stats.ended}
          icon={History}
          color="bg-slate-500"
        />

      </div>

      <div className="mt-8">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search live classes..."
        />
      </div>

      <div className="grid grid-cols-12 gap-8 mt-8">

        {/* Left */}

        <div className="col-span-12 lg:col-span-3">
          <ClassSelector
            classes={classList}
            subjects={subjectList}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            onClassChange={(value) =>
              setSelectedClass((prev) => (prev === value ? "" : value))
            }
            onSubjectChange={(value) =>
              setSelectedSubject((prev) => (prev === value ? "" : value))
            }
          />
        </div>

        {/* Right */}

        <div className="col-span-12 lg:col-span-9">

          {filteredLiveClasses.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm text-center py-20">
              <Video size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 font-semibold text-slate-600">
                No live classes scheduled yet
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Schedule your first live class to get started.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredLiveClasses.map((liveClass) => (
                <LiveClassCard
                  key={liveClass.id}
                  liveClass={liveClass}
                  status={getStatus(liveClass)}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      <LiveClassFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        liveClass={editingLiveClass}
        classes={classList}
        subjects={subjectList}
        teachers={teacherList}
      />

    </div>
  );
}
