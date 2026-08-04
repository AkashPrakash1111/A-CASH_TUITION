import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

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
}) {
  const [formData, setFormData] = useState(emptyBatch);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(emptyBatch);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(formData);

    setFormData(emptyBatch);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl w-full max-w-2xl p-8">

        <h2 className="text-2xl font-bold mb-6">
          {initialData ? "Edit Batch" : "Add Batch"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-5"
        >

          <Input
            label="Batch Name"
            name="batchName"
            value={formData.batchName}
            onChange={handleChange}
          />

          <Input
            label="Class"
            name="className"
            value={formData.className}
            onChange={handleChange}
          />

          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
          />

          <Input
            label="Teacher"
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
          />

          <Input
            label="Days"
            name="days"
            value={formData.days}
            onChange={handleChange}
          />

          <Input
            label="Time"
            name="time"
            value={formData.time}
            onChange={handleChange}
          />

          <Input
            label="Capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
          />

          <Input
            label="Students Enrolled"
            name="enrolled"
            type="number"
            value={formData.enrolled}
            onChange={handleChange}
          />

          <div className="col-span-2">

            <label className="block mb-2 font-medium">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                focus:outline-none
                focus:border-[#008388]
              "
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>

          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-4">

            <Button
  type="button"
  variant="secondary"
  onClick={onClose}
>
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