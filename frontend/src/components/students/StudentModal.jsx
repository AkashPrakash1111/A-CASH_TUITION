import { useEffect, useState } from "react";

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

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            type="text"
            name="className"
            placeholder="Class"
            value={formData.className}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            type="text"
            name="batch"
            placeholder="Batch"
            value={formData.batch}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="border rounded-lg p-3"
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            type="text"
            name="parent"
            placeholder="Parent Name"
            value={formData.parent}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            type="text"
            name="phone"
            placeholder="Parent Phone"
            value={formData.phone}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border rounded-lg p-3"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-[#008388] text-white hover:opacity-90 transition"
          >
            {initialData ? "Update Student" : "Save Student"}
          </button>

        </div>

      </div>
    </div>
  );
}