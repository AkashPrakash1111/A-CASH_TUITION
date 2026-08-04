import React, { useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const initialForm = {
  name: "",
  subject: "",
  phone: "",
  email: "",
  qualification: "",
  experience: "",
  status: "Active",
};

export default function TeacherModal({
  isOpen,
  onClose,
  onSave,
  teacher,
}) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (teacher) {
      setFormData(teacher);
    } else {
      setFormData(initialForm);
    }
  }, [teacher]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.subject ||
      !formData.phone
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">

        <h2 className="text-2xl font-bold mb-6 text-[#008388]">
          {teacher ? "Edit Teacher" : "Add Teacher"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <Input
            label="Teacher Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter teacher name"
          />

          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Mathematics"
          />

          <div className="grid grid-cols-2 gap-4">

            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

          </div>

          <div className="grid grid-cols-2 gap-4">

            <Input
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
            />

            <Input
              label="Experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="5 Years"
            />

          </div>

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

          <div className="flex justify-end gap-3 pt-4">

            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit">
              {teacher ? "Update Teacher" : "Add Teacher"}
            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}