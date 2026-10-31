import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import SearchableSelect from "../ui/SearchableSelect";

const initialForm = {
  name: "",
  subject: "",
  batch: "",
  phone: "",
  email: "",
  qualification: "",
  experience: "",
  login_id: "",
  password: "",
  status: "Active",
};

export default function TeacherModal({
  isOpen,
  onClose,
  onSave,
  teacher,
  subjects = [],
  batches = [],
}) {
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (teacher) {
      setFormData({
        ...initialForm,
        ...teacher,
        login_id: teacher.login_id || teacher.username || teacher.email || "",
        password: "", // Don't prefill existing password for security
      });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
    setShowPassword(false);
  }, [teacher, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Teacher name is required";
    if (!formData.subject.trim()) nextErrors.subject = "Subject is required (select or type)";

    if (!teacher) {
      // New teacher requires credentials
      if (!formData.login_id.trim()) {
        nextErrors.login_id = "Login ID / Username is required";
      }
      if (!formData.password || formData.password.length < 6) {
        nextErrors.password = "Password must be at least 6 characters";
      }
    } else if (formData.password && formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(formData);
  };

  const subjectOptions = subjects.map((s) => s.name || s.subjectName || s);
  const batchOptions = batches.map((b) => b.batchName || b.name || b);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#008388]">
              Faculty Portal
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
              {teacher ? "Edit Teacher Account" : "Add New Teacher"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure profile information, teaching assignments, and campus login credentials.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Teacher Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dr. Rajesh Kumar"
              error={errors.name}
            />

            <SearchableSelect
              label="Subject (Select or Type) *"
              placeholder="e.g. Physics, Mathematics..."
              options={subjectOptions}
              value={formData.subject}
              onChange={(val) => handleSelectChange("subject", val)}
              error={errors.subject}
              allowCustom={true}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SearchableSelect
              label="Assigned Batch (Select or Type)"
              placeholder="e.g. Class 10 A, Batch Prime..."
              options={batchOptions}
              value={formData.batch}
              onChange={(val) => handleSelectChange("batch", val)}
              allowCustom={true}
            />

            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              placeholder="teacher@example.com"
            />

            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Credentials Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Portal Login Credentials
              </span>
              <span className="text-[11px] text-slate-400">
                {teacher ? "Leave password blank to keep current" : "Required for portal access"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs font-bold text-slate-700">
                  Login ID / Username {!teacher && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  name="login_id"
                  value={formData.login_id}
                  onChange={handleChange}
                  placeholder="e.g. teacher_physics"
                  className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 outline-none"
                />
                {errors.login_id && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.login_id}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-xs font-bold text-slate-700">
                  Password {!teacher && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 pr-10 text-xs text-slate-800 bg-white focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g. M.Sc, B.Ed"
            />

            <Input
              label="Experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g. 5 Years"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit">
              {teacher ? "Update Teacher" : "Save Teacher & Create Login"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}