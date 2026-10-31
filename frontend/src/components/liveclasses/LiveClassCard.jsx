import { useState } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  User,
  Video,
  Pencil,
  Trash2,
  Radio,
  Users,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  audienceLabel,
  formatDate,
  formatTime,
  shortLink,
  startsIn,
} from "../../utils/liveClassUtils";

const statusStyle = {
  Upcoming: "bg-blue-100 text-blue-700",
  "Live Now": "bg-red-100 text-red-700",
  Ended: "bg-slate-200 text-slate-700",
};

export default function LiveClassCard({ liveClass, status, onEdit, onDelete }) {
  const isLive = status === "Live Now";
  const [copied, setCopied] = useState(false);
  const countdown = status === "Upcoming" ? startsIn(liveClass) : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveClass.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", liveClass.meetingLink);
    }
  };

  return (
    <div
      className={`bg-white rounded-[28px] border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${
        isLive ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="min-w-0">
          <h3 className="font-bold text-lg text-slate-800 truncate">{liveClass.title}</h3>
          {liveClass.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{liveClass.description}</p>
          )}
        </div>

        <span
          className={`shrink-0 ml-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold ${
            statusStyle[status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {isLive && <Radio size={12} className="animate-pulse" />}
          {status}
        </span>
      </div>

      <div className="px-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF8F8] text-[#008388] text-xs font-medium">
          <GraduationCap size={14} />
          {liveClass.className ? `Class ${liveClass.className}` : "No class"}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
          <Users size={14} />
          {liveClass.batch || "All batches"}
        </span>
        {liveClass.subject && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF3FF] text-blue-600 text-xs font-medium">
            <BookOpen size={14} />
            {liveClass.subject}
          </span>
        )}
        {liveClass.teacherName && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-medium">
            <User size={14} />
            {liveClass.teacherName}
          </span>
        )}
      </div>

      <div className="px-6 mt-4">
        {liveClass.meetingLink ? (
          <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EAF8F8] text-[#008388] flex items-center justify-center shrink-0">
              <Video size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{liveClass.platform}</p>
              <p className="text-[11px] text-slate-400 truncate">{shortLink(liveClass.meetingLink)}</p>
            </div>
            <button
              type="button"
              onClick={copyLink}
              title="Copy link"
              className="shrink-0 w-8 h-8 rounded-lg hover:bg-slate-200/70 flex items-center justify-center text-slate-500"
            >
              {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-700 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-medium">
            <AlertTriangle size={15} /> No meeting link yet - students cannot join.
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-2">Visible to: {audienceLabel(liveClass)}</p>
      </div>

      <div className="flex-1" />

      <div className="flex items-center justify-between px-6 py-5 mt-4 border-t border-slate-100 flex-wrap gap-3">
        <div className="flex items-center gap-4 text-gray-500 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <Calendar size={16} />
            <span>{formatDate(liveClass.scheduledDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock size={16} />
            <span>
              {formatTime(liveClass.startTime)} · {liveClass.duration} min
              {countdown && <em className="not-italic text-blue-600 font-semibold"> ({countdown})</em>}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {status !== "Ended" && liveClass.meetingLink && (
            <a
              href={liveClass.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 h-9 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition ${
                isLive ? "bg-red-500 text-white hover:bg-red-600" : "bg-[#008388] text-white hover:bg-[#006d71]"
              }`}
            >
              <Video size={14} />
              {isLive ? "Join Now" : "Open Link"}
            </a>
          )}
          <button
            onClick={() => onEdit(liveClass)}
            title="Edit"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center"
          >
            <Pencil size={16} className="text-slate-600" />
          </button>
          <button
            onClick={() => onDelete(liveClass.id)}
            title="Delete"
            className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
