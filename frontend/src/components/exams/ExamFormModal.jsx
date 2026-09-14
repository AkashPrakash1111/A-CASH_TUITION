import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const EXAM_TYPES = ["Unit Test", "Mid Term", "Final Term", "Surprise Test"];

export default function ExamFormModal({
  isOpen,
  onClose,
  onSave,
  exam,
  classes = [],
  subjects = [],
}) {
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState(EXAM_TYPES[0]);
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(exam);

  useEffect(() => {
    if (!isOpen) return;

    setExamName(exam?.examName || "");
    setExamType(exam?.examType || EXAM_TYPES[0]);
    setDescription(exam?.description || "");
    setClassName(exam?.className || classes[0] || "");
    setSubject(exam?.subject || subjects[0] || "");
    setExamDate(exam?.examDate || "");
    setStartTime(exam?.startTime || "");
    setDuration(exam?.duration || "");
    setMaxMarks(exam?.maxMarks || "");
    setPassingMarks(exam?.passingMarks || "");
    setErrors({});
  }, [isOpen, exam, classes, subjects]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};

    if (!examName.trim()) nextErrors.examName = "Exam name is required";
    if (!className) nextErrors.className = "Select a class";
    if (!subject) nextErrors.subject = "Select a subject";
    if (!examDate) nextErrors.examDate = "Exam date is required";
    if (!maxMarks) nextErrors.maxMarks = "Max marks is required";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      id: exam?.id,
      examName: examName.trim(),
      examType,
      description: description.trim(),
      className,
      subject,
      examDate,
      startTime,
      duration,
      maxMarks,
      passingMarks,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-3xl font-bold">
              {isEditing ? "Edit Exam" : "Schedule Exam"}
            </h2>

            <p className="text-gray-500 mt-2">
              {isEditing
                ? "Update the exam details below."
                : "Set up an exam for a class and subject."}
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
            label="Exam Name"
            placeholder="e.g. Mid Term — Mathematics"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            error={errors.examName}
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Exam Type
            </label>

            <div className="flex flex-wrap gap-3">
              {EXAM_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setExamType(type)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                    examType === type
                      ? "bg-[#008388] text-white border-[#008388]"
                      : "border-gray-300 text-gray-600 hover:border-[#008388]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Syllabus / Topics (optional)
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chapters or topics covered in this exam..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 min-h-[100px] resize-none"
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
              label="Exam Date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              error={errors.examDate}
            />

            <Input
              type="time"
              label="Start Time (optional)"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

          </div>

          <div className="grid grid-cols-3 gap-6">

            <Input
              type="number"
              label="Duration (mins)"
              placeholder="e.g. 90"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />

            <Input
              type="number"
              label="Max Marks"
              placeholder="e.g. 100"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              error={errors.maxMarks}
            />

            <Input
              type="number"
              label="Passing Marks"
              placeholder="e.g. 35"
              value={passingMarks}
              onChange={(e) => setPassingMarks(e.target.value)}
            />

          </div>

        </div>

        <div className="flex justify-end gap-3 mt-10">

          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Schedule Exam"}
          </Button>

        </div>

      </div>

    </div>
  );
}
