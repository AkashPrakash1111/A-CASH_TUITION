import { useState } from "react";
import { X } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";
import AttachmentPicker from "./AttachmentPicker";

let counter = 0;
const withIds = (list = []) =>
  list.map((a) => ({ id: `kept-${counter++}`, name: a.name, type: a.type, url: a.url }));

// Mounted only while open (the page renders it conditionally), so every open
// starts from a clean copy of the assignment being edited.
export default function AssignmentFormModal({
  onClose,
  onSave,
  assignment,
  classes = [],
  subjects = [],
  batches = [],
}) {
  const isEditing = Boolean(assignment);

  const [title, setTitle] = useState(assignment?.title || "");
  const [description, setDescription] = useState(assignment?.description || "");
  const [className, setClassName] = useState(assignment?.className || classes[0] || "");
  const [batch, setBatch] = useState(assignment?.batch || "");
  const [subject, setSubject] = useState(assignment?.subject || subjects[0] || "");
  const [dueDate, setDueDate] = useState(assignment?.dueDate || "");
  const [maxMarks, setMaxMarks] = useState(assignment?.maxMarks || "");
  const [attachments, setAttachments] = useState(() => withIds(assignment?.attachments));
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Only batches that belong to the chosen class can be targeted
  const batchOptions = batches.filter((b) => b.className === className);

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "Title is required";
    if (!className) next.className = "Select a class";
    if (!subject) next.subject = "Select a subject";
    if (!dueDate) next.dueDate = "Due date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      await onSave({
        id: assignment?.id,
        title: title.trim(),
        description: description.trim(),
        className,
        batch,
        subject,
        dueDate,
        maxMarks,
        attachments: attachments.map(({ name, type, url }) => ({ name, type, url })),
      });
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err.message || "Failed to save assignment" }));
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">{isEditing ? "Edit Assignment" : "New Assignment"}</h2>
            <p className="text-gray-500 mt-2">
              {isEditing
                ? "Update the assignment details below."
                : "Create an assignment for a class and subject."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-8 space-y-6">
          <Input
            label="Assignment Title"
            placeholder="e.g. Chapter 4 — Problem Set"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 min-h-[110px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <SearchableSelect
              label="Class"
              placeholder="Select or type class..."
              options={classes}
              value={className}
              onChange={(val) => {
                setClassName(val);
                setBatch("");
              }}
              error={errors.className}
              allowCustom={true}
            />

            <SearchableSelect
              label="Subject"
              placeholder="Select or type subject..."
              options={subjects}
              value={subject}
              onChange={(val) => setSubject(val)}
              error={errors.subject}
              allowCustom={true}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Who is this for?</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              disabled={!className}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {className ? `Every batch in Class ${className}` : "Choose a class first"}
              </option>
              {batchOptions.map((b) => (
                <option key={b.id} value={b.batchName}>
                  Only batch: {b.batchName}
                  {b.subject ? ` (${b.subject})` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-400">Students outside this audience won't see the assignment.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input
              type="date"
              label="Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              error={errors.dueDate}
            />

            <Input
              type="number"
              label="Max Marks (optional)"
              placeholder="e.g. 20"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Attachments (optional)
            </label>
            <p className="mb-3 text-xs text-gray-400">
              Question papers, diagrams, worksheets, or a voice explanation. Students can open all of these.
            </p>
            <AttachmentPicker value={attachments} onChange={setAttachments} disabled={isSaving} />
          </div>
        </div>

        {errors.form && (
          <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Assignment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
