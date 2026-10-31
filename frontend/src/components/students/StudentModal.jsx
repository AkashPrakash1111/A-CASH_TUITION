import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import SearchableSelect from "../ui/SearchableSelect";

const emptyForm = {
  name: "",
  className: "",
  batch: "",
  gender: "",
  dob: "",
  parent: "",
  phone: "",
  status: "Active",
  login_id: "",
  email: "",
  password: "",
};

export default function StudentModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  batches = [],
  saving = false,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...emptyForm,
        ...initialData,
        login_id: initialData.login_id || initialData.username || initialData.email || "",
        password: "",
      });
    } else {
      setFormData(emptyForm);
    }
    setErrors({});
    setShowPassword(false);
  }, [initialData, isOpen]);

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

    if (!formData.name.trim()) nextErrors.name = "Student name is required";
    if (!formData.className.trim()) nextErrors.className = "Class is required";

    if (!initialData) {
      const idOrEmail = (formData.login_id || formData.email || "").trim();
      if (!idOrEmail) {
        nextErrors.login_id = "Login ID or Email is required";
      }
      if (!formData.password || formData.password.length < 6) {
        nextErrors.password = "Password must be at least 6 characters";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      ...formData,
      login_id: (formData.login_id || formData.email || "").trim(),
      email: (formData.email || formData.login_id || "").trim(),
    };

    onSave(payload);
  };

  const batchOptions = batches.map((b) => b.batchName || b.name || b);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#008388]">
              Student Roster
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
              {initialData ? "Edit Student Profile" : "Register New Student"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enroll student, assign class / batch, and provision student portal credentials.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Akash Sharma"
              error={errors.name}
            />

            <Input
              label="Class *"
              name="className"
              value={formData.className}
              onChange={handleChange}
              placeholder="e.g. Class 10"
              error={errors.className}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SearchableSelect
              label="Batch (Select or Type)"
              placeholder="e.g. Class 10 A"
              options={batchOptions}
              value={formData.batch}
              onChange={(val) => handleSelectChange("batch", val)}
              allowCustom={true}
            />

            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 outline-none"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 outline-none"
              />
            </div>

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

          {/* Portal Credentials */}
          {!initialData && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Student Portal Login Credentials
                </span>
                <span className="text-[11px] text-slate-400">
                  Required for student sign in
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-700">
                    Login ID or Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="login_id"
                    value={formData.login_id}
                    onChange={handleChange}
                    placeholder="e.g. student_akash or student@email.com"
                    className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 outline-none"
                  />
                  {errors.login_id && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.login_id}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-700">
                    Login Password <span className="text-rose-500">*</span>
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
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Parent / Guardian Name"
              name="parent"
              value={formData.parent}
              onChange={handleChange}
              placeholder="e.g. Suresh Sharma"
            />

            <Input
              label="Contact Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : initialData ? "Update Student" : "Save Student & Create Login"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
