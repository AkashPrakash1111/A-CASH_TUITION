import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";
import DayTimePicker from "./DayTimePicker";

const emptyBatch = {
  batchName: "",
  className: "",
  subject: "",
  teacher: "",
  days: "",
  time: "",
  capacity: "",
  enrolled: "",
  status: "Active",
};

export default function BatchModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  subjects = [],
  teachers = [],
}) {
  const [formData, setFormData] = useState(emptyBatch);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(emptyBatch);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.batchName.trim()) {
      alert("Batch name is required.");
      return;
    }
    onSave(formData);
    setFormData(emptyBatch);
  };

  const subjectOptions = subjects.map((s) => s.name || s.subjectName || s);
  const teacherOptions = teachers.map((t) => t.name || t);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6">
          {initialData ? "Edit Batch" : "Create New Batch"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Batch Name *"
            name="batchName"
            placeholder="e.g. Class 10 A"
            value={formData.batchName}
            onChange={handleChange}
          />

          <Input
            label="Class"
            name="className"
            placeholder="e.g. Class 10"
            value={formData.className}
            onChange={handleChange}
          />

          <SearchableSelect
            label="Subject (Select or Type)"
            placeholder="e.g. Physics, Chemistry..."
            options={subjectOptions}
            value={formData.subject}
            onChange={(val) => handleSelectChange("subject", val)}
            allowCustom={true}
          />

          <SearchableSelect
            label="Teacher (Select or Type)"
            placeholder="Assign teacher..."
            options={teacherOptions}
            value={formData.teacher}
            onChange={(val) => handleSelectChange("teacher", val)}
            allowCustom={true}
          />

          <div className="sm:col-span-2">
            <DayTimePicker
              days={formData.days}
              time={formData.time}
              onDaysChange={(days) => setFormData((prev) => ({ ...prev, days }))}
              onTimeChange={(time) => setFormData((prev) => ({ ...prev, time }))}
            />
          </div>

          <Input
            label="Capacity"
            name="capacity"
            placeholder="e.g. 30"
            value={formData.capacity}
            onChange={handleChange}
          />

          <Input
            label="Enrolled"
            name="enrolled"
            placeholder="e.g. 15"
            value={formData.enrolled}
            onChange={handleChange}
          />

          <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit">
              {initialData ? "Update Batch" : "Save Batch"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}