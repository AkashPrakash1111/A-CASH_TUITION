import {
  FileText,
  FileImage,
  BookOpen,
  Calendar,
  GraduationCap,
  Download,
  Eye,
  PenTool,
  Trash2,
  Link2,
} from "lucide-react";
import { filesApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export default function NoteCard({
  note,
  onOpenReader,
  onAnnotate,
  onDelete,
  canDelete = false,
}) {
  const { token, user } = useAuth();
  const rawUrl = note.fileUrl || note.file_url || "";
  const resolvedUrl = filesApi.resolveFileUrl(rawUrl, token);
  const fileName = note.fileName || note.file_name || note.title || "document";
  const fileType = (note.type || note.file_type || (rawUrl.includes(".pdf") ? "pdf" : "image")).toLowerCase();
  const isLink = fileType === "link";
  const isStudentUpload = note.visibility === "private";
  const isOwnUpload = isStudentUpload && user?.role === "student";
  const isPdf = !isLink && (fileType === "pdf" || rawUrl.toLowerCase().includes(".pdf"));
  const isImage = !isLink && (["image", "jpg", "jpeg", "png", "webp"].includes(fileType) ||
    /\.(jpg|jpeg|png|webp|svg)$/i.test(rawUrl));

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!rawUrl) return;
    const a = document.createElement("a");
    a.href = resolvedUrl;
    a.download = fileName;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden group">
      <div className="p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
            {note.subject || "General"}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
              {isLink ? "LINK" : isPdf ? "PDF" : isImage ? "IMAGE" : "TEXT"}
            </span>
            {isOwnUpload ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                Teachers can see
              </span>
            ) : (
              <>
                {isStudentUpload && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                    Student upload
                  </span>
                )}
                {note.className && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    Class {note.className}
                  </span>
                )}
                {isStudentUpload ? (
                  note.batch && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700">
                      Batch {note.batch}
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700">
                    {note.batch ? `Batch ${note.batch}` : "All batches"}
                  </span>
                )}
              </>
            )}
            {canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete note "${note.title}"?`)) {
                    onDelete(note.id);
                  }
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition ml-1"
                title="Delete note"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 mt-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#008388] flex items-center justify-center shrink-0">
            {isLink ? <Link2 size={22} /> : isPdf ? <FileText size={22} /> : isImage ? <FileImage size={22} /> : <BookOpen size={22} />}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-[#008388] transition">
              {note.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {note.description || (isOwnUpload ? "Your personal note." : isStudentUpload ? "Student upload." : "Classroom study resource & reference notes.")}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <GraduationCap size={13} /> {note.uploadedBy || "Faculty"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {note.uploadedAt || "Recently"}
          </span>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onOpenReader(note)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow transition active:scale-95"
        >
          <Eye size={14} /> Read Note
        </button>

        {onAnnotate && !isLink && (
          <button
            onClick={() => onAnnotate(note)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
            title="Annotate in Studio"
          >
            <PenTool size={15} />
          </button>
        )}

        {rawUrl && !isLink && (
          <button
            onClick={handleDownload}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
            title="Download file"
          >
            <Download size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
