import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function UploadPreviewModal({
  isOpen,
  onClose,
  onPublish,
  uploadData,
  selectedClass,
  selectedSubject,
  classes = [],
  subjects = [],
  batches = [],
}) {
  // Initial values come from the selected file; the parent remounts this
  // modal (via `key`) for each new selection, so no sync effect is needed.
  const [title, setTitle] = useState(uploadData?.title || "");
  const [description, setDescription] = useState("");
  const [saveAs, setSaveAs] = useState(uploadData?.type || "image");
  // Start from whatever is highlighted on the page, but let the teacher pick
  // here too, so there is no dead end when nothing was selected beforehand.
  const [targetClass, setTargetClass] = useState(selectedClass || "");
  const [targetSubject, setTargetSubject] = useState(selectedSubject || "");
  const [targetBatch, setTargetBatch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Hooks must all run before this early return, otherwise opening the modal
  // changes the hook count between renders and React crashes to a blank page.
  if (!isOpen || !uploadData) return null;

  // Only batches that belong to the chosen class can be targeted.
  const batchOptions = batches.filter((b) => b.className === targetClass);

  const missingTarget = !targetClass || !targetSubject;

  const publish = async () => {
    if (missingTarget) {
      setError("Choose a class and a subject before publishing.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      let fileUrl = uploadData.fileUrl || "";
      const fileName = uploadData.file?.name || uploadData.fileName || title || "notes";

      if (uploadData.file) {
        fileUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(uploadData.file);
        });
      }

      await onPublish({
        className: targetClass,
        subject: targetSubject,
        batch: targetBatch,
        title: title.trim() || fileName,
        description: description.trim(),
        type: saveAs,
        fileName,
        fileUrl,
        textContent: uploadData.textContent || "",
      });

      onClose();
    } catch (err) {
      console.error("Failed to publish notes:", err);
      setError(err.message || "Failed to publish notes");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl w-full max-w-3xl p-8">

        <h2 className="text-3xl font-bold">
          Publish Notes
        </h2>

        <p className="text-gray-500 mt-2">
          Review before publishing.
        </p>

        <div className="grid grid-cols-2 gap-6 mt-8">

          <Input
            label="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <label className="block text-sm font-semibold text-slate-700">
            Class
            <select
              value={targetClass}
              onChange={(e) => {
                setTargetClass(e.target.value);
                setTargetBatch("");
              }}
              className="mt-2 w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-[#008388]"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Subject
            <select
              value={targetSubject}
              onChange={(e) => setTargetSubject(e.target.value)}
              className="mt-2 w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-[#008388]"
            >
              <option value="">Select subject</option>
              {subjects.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-slate-700">
            Who can see this?
            <select
              value={targetBatch}
              onChange={(e) => setTargetBatch(e.target.value)}
              disabled={!targetClass}
              className="mt-2 w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-[#008388] disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {targetClass ? `Every batch in Class ${targetClass}` : "Choose a class first"}
              </option>
              {batchOptions.map((b) => (
                <option key={b.id} value={b.batchName}>
                  Only batch: {b.batchName}
                  {b.subject ? ` (${b.subject})` : ""}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-slate-400 mt-2">
            Students outside this audience will not see these notes.
          </p>
        </div>

        <div className="mt-8">

          <label className="font-semibold">
            Publish As
          </label>

          <div className="flex gap-4 mt-3">

            <button
              onClick={() => setSaveAs("pdf")}
              className={`px-5 py-3 rounded-xl border ${
                saveAs === "pdf"
                  ? "bg-[#008388] text-white"
                  : ""
              }`}
            >
              PDF
            </button>

            <button
              onClick={() => setSaveAs("image")}
              className={`px-5 py-3 rounded-xl border ${
                saveAs === "image"
                  ? "bg-[#008388] text-white"
                  : ""
              }`}
            >
              Image
            </button>

            <button
              onClick={() => setSaveAs("text")}
              className={`px-5 py-3 rounded-xl border ${
                saveAs === "text"
                  ? "bg-[#008388] text-white"
                  : ""
              }`}
            >
              Text
            </button>

          </div>

        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>

          <Button onClick={publish} disabled={uploading || missingTarget}>
            {uploading ? "Publishing..." : "Publish Notes"}
          </Button>
        </div>

      </div>

    </div>
  );
}