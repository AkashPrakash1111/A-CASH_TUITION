import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const PLATFORMS = ["Google Meet", "Zoom", "YouTube Live", "Other"];

export default function LiveClassFormModal({
  isOpen,
  onClose,
  onSave,
  liveClass,
  classes = [],
  subjects = [],
  teachers = [],
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [meetingLink, setMeetingLink] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(liveClass);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(liveClass?.title || "");
    setDescription(liveClass?.description || "");
    setClassName(liveClass?.className || classes[0] || "");
    setSubject(liveClass?.subject || subjects[0] || "");
    setTeacherName(liveClass?.teacherName || teachers[0] || "");
    setPlatform(liveClass?.platform || PLATFORMS[0]);
    setMeetingLink(liveClass?.meetingLink || "");
    setScheduledDate(liveClass?.scheduledDate || "");
    setStartTime(liveClass?.startTime || "");
    setDuration(liveClass?.duration || "");
    setErrors({});
  }, [isOpen, liveClass, classes, subjects, teachers]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};

    if (!title.trim()) nextErrors.title = "Title is required";
    if (!className) nextErrors.className = "Select a class";
    if (!subject) nextErrors.subject = "Select a subject";
    if (!scheduledDate) nextErrors.scheduledDate = "Date is required";
    if (!startTime) nextErrors.startTime = "Start time is required";
    if (!meetingLink.trim()) nextErrors.meetingLink = "Meeting link is required";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      id: liveClass?.id,
      title: title.trim(),
      description: description.trim(),
      className,
      subject,
      teacherName,
      platform,
      meetingLink: meetingLink.trim(),
      scheduledDate,
      startTime,
      duration,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-3xl font-bold">
              {isEditing ? "Edit Live Class" : "Schedule Live Class"}
            </h2>

            <p className="text-gray-500 mt-2">
              {isEditing
                ? "Update the live class details below."
                : "Set up a live class for a batch."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>

        </div>

        <div className="mt-8 space-y-6">

          <Input
            label="Class Title"
            placeholder="e.g. Algebra — Live Doubt Session"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description (optional)
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will be covered in this session..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 min-h-[90px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Class
              </label>

              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 bg-white"
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {errors.className && (
                <p className="mt-1 text-sm text-red-500">{errors.className}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Subject
              </label>

              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 bg-white"
              >
                <option value="">Select subject</option>
                {subjects.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
              )}
            </div>

          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Teacher
            </label>

            <select
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 bg-white"
            >
              <option value="">Select teacher</option>
              {teachers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Platform
            </label>

            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPlatform(item)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                    platform === item
                      ? "bg-[#008388] text-white border-[#008388]"
                      : "border-gray-300 text-gray-600 hover:border-[#008388]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Meeting Link"
            placeholder="https://meet.google.com/..."
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            error={errors.meetingLink}
          />

          <div className="grid grid-cols-3 gap-6">

            <Input
              type="date"
              label="Date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              error={errors.scheduledDate}
            />

            <Input
              type="time"
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              error={errors.startTime}
            />

            <Input
              type="number"
              label="Duration (mins)"
              placeholder="e.g. 45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />

          </div>

        </div>

        <div className="flex justify-end gap-3 mt-10">

          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Schedule Class"}
          </Button>

        </div>

      </div>

    </div>
  );
}
