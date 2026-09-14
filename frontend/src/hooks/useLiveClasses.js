import { useState } from "react";

const STORAGE_KEY = "acash_live_classes";

export default function useLiveClasses() {
  const [liveClasses, setLiveClasses] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const save = (updated) => {
    setLiveClasses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Add New Live Class
  const addLiveClass = (liveClass) => {
    const newLiveClass = {
      id: crypto.randomUUID(),

      title: liveClass.title,

      description: liveClass.description || "",

      className: liveClass.className,

      subject: liveClass.subject,

      teacherName: liveClass.teacherName || "",

      platform: liveClass.platform || "Google Meet",

      meetingLink: liveClass.meetingLink || "",

      scheduledDate: liveClass.scheduledDate,

      startTime: liveClass.startTime,

      duration: liveClass.duration || "",

      createdBy: liveClass.createdBy || "Admin",

      createdAt: new Date().toLocaleString(),
    };

    save([newLiveClass, ...liveClasses]);
  };

  // Update Existing Live Class
  const editLiveClass = (updatedLiveClass) => {
    const updated = liveClasses.map((item) =>
      item.id === updatedLiveClass.id
        ? { ...item, ...updatedLiveClass }
        : item
    );

    save(updated);
  };

  // Delete Live Class
  const deleteLiveClass = (id) => {
    const updated = liveClasses.filter((item) => item.id !== id);
    save(updated);
  };

  // Derive a live status from date/time/duration so it never goes stale
  const getStatus = (liveClass) => {
    if (!liveClass.scheduledDate || !liveClass.startTime) return "Upcoming";

    const now = new Date();

    const start = new Date(
      `${liveClass.scheduledDate}T${liveClass.startTime}`
    );

    const durationMinutes = Number(liveClass.duration) || 60;

    const end = new Date(start.getTime() + durationMinutes * 60000);

    if (now.getTime() < start.getTime()) return "Upcoming";
    if (now.getTime() <= end.getTime()) return "Live Now";
    return "Ended";
  };

  return {
    liveClasses,

    addLiveClass,

    editLiveClass,

    deleteLiveClass,

    getStatus,
  };
}
