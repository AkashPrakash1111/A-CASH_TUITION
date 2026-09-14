import { useState } from "react";
import { LogOut, Sparkles } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../services/api";
import AvatarBuilder from "../../components/avatar/AvatarBuilder";
import { buildAvatarUrl, getDefaultAvatarConfig } from "../../components/avatar/dicebearOptions";

function parseAvatarConfig(user) {
  if (!user?.avatar_config) return getDefaultAvatarConfig();
  try {
    return JSON.parse(user.avatar_config);
  } catch {
    // saved config was somehow malformed — fall back rather than crash
    return getDefaultAvatarConfig();
  }
}

export default function StudentDashboard() {
  const { user, token, logout, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const currentConfig = parseAvatarConfig(user);
  const currentAvatarUrl = buildAvatarUrl(currentConfig);

  const handleSaveAvatar = async (config) => {
    setSaving(true);
    setSavedMessage(false);
    try {
      await authApi.updateAvatar(token, config);
      // Re-fetch the user fresh from the server rather than trusting the
      // save response's shape — this guarantees the header preview reflects
      // exactly what's actually stored, with no room for a stale/mismatched
      // local update to silently show the old character.
      const fresh = await authApi.me(token);
      updateUser(fresh);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      alert(`Could not save your character: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F8FC] p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={currentAvatarUrl}
              alt="Your character"
              className="w-16 h-16 rounded-2xl bg-white shadow-md p-1"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Welcome back, {user?.name || "Student"} 👋
              </h1>
              <p className="text-slate-500 text-sm">Good to see you at ACASH Digital Campus.</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>

        {/* Avatar builder */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.06)] p-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#008388]" />
            <h2 className="text-xl font-bold text-slate-800">Customize Your Character</h2>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Make it yours — this is how the campus will see you.
          </p>

          <AvatarBuilder
            initialConfig={currentConfig}
            onSave={handleSaveAvatar}
            saving={saving}
          />

          {savedMessage && (
            <p className="text-sm text-[#008388] font-medium mt-4">
              Saved! Your character has been updated. ✨
            </p>
          )}
        </div>

        {/* Placeholder for what's coming next */}
        <div className="bg-white/50 border border-dashed border-slate-200 rounded-[32px] p-8 text-center text-slate-400">
          Your classes, assignments, and notes will appear here soon.
        </div>
      </div>
    </main>
  );
}
