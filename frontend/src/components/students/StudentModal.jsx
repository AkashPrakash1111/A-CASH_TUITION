import { useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function StudentModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
  const emptyForm = {
    name: "",
    className: "",
    batch: "",
    gender: "",
    dob: "",
    parent: "",
    phone: "",
    status: "Active",
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(emptyForm);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Student name is required.");
      return;
    }

    if (!formData.className.trim()) {
      alert("Class is required.");
      return;
    }

    onSave(formData);
    setFormData(emptyForm);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">

        <h2 className="text-2xl font-bold mb-6">
          {initialData ? "Edit Student" : "Add Student"}
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <Input
            label="Student Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter student name"
          />

          <Input
            label="Class"
            name="className"
            value={formData.className}
            onChange={handleChange}
            placeholder="Enter class"
          />

          <Input
            label="Batch"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            placeholder="Enter batch"
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Gender
            </label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 outline-none"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 outline-none"
            />
          </div>

          <Input
            label="Parent Name"
            name="parent"
            value={formData.parent}
            onChange={handleChange}
            placeholder="Enter parent name"
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 outline-none"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8">

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
          >
            {initialData ? "Update Student" : "Save Student"}
          </Button>

        </div>

      </div>
    </div>
  );
}