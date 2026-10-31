import { useState } from "react";
import { FileText, Download, X, ExternalLink } from "lucide-react";
import { filesApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

// Shows attachments the way a person wants to consume them:
// photos you can tap to enlarge, PDFs you can open, audio you can play.
export default function AttachmentList({ attachments = [], compact = false }) {
  const { token } = useAuth();
  const [zoomed, setZoomed] = useState(null);

  const resolve = (url) => filesApi.resolveFileUrl(url, token);

  const images = attachments.filter((a) => a.type === "image");
  const pdfs = attachments.filter((a) => a.type === "pdf");
  const audios = attachments.filter((a) => a.type === "audio");

  if (attachments.length === 0) return null;

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"}`}>
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setZoomed(img)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              aria-label={`Enlarge ${img.name || "photo"}`}
            >
              <img
                src={resolve(img.url)}
                alt={img.name || "Attached photo"}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {pdfs.map((pdf, i) => (
        <div
          key={`${pdf.url}-${i}`}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <FileText size={16} />
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{pdf.name || "Document.pdf"}</p>
          <a
            href={resolve(pdf.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#008388] hover:bg-slate-50"
          >
            Open <ExternalLink size={12} />
          </a>
        </div>
      ))}

      {audios.map((audio, i) => (
        <div
          key={`${audio.url}-${i}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <p className="mb-1.5 truncate text-xs font-medium text-slate-500">{audio.name || "Audio"}</p>
          <audio controls preload="metadata" src={resolve(audio.url)} className="h-10 w-full" />
        </div>
      ))}

      {zoomed && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomed(null)}
          role="dialog"
          aria-label="Enlarged photo"
        >
          <button
            type="button"
            onClick={() => setZoomed(null)}
            className="absolute right-5 top-5 rounded-xl bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X size={22} />
          </button>
          <a
            href={resolve(zoomed.url)}
            download={zoomed.name || "photo"}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-5 top-5 flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <Download size={14} /> Download
          </a>
          <img
            src={resolve(zoomed.url)}
            alt={zoomed.name || "Photo"}
            className="max-h-full max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
