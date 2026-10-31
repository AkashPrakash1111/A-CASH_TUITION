import { useState, useEffect } from "react";
import {
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  Award,
  Sparkles,
  Search,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { teachersApi, messagesApi } from "../../services/api";
import { buildAvatarUrl, getDefaultAvatarConfig } from "../../components/avatar/dicebearOptions";

function parseAvatar(configStr) {
  if (!configStr) return getDefaultAvatarConfig();
  try {
    return JSON.parse(configStr);
  } catch {
    return getDefaultAvatarConfig();
  }
}

export default function StudentTeachers() {
  const { token, user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Message Teacher Modal
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadTeachers() {
      if (!token) return;
      try {
        const data = await teachersApi.list(token);
        setTeachers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed loading teachers", err);
      } finally {
        setLoading(false);
      }
    }
    loadTeachers();
  }, [token]);

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim() || !selectedTeacher?.user_id) return;
    setSending(true);
    try {
      await messagesApi.send(token, {
        receiver_id: selectedTeacher.user_id,
        content: `[Student Question regarding ${selectedTeacher.subject || "Subject"}]: ${questionText.trim()}`,
      });
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setSelectedTeacher(null);
        setQuestionText("");
      }, 2000);
    } catch (err) {
      alert(`Could not send inquiry: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const name = t.name || "";
    const subject = t.subject || "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || subject.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <Sparkles size={14} /> Faculty Guild
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Your Teachers & Mentors</h1>
          <p className="text-slate-500 text-sm mt-1">
            Meet the experienced educators guiding your academic journey across all subjects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by teacher or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition w-64"
            />
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => {
          const cfg = parseAvatar(teacher.avatar_config);
          const avatarUrl = buildAvatarUrl(cfg);

          return (
            <div
              key={teacher.id}
              className="group bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={avatarUrl}
                    alt={teacher.name}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 p-1 border-2 border-emerald-200 shadow-md group-hover:scale-105 transition"
                  />
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                      {teacher.subject || "Subject Expert"}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-lg mt-1.5">{teacher.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{teacher.qualification || "Faculty Mentor"}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  {teacher.experience && (
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-amber-500" />
                      <span>{teacher.experience} of dedicated teaching experience</span>
                    </div>
                  )}
                  {teacher.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-[#008388]" />
                    <span>Handling batches in {teacher.subject || "curriculum"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedTeacher(teacher)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition active:scale-95"
                >
                  <MessageSquare size={14} /> Ask Faculty Question
                </button>
              </div>
            </div>
          );
        })}

        {filteredTeachers.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-slate-400">
            <GraduationCap size={40} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-sm">No teachers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800">
              Ask {selectedTeacher.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Send an academic doubt or inquiry regarding {selectedTeacher.subject}.
            </p>

            {sentSuccess ? (
              <div className="my-8 p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-center font-semibold text-sm">
                ✨ Question sent to {selectedTeacher.name}! You'll receive a response in your message commons.
              </div>
            ) : (
              <form onSubmit={handleSendQuestion} className="mt-5 space-y-4">
                <textarea
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Describe your doubt or question clearly here..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#008388] focus:bg-white transition"
                  required
                />
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacher(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !questionText.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs hover:opacity-90 transition disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Doubt"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
