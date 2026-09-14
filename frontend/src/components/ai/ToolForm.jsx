import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";

export default function ToolForm({ tool, classes, subjects, onGenerate, loading }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  // Reset the form whenever the person switches tools, so stale values
  // from one tool don't leak into another.
  useEffect(() => {
    setValues({});
    setErrors({});
  }, [tool.id]);

  const resolveOptions = (field) => {
    if (field.optionsFrom === "classes") return classes;
    if (field.optionsFrom === "subjects") return subjects;
    return field.options || [];
  };

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    tool.fields.forEach((field) => {
      if (field.required && !values[field.name]) {
        nextErrors[field.name] = "Required";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onGenerate(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6"
    >
      <div className="grid grid-cols-2 gap-5">

        {tool.fields.map((field) => {
          const options = resolveOptions(field);
          const spanClass = field.span === 2 ? "col-span-2" : "col-span-1";

          if (field.type === "select") {
            return (
              <div key={field.name} className={spanClass}>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {field.label}
                </label>

                <select
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 bg-white"
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
                )}
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.name} className={spanClass}>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {field.label}
                </label>

                <textarea
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20 min-h-[120px] resize-none"
                />

                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
                )}
              </div>
            );
          }

          return (
            <div key={field.name} className={spanClass}>
              <Input
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                error={errors[field.name]}
              />
            </div>
          );
        })}

      </div>

      <Button type="submit" disabled={loading} className="w-full mt-6 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate
          </>
        )}
      </Button>
    </form>
  );
}
