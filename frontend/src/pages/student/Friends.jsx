import { useState, useEffect, useRef } from "react";
import {
  Users,
  Search,
  MessageSquare,
  Sparkles,
  Send,
  ShieldCheck,
  Circle,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { studentsApi, messagesApi } from "../../services/api";
import { buildAvatarUrl, getDefaultAvatarConfig } from "../../components/avatar/dicebearOptions";

function parseAvatar(configStr) {
  if (!configStr) return getDefaultAvatarConfig();
  try {
    return JSON.parse(configStr);
  } catch {
    return getDefaultAvatarConfig();
  }
}

export default function StudentFriends() {
  const { user, token } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Active chat peer
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    async function loadStudents() {
      if (!token) return;
      try {
        const data = await studentsApi.list(token);
        // Exclude current student
        const list = Array.isArray(data)
          ? data.filter((s) => s.user_id !== user?.id && s.email !== user?.email)
          : [];
        setStudents(list);
      } catch (err) {
        console.error("Failed loading classmates", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [token, user]);

  useEffect(() => {
    let interval;
    if (activePeer && token) {
      const loadMessages = async () => {
        try {
          const peerUserId = activePeer.user_id;
          if (!peerUserId) return;
          const data = await messagesApi.list(token, { with_user_id: peerUserId });
          setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed loading study messages", err);
        }
      };
      loadMessages();
      interval = setInterval(loadMessages, 5000);
    }
    return () => clearInterval(interval);
  }, [activePeer, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activePeer?.user_id) return;
    setSending(true);
    try {
      await messagesApi.send(token, {
        receiver_id: activePeer.user_id,
        content: messageText.trim(),
      });
      setMessageText("");
      // Reload chat
      const fresh = await messagesApi.list(token, { with_user_id: activePeer.user_id });
      setMessages(Array.isArray(fresh) ? fresh : []);
    } catch (err) {
      alert(`Could not send message: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const name = s.name || s.student_name || "";
    const batch = s.batch_name || s.batch || "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || batch.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-[#008388] text-xs font-semibold mb-2">
            <Sparkles size={14} /> Student Commons
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Study Buddies & Classmates</h1>
          <p className="text-slate-500 text-sm mt-1">
            Connect with your fellow scholars, ask peer questions, and collaborate on assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search classmates or batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition w-64"
            />
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-amber-800 text-xs">
        <ShieldCheck size={18} className="text-amber-600 flex-shrink-0" />
        <p>
          <strong>Academic Safety Notice:</strong> All peer communications within ACASH Tuition are logged and auditable by faculty and parents to ensure an uplifting, safe, and focused learning environment.
        </p>
      </div>

      {/* Peers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredStudents.map((peer) => {
          const cfg = parseAvatar(peer.avatar_config);
          const avatarUrl = buildAvatarUrl(cfg);
          const companion = cfg.companion || "Scholar";

          return (
            <div
              key={peer.id}
              className="group bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt={peer.name}
                      className="w-16 h-16 rounded-2xl bg-slate-50 p-1 border border-cyan-100 group-hover:scale-105 transition"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <Circle size={12} className="fill-emerald-500 text-white" />
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-[#008388] capitalize">
                    {peer.batch_name || peer.batch || "Class"}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mt-4">{peer.name || "Student"}</h3>
                <p className="text-xs text-slate-400 capitalize">Mascot: {companion}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {peer.bio || `Passionate student enrolled in ${peer.batch_name || "ACASH batches"}.`}
                </p>
              </div>

              <button
                onClick={() => setActivePeer(peer)}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow-md transition active:scale-95"
              >
                <MessageSquare size={14} /> Peer Study Chat
              </button>
            </div>
          );
        })}

        {filteredStudents.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Users size={36} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-sm">No classmates found matching "{search}".</p>
          </div>
        )}
      </div>

      {/* Chat Drawer / Modal */}
      {activePeer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-4 sm:p-6">
          <div className="w-full max-w-md h-[90vh] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300">
            {/* Top Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <img
                  src={buildAvatarUrl(parseAvatar(activePeer.avatar_config))}
                  alt={activePeer.name}
                  className="w-10 h-10 rounded-xl bg-white p-0.5 border border-cyan-200"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{activePeer.name}</h4>
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                    <Circle size={8} className="fill-emerald-500 text-emerald-500" /> Active in Commons
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePeer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
              <div className="text-center my-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200/60">
                  Audited Peer Study Room
                </span>
              </div>

              {messages.map((m) => {
                const isMe = m.sender_id === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                        isMe
                          ? "bg-gradient-to-r from-[#008388] to-blue-600 text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "just now"}
                    </span>
                  </div>
                );
              })}

              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                  <MessageSquare size={32} className="mb-2 opacity-40 text-[#008388]" />
                  <p className="text-xs font-semibold text-slate-600">Start the discussion</p>
                  <p className="text-[11px] mt-1 text-slate-400">
                    Ask questions about homework, test prep, or notes!
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your study question..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-cyan-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-[#008388] to-blue-600 text-white hover:opacity-90 disabled:opacity-50 transition shadow-sm"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
