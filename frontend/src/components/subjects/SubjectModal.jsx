import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function SubjectModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
  const [formData, setFormData] = useState({
    name: "",
    className: "",
    teacher: "",
    description: "",
    status: "Active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        className: "",
        teacher: "",
        description: "",
        status: "Active",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {initialData ? "Edit Subject" : "Add Subject"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter subject name"
            required
          />

          <Input
            label="Class"
            name="className"
            value={formData.className}
            onChange={handleChange}
            placeholder="Enter class"
            required
          />

          <Input
            label="Teacher"
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
            placeholder="Enter teacher name"
            required
          />

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
          />

          <div>
            <label className="block mb-2 font-medium">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit">
              {initialData ? "Update Subject" : "Save Subject"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}