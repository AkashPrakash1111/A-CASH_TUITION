import { useEffect, useRef, useState } from "react";
import { X, UploadCloud, FileText } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";

export default function AssignmentFormModal({
  isOpen,
  onClose,
  onSave,
  assignment,
  classes = [],
  subjects = [],
}) {
  const fileInput = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(assignment);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(assignment?.title || "");
    setDescription(assignment?.description || "");
    setClassName(assignment?.className || classes[0] || "");
    setSubject(assignment?.subject || subjects[0] || "");
    setDueDate(assignment?.dueDate || "");
    setMaxMarks(assignment?.maxMarks || "");
    setFileName(assignment?.fileName || "");
    setErrors({});
  }, [isOpen, assignment, classes, subjects]);

  if (!isOpen) return null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
  };

  const validate = () => {
    const nextErrors = {};

    if (!title.trim()) nextErrors.title = "Title is required";
    if (!className) nextErrors.className = "Select a class";
    if (!subject) nextErrors.subject = "Select a subject";
    if (!dueDate) nextErrors.dueDate = "Due date is required";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      id: assignment?.id,
      title: title.trim(),
      description: description.trim(),
      className,
      subject,
      dueDate,
      maxMarks,
      fileName,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-3xl font-bold">
              {isEditing ? "Edit Assignment" : "New Assignment"}
            </h2>

            <p className="text-gray-500 mt-2">
              {isEditing
                ? "Update the assignment details below."
                : "Create an assignment for a class and subject."}
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
            label="Assignment Title"
            placeholder="e.g. Chapter 4 — Problem Set"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 min-h-[110px] resize-none"
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
              Attachment (optional)
            </label>

            <button
              type="button"
              onClick={() => fileInput.current.click()}
              className="w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#008388] transition bg-slate-50 px-5 py-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EAF8F8] text-[#008388] flex items-center justify-center shrink-0">
                {fileName ? <FileText size={22} /> : <UploadCloud size={22} />}
              </div>

              <div className="text-left">
                <p className="font-semibold">
                  {fileName || "Click to attach a file"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  PDF, DOC or image · up to 25 MB
                </p>
              </div>
            </button>

            <input
              hidden
              ref={fileInput}
              type="file"
              onChange={handleFile}
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-10">

          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Create Assignment"}
          </Button>

        </div>

      </div>

    </div>
  );
}
