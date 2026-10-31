import { useEffect, useMemo, useState } from "react";
import { X, AlertTriangle, Link2, Users } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";
import { addMinutes, detectPlatform, minutesBetween } from "../../utils/liveClassUtils";

const ALL_BATCHES = "";

// Mirrors the server: a link typed without "https://" gets it added.
function cleanLink(text) {
  const link = (text || "").trim();
  if (!link) return "";
  return link.includes("://") ? link : `https://${link.replace(/^\/+/, "")}`;
}

function linkProblem(text) {
  if (!text.trim()) return "Meeting link is required";
  const link = cleanLink(text);
  if (!/^https?:\/\/\S+\.\S+/i.test(link)) return "Enter a valid link, e.g. https://meet.google.com/abc-defg-hij";
  return "";
}

export default function LiveClassFormModal({
  isOpen,
  onClose,
  onSave, // async (payload) => void; throws on failure
  liveClass,
  classes = [],
  batches = [], // [{ batchName, className }]
  subjects = [],
  teachers = [],
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [batch, setBatch] = useState(ALL_BATCHES);
  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(liveClass);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(liveClass?.title || "");
    setDescription(liveClass?.description || "");
    setClassName(liveClass?.className || classes[0] || "");
    setBatch(liveClass?.batch || ALL_BATCHES);
    setSubject(liveClass?.subject || subjects[0] || "");
    setTeacherName(liveClass?.teacherName || teachers[0] || "");
    setMeetingLink(liveClass?.meetingLink || "");
    setScheduledDate(liveClass?.scheduledDate || "");
    setStartTime(liveClass?.startTime || "");
    setDuration(String(minutesBetween(liveClass?.startTime, liveClass?.endTime) || 60));
    setErrors({});
    setServerError("");
    setSaving(false);
  }, [isOpen, liveClass, classes, subjects, teachers]);

  // Batches that belong to the chosen class. A batch saved earlier that no
  // longer exists in the list is kept so editing does not silently change it.
  const batchOptions = useMemo(() => {
    const names = batches
      .filter((b) => String(b.className) === String(className))
      .map((b) => b.batchName)
      .filter(Boolean);
    if (batch && !names.includes(batch)) names.push(batch);
    return names;
  }, [batches, className, batch]);

  if (!isOpen) return null;

  const platform = detectPlatform(cleanLink(meetingLink));

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "Title is required";
    if (!className) next.className = "Select a class";
    if (!subject) next.subject = "Select a subject";
    if (!scheduledDate) next.scheduledDate = "Date is required";
    if (!startTime) next.startTime = "Start time is required";
    const mins = parseInt(duration, 10);
    if (!mins || mins < 5 || mins > 600) next.duration = "5 to 600 minutes";
    const problem = linkProblem(meetingLink);
    if (problem) next.meetingLink = problem;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (saving || !validate()) return;
    setServerError("");
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        className,
        batch, // "" means every batch of the class
        subject,
        teacherName,
        meetingLink: cleanLink(meetingLink),
        scheduledDate,
        startTime,
        endTime: addMinutes(startTime, duration),
      });
    } catch (err) {
      setServerError(err?.message || "Could not save the live class. Please try again.");
      setSaving(false);
    }
  };

  const audience = batch
    ? `Only students of Class ${className}, batch "${batch}" will see this class and its link.`
    : `Every student of Class ${className}, in all batches, will see this class and its link.`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">{isEditing ? "Edit Live Class" : "Schedule Live Class"}</h2>
            <p className="text-gray-500 mt-2">
              {isEditing
                ? "Changes, including a new link, reach students within seconds."
                : "Pick the class and batch that should receive this link."}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        <div className="mt-8 space-y-6">
          {serverError && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            label="Class Title"
            placeholder="e.g. Algebra - Live Doubt Session"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will be covered in this session..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 min-h-[90px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <SearchableSelect
              label="Class"
              placeholder="Select class..."
              options={classes}
              value={className}
              onChange={(val) => {
                setClassName(val);
                setBatch(ALL_BATCHES); // batches differ per class
              }}
              error={errors.className}
              allowCustom={false}
            />

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Batch</label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20"
              >
                <option value={ALL_BATCHES}>All batches of this class</option>
                {batchOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-2xl bg-[#EAF8F8] text-[#006d71] text-xs">
            <Users size={15} className="mt-0.5 shrink-0" />
            <span>{audience}</span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <SearchableSelect
              label="Subject"
              placeholder="Select or type subject..."
              options={subjects}
              value={subject}
              onChange={(val) => setSubject(val)}
              error={errors.subject}
              allowCustom={true}
            />
            <SearchableSelect
              label="Teacher"
              placeholder="Select or type teacher..."
              options={teachers}
              value={teacherName}
              onChange={(val) => setTeacherName(val)}
              allowCustom={true}
            />
          </div>

          <div>
            <Input
              label="Meeting Link"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              error={errors.meetingLink}
            />
            {platform && !errors.meetingLink && (
              <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                <Link2 size={13} /> Detected: <strong>{platform}</strong>
              </p>
            )}
          </div>

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
              error={errors.duration}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Schedule Class"}
          </Button>
        </div>
      </div>
    </div>
  );
}
