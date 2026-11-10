import { useState } from "react";
import { X, Paperclip, Type, Link2 } from "lucide-react";
import AttachmentPicker from "../assignments/AttachmentPicker";

const KINDS = [
  { id: "files", label: "Photos / Files", icon: Paperclip },
  { id: "text", label: "Text", icon: Type },
  { id: "link", label: "Link", icon: Link2 },
];

// Rendered only while open (the parent mounts/unmounts it), so every open
// starts with a clean form.
export default function MyUploadModal({ subjects = [], onSave, onClose }) {
  const [kind, setKind] = useState("files");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const switchKind = (id) => {
    setKind(id);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    const cleanTitle = title.trim();
    if (!cleanTitle) return setError("Give your note a title.");
    if (kind === "files" && attachments.length === 0) return setError("Add at least one photo, PDF or audio file.");
    if (kind === "text" && !text.trim()) return setError("Write something in your note.");
    if (kind === "link" && !/^https?:\/\/\S+$/i.test(link.trim())) {
      return setError("Enter a full link starting with http:// or https://");
    }

    setSaving(true);
    try {
      const payload = {
        title: cleanTitle,
        description: description.trim(),
        subject: subject || null,
        type: kind,
      };

      if (kind === "files") {
        payload.attachments = attachments.map(({ name, type, url }) => ({ name, type, url }));
        payload.textContent = text.trim() || null;
      } else if (kind === "text") {
        payload.textContent = text;
      } else {
        payload.fileUrl = link.trim();
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Could not save your note.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSave}
        className="bg-white rounded-[32px] w-full max-w-xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800">Add to My Uploads</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your teachers and admins can see this. Other students can't.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2" role="group" aria-label="What are you adding?">
          {KINDS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => switchKind(id)}
              aria-pressed={kind === id}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-semibold transition ${
                kind === id
                  ? "bg-[#008388] text-white border-[#008388]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#008388]"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {kind === "files" && (
            <div className="space-y-4">
              <AttachmentPicker value={attachments} onChange={setAttachments} disabled={saving} />
              <label className="block text-sm font-semibold text-slate-700">
                Message <span className="font-normal text-slate-400">(optional)</span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-[#008388] resize-none"
                  placeholder="Anything your teacher should know..."
                />
              </label>
            </div>
          )}

          {kind === "text" && (
            <label className="block text-sm font-semibold text-slate-700">
              Your note
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="mt-2 w-full rounded-2xl border border-slate-200 p-4 text-sm font-normal outline-none focus:border-[#008388] resize-none"
                placeholder="Start typing..."
              />
            </label>
          )}

          {kind === "link" && (
            <label className="block text-sm font-semibold text-slate-700">
              Link
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="mt-2 w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-normal outline-none focus:border-[#008388]"
                placeholder="https://..."
              />
            </label>
          )}

          <label className="block text-sm font-semibold text-slate-700">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-2 w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-normal outline-none focus:border-[#008388]"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm font-semibold text-slate-700">
              Subject <span className="font-normal text-slate-400">(optional)</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2 w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-[#008388]"
              >
                <option value="">No subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                className="mt-2 w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-normal outline-none focus:border-[#008388]"
              />
            </label>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#008388] text-white text-sm font-semibold hover:bg-[#006d71] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save to My Uploads"}
          </button>
        </div>
      </form>
    </div>
  );
}
