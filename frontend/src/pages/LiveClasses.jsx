import { useEffect, useMemo, useState } from "react";
import { Plus, Video, Radio, CalendarClock, History, AlertTriangle, RefreshCw } from "lucide-react";

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
import { compareClasses, liveStatus } from "../utils/liveClassUtils";

const TABS = ["All", "Live Now", "Upcoming", "Ended"];

export default function LiveClasses() {
  const {
    liveClasses,
    loading,
    error,
    lastUpdated,
    addLiveClass,
    editLiveClass,
    deleteLiveClass,
    refreshLiveClasses,
  } = useLiveClasses();

  const { batches } = useBatches();
  const { subjects } = useSubjects();
  const { teachers } = useTeachers();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLiveClass, setEditingLiveClass] = useState(null);

  // Re-evaluate Live Now / Upcoming / Ended as the clock moves.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const classList = useMemo(
    () => [...new Set(batches.map((b) => b.className).filter(Boolean))],
    [batches]
  );

  const batchChoices = useMemo(() => {
    const names = liveClasses
      .filter((c) => !selectedClass || c.className === selectedClass)
      .map((c) => c.batch)
      .filter(Boolean);
    return [...new Set(names)];
  }, [liveClasses, selectedClass]);

  const subjectList = useMemo(
    () => subjects.map((s) => s.name || s.subjectName || "").filter(Boolean),
    [subjects]
  );

  const teacherList = useMemo(() => teachers.map((t) => t.name), [teachers]);

  const withStatus = useMemo(
    () => liveClasses.map((c) => ({ cls: c, status: liveStatus(c, now) })),
    [liveClasses, now]
  );

  const stats = useMemo(
    () => ({
      total: withStatus.length,
      live: withStatus.filter((x) => x.status === "Live Now").length,
      upcoming: withStatus.filter((x) => x.status === "Upcoming").length,
      ended: withStatus.filter((x) => x.status === "Ended").length,
    }),
    [withStatus]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withStatus
      .filter(({ cls, status }) => {
        if (tab !== "All" && status !== tab) return false;
        if (selectedClass && cls.className !== selectedClass) return false;
        if (selectedSubject && cls.subject !== selectedSubject) return false;
        if (selectedBatch && cls.batch !== selectedBatch) return false;
        if (q && !`${cls.title} ${cls.subject} ${cls.teacherName} ${cls.batch}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => compareClasses(a.cls, b.cls, now));
  }, [withStatus, tab, selectedClass, selectedSubject, selectedBatch, search, now]);

  const tabCount = (name) =>
    name === "All" ? stats.total : name === "Live Now" ? stats.live : name === "Upcoming" ? stats.upcoming : stats.ended;

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

  // Throws on failure so the form stays open and shows the reason.
  const handleSave = async (data) => {
    if (editingLiveClass) {
      await editLiveClass(editingLiveClass.id, data);
    } else {
      await addLiveClass(data);
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this live class? Students will stop seeing it.")) return;
    setActionError("");
    try {
      await deleteLiveClass(id);
    } catch (err) {
      setActionError(err.message || "Could not delete the live class.");
    }
  };

  const bannerError = actionError || error;

  return (
    <div className="p-8">
      <PageHeader
        title="Live Classes"
        subtitle="Schedule live sessions and send the link to the right class and batch."
        buttonText="Schedule Class"
        buttonIcon={Plus}
        onButtonClick={openAddModal}
      />

      {bannerError && (
        <div role="alert" className="mb-6 flex items-center gap-2 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="flex-1">{bannerError}</span>
          <button onClick={refreshLiveClasses} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Sessions" value={stats.total} icon={Video} color="bg-[#008388]" />
        <StatsCard title="Live Now" value={stats.live} icon={Radio} color="bg-red-500" />
        <StatsCard title="Upcoming" value={stats.upcoming} icon={CalendarClock} color="bg-blue-500" />
        <StatsCard title="Ended" value={stats.ended} icon={History} color="bg-slate-500" />
      </div>

      <div className="mt-8 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, teacher or batch..."
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#008388]"
          >
            <option value="">All batches</option>
            {batchChoices.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <button
            onClick={refreshLiveClasses}
            title={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Refresh"}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((name) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              tab === name
                ? "bg-[#008388] text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {name} ({tabCount(name)})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8 mt-6">
        <div className="col-span-12 lg:col-span-3">
          <ClassSelector
            classes={classList}
            subjects={subjectList}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            onClassChange={(value) => {
              setSelectedClass((prev) => (prev === value ? "" : value));
              setSelectedBatch("");
            }}
            onSubjectChange={(value) => setSelectedSubject((prev) => (prev === value ? "" : value))}
          />
        </div>

        <div className="col-span-12 lg:col-span-9">
          {visible.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm text-center py-20">
              <Video size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 font-semibold text-slate-600">
                {loading ? "Loading live classes..." : liveClasses.length === 0 ? "No live classes scheduled yet" : "No live classes match these filters"}
              </p>
              {!loading && liveClasses.length === 0 && (
                <p className="text-sm text-gray-400 mt-1">Schedule your first live class to get started.</p>
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {visible.map(({ cls, status }) => (
                <LiveClassCard
                  key={cls.id}
                  liveClass={cls}
                  status={status}
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
        batches={batches}
        subjects={subjectList}
        teachers={teacherList}
      />
    </div>
  );
}
