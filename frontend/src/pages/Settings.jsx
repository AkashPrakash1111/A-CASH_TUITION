import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Sparkles,
  LogOut,
  Palette,
  Check,
  Save,
  Moon,
  Volume2,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../services/api";
import { buildAvatarUrl, getDefaultAvatarConfig } from "../components/avatar/dicebearOptions";
import AvatarBuilder from "../components/avatar/AvatarBuilder";

function parseAvatar(configStr) {
  if (!configStr) return getDefaultAvatarConfig();
  try {
    return JSON.parse(configStr);
  } catch {
    return getDefaultAvatarConfig();
  }
}

export default function Settings() {
  const { user, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [soundEffects, setSoundEffects] = useState(true);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);

  const avatarConfig = parseAvatar(user?.avatar_config);
  const avatarUrl = buildAvatarUrl(avatarConfig);

  const handleSaveAvatar = async (newConfig) => {
    setSavingAvatar(true);
    try {
      await authApi.updateAvatar(token, newConfig);
      updateUser({ avatar_config: JSON.stringify(newConfig) });
      setIsEditingAvatar(false);
      setAvatarSaved(true);
      setTimeout(() => setAvatarSaved(false), 3000);
    } catch (err) {
      alert(`Could not save avatar: ${err.message}`);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/80 shadow-sm flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-[#008388] text-xs font-semibold mb-2">
            <SettingsIcon size={14} /> Profile & System Preferences
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Account Settings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your digital profile, persona ambiance, notifications, and security.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Profile Card (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={avatarUrl}
                alt={user?.name}
                className="w-24 h-24 rounded-3xl bg-slate-50 p-1 border-2 border-cyan-200 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>

            <h3 className="font-extrabold text-slate-800 text-lg">{user?.name || "User"}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>

            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#008388]/10 text-[#008388]">
              Role: {user?.role || "Student"}
            </span>

            <button
              type="button"
              onClick={() => setIsEditingAvatar(true)}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#008388] to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
            >
              <Palette size={14} /> Customize Avatar
            </button>

            {avatarSaved && (
              <p className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                <Check size={12} /> Avatar updated!
              </p>
            )}

            {user?.role === "student" && (
              <Link
                to="/student/me-cash"
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
              >
                <Sparkles size={14} /> Open Campus Atelier
              </Link>
            )}
          </div>

          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Shield size={16} className="text-cyan-600" /> Security & Identity
            </h4>
            <p>Authentication Token: <strong>Active Session</strong></p>
            <p>Account Type: <strong className="capitalize">{user?.role} Portal</strong></p>
            <p>Ecosystem: <strong>ACASH Digital Campus</strong></p>
          </div>
        </div>

        {/* Right Preferences Form (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          <form onSubmit={handleSavePreferences} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={18} className="text-[#008388]" /> Campus Atmosphere & Preferences
            </h3>

            {/* Toggles */}
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-[#008388] flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm">Ethereal Ambient Glow</h5>
                    <p className="text-[11px] text-slate-500">Render whimsical island particles and magical background gradients.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={ambientGlow}
                  onChange={(e) => setAmbientGlow(e.target.checked)}
                  className="w-5 h-5 accent-[#008388] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm">Interactive Sound Cues</h5>
                    <p className="text-[11px] text-slate-500">Auditory feedback on quest turn-ins, dice-rolls, and notifications.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                  className="w-5 h-5 accent-[#008388] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm">Academic Alerts & Reminders</h5>
                    <p className="text-[11px] text-slate-500">Receive timely warnings for upcoming exams, live classes, and homework deadlines.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 accent-[#008388] rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {saved ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Check size={14} /> Preferences updated successfully!
                </span>
              ) : <span />}

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 shadow-sm transition"
              >
                <Save size={14} /> Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Avatar Customization Modal */}
      {isEditingAvatar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#008388]">
                  Character Atelier
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                  Customize Your Persona
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose your hairstyle, expressions, colors, and accessories. Saves to your campus profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingAvatar(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <AvatarBuilder
              initialConfig={avatarConfig}
              onSave={handleSaveAvatar}
              saving={savingAvatar}
            />
          </div>
        </div>
      )}
    </div>
  );
}