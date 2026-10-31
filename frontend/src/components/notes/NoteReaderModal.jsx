import { useState } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  FileImage,
  ExternalLink,
  BookOpen,
  Calendar,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { filesApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export default function NoteReaderModal({ note, isOpen, onClose, onAnnotate }) {
  const { token } = useAuth();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !note) return null;

  const rawUrl = note.fileUrl || note.file_url || "";
  const resolvedUrl = filesApi.resolveFileUrl(rawUrl, token);
  const fileName = note.fileName || note.file_name || note.title || "document";
  const fileType = (note.type || note.file_type || (rawUrl.includes(".pdf") ? "pdf" : "image")).toLowerCase();
  const isLink = fileType === "link";
  const isPdf = !isLink && (fileType === "pdf" || rawUrl.toLowerCase().includes(".pdf"));
  const isImage = !isLink && (["image", "jpg", "jpeg", "png", "webp"].includes(fileType) ||
    /\.(jpg|jpeg|png|webp|svg)$/i.test(rawUrl));
  const isText = fileType === "text" || (!rawUrl && note.textContent);

  const handleDownload = () => {
    if (!rawUrl) return;
    // If it's a backend files download path or normal URL
    const a = document.createElement("a");
    a.href = resolvedUrl;
    a.download = fileName;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              {isPdf ? <FileText size={20} /> : isImage ? <FileImage size={20} /> : <BookOpen size={20} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                  {note.title || fileName}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-900 text-cyan-300">
                  {note.subject || "Study Notes"}
                </span>
                {note.className && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Class {note.className}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-0.5">
                {note.uploadedBy && (
                  <span className="flex items-center gap-1">
                    <GraduationCap size={12} /> {note.uploadedBy}
                  </span>
                )}
                {note.uploadedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {note.uploadedAt}
                  </span>
                )}
                <span className="text-slate-500">File: {fileName}</span>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {isImage && (
              <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono px-1.5 text-slate-300">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                  title="Rotate 90deg"
                >
                  <RotateCw size={16} />
                </button>
              </div>
            )}

            {onAnnotate && !isLink && (
              <button
                onClick={() => {
                  onClose();
                  onAnnotate(note);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#008388] text-white text-xs font-semibold hover:bg-teal-600 transition"
              >
                <Sparkles size={14} /> Annotate
              </button>
            )}

            {rawUrl && !isLink && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
                title="Download file"
              >
                <Download size={15} /> <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 bg-slate-100/70 p-4 overflow-auto flex items-center justify-center relative">
          {isLink && rawUrl ? (
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-md">
              <ExternalLink size={44} className="mx-auto text-[#008388] mb-3" />
              <h4 className="font-bold text-slate-800 text-base">{note.title}</h4>
              {note.description && (
                <p className="text-xs text-slate-500 mt-1">{note.description}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-3 break-all">{rawUrl}</p>
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[#008388] text-white text-xs font-semibold shadow hover:bg-teal-600 transition"
              >
                <ExternalLink size={14} /> Open link in new tab
              </a>
              <p className="text-[10px] text-slate-400 mt-3">
                This opens a website outside the portal.
              </p>
            </div>
          ) : isPdf && rawUrl ? (
            <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-inner flex flex-col">
              <iframe
                src={`${resolvedUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full border-0"
                title={note.title || "PDF Document"}
              />
            </div>
          ) : isImage && rawUrl ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              <img
                src={resolvedUrl}
                alt={note.title || "Note Page"}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: "transform 0.15s ease-out",
                }}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
              />
            </div>
          ) : isText || note.textContent ? (
            <div className="w-full max-w-3xl h-full bg-white rounded-2xl p-8 shadow-sm overflow-auto text-slate-800 border border-slate-200">
              <h2 className="text-2xl font-bold mb-4">{note.title}</h2>
              {note.description && (
                <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
                  {note.description}
                </p>
              )}
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {note.textContent || "No text content recorded for this note."}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-md">
              <BookOpen size={48} className="mx-auto text-slate-400 mb-3" />
              <h4 className="font-bold text-slate-800 text-base">File Preview Unavailable</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                The content could not be previewed directly inline.
              </p>
              {rawUrl && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008388] text-white text-xs font-semibold shadow hover:bg-teal-600 transition"
                >
                  <Download size={14} /> Download File Directly
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
