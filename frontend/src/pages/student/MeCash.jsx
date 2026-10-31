import { useState, useRef } from "react";
import {
  Sparkles,
  Save,
  Shuffle,
  Shield,
  Award,
  Flame,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../services/api";
import {
  STYLE_OPTIONS,
  HAIR_OPTIONS,
  EYES_OPTIONS,
  EYEBROWS_OPTIONS,
  GLASSES_OPTIONS,
  EARRINGS_OPTIONS,
  SKIN_COLORS,
  HAIR_COLORS,
  BACKGROUND_COLORS,
  getDefaultAvatarConfig,
  buildAvatarUrl,
} from "../../components/avatar/dicebearOptions";

// Import all 9 elemental mascot companions
import blossomImg from "../../assets/mascots/blossom.png";
import cloudImg from "../../assets/mascots/cloud.png";
import cosmicImg from "../../assets/mascots/cosmic.png";
import crystalImg from "../../assets/mascots/crystal.png";
import fireImg from "../../assets/mascots/fire.png";
import iceImg from "../../assets/mascots/ice.png";
import leafImg from "../../assets/mascots/leaf.png";
import lightningImg from "../../assets/mascots/lightning.png";
import waterImg from "../../assets/mascots/water.png";

const COMPANIONS = [
  { id: "cosmic", name: "Cosmo", element: "Astral", img: cosmicImg, color: "#8B5CF6", aura: "from-purple-500/20 to-indigo-500/20" },
  { id: "crystal", name: "Krystal", element: "Geo", img: crystalImg, color: "#06B6D4", aura: "from-cyan-500/20 to-teal-500/20" },
  { id: "fire", name: "Blaze", element: "Ignis", img: fireImg, color: "#EF4444", aura: "from-red-500/20 to-orange-500/20" },
  { id: "lightning", name: "Bolt", element: "Volt", img: lightningImg, color: "#F59E0B", aura: "from-amber-500/20 to-yellow-500/20" },
  { id: "leaf", name: "Sprout", element: "Verdant", img: leafImg, color: "#10B981", aura: "from-emerald-500/20 to-green-500/20" },
  { id: "water", name: "Aqua", element: "Tide", img: waterImg, color: "#3B82F6", aura: "from-blue-500/20 to-cyan-500/20" },
  { id: "ice", name: "Frosty", element: "Glacier", img: iceImg, color: "#38BDF8", aura: "from-sky-500/20 to-indigo-500/20" },
  { id: "cloud", name: "Nimbo", element: "Aether", img: cloudImg, color: "#94A3B8", aura: "from-slate-400/20 to-cyan-500/20" },
  { id: "blossom", name: "Flora", element: "Bloom", img: blossomImg, color: "#EC4899", aura: "from-pink-500/20 to-rose-500/20" },
];

const AURAS = [
  { id: "cyan", name: "Aurora Cyan", ring: "ring-[#008388]", glow: "rgba(0,131,136,0.3)" },
  { id: "violet", name: "Celestial Violet", ring: "ring-purple-500", glow: "rgba(139,92,246,0.3)" },
  { id: "gold", name: "Solar Gold", ring: "ring-amber-500", glow: "rgba(245,158,11,0.3)" },
  { id: "emerald", name: "Emerald Sanctuary", ring: "ring-emerald-500", glow: "rgba(16,185,129,0.3)" },
  { id: "rose", name: "Crimson Spark", ring: "ring-rose-500", glow: "rgba(239,68,68,0.3)" },
];

const TITLES = [
  "Cosmic Scholar",
  "Math Wizard",
  "Discovery Explorer",
  "Campus Navigator",
  "Master Scribe",
  "Honor Laureate",
];

const MOODS = ["focused", "happy", "curious", "confident", "calm"];

function parseAvatarConfig(user) {
  if (!user?.avatar_config) return getDefaultAvatarConfig();
  try {
    return JSON.parse(user.avatar_config);
  } catch {
    return getDefaultAvatarConfig();
  }
}

export default function MeCash() {
  const { user, token, updateUser } = useAuth();
  const [config, setConfig] = useState(() => parseAvatarConfig(user));
  const [companionId, setCompanionId] = useState(config.companionId || "cosmic");
  const [auraId, setAuraId] = useState(config.auraId || "cyan");
  const [title, setTitle] = useState(config.title || "Cosmic Scholar");
  const [mood, setMood] = useState(config.mood || "focused");
  const [activeTab, setActiveTab] = useState("character"); // character | companion | aura | identity

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 3D Perspective Tilt State
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / (rect.height / 2)) * 12;
    const rotateY = (x / (rect.width / 2)) * 12;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const update = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const currentCompanion = COMPANIONS.find((c) => c.id === companionId) || COMPANIONS[0];
  const currentAura = AURAS.find((a) => a.id === auraId) || AURAS[0];
  const previewUrl = buildAvatarUrl(config);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    const fullConfig = {
      ...config,
      companionId,
      auraId,
      title,
      mood,
    };

    try {
      await authApi.updateAvatar(token, fullConfig);
      const freshUser = await authApi.me(token);
      updateUser(freshUser);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      alert(`Could not save character: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleShuffle = () => {
    const randomCompanion = COMPANIONS[Math.floor(Math.random() * COMPANIONS.length)];
    const randomAura = AURAS[Math.floor(Math.random() * AURAS.length)];
    const randomTitle = TITLES[Math.floor(Math.random() * TITLES.length)];

    setCompanionId(randomCompanion.id);
    setAuraId(randomAura.id);
    setTitle(randomTitle);

    setConfig((prev) => ({
      ...prev,
      seed: `Citizen_${Math.floor(Math.random() * 9000 + 1000)}`,
      hair: HAIR_OPTIONS[Math.floor(Math.random() * HAIR_OPTIONS.length)],
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
      eyes: EYES_OPTIONS[Math.floor(Math.random() * EYES_OPTIONS.length)],
      eyebrows: EYEBROWS_OPTIONS[Math.floor(Math.random() * EYEBROWS_OPTIONS.length)],
      backgroundColor: BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)],
    }));
  };

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#008388] mb-1">
            <Sparkles size={14} />
            <span>Character Identity Space</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">ME-CASH Atelier</h1>
          <p className="text-slate-500 text-sm mt-1">
            Design your digital citizen. Your character represents you across all campus halls, classes, and friend commons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-[#008388] hover:text-[#008388] transition shadow-xs cursor-pointer"
          >
            <Shuffle size={15} />
            <span>Surprise Me</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-[#008388] to-blue-600 text-white font-semibold text-sm shadow-[0_10px_25px_rgba(0,131,136,0.3)] hover:shadow-[0_14px_32px_rgba(0,131,136,0.4)] transition disabled:opacity-60 cursor-pointer"
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? "Saving to Campus..." : "Save Character"}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle2 size={18} />
          <span>Character saved successfully! Your identity has updated throughout ACASH Digital Campus. ✨</span>
        </div>
      )}

      {/* Main Grid: 3D Stage on Left, Customizer on Right */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* 3D Perspective Card Stage */}
        <div className="flex flex-col items-center">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transition: "transform 0.15s ease-out",
            }}
            className="w-full max-w-[340px] rounded-[36px] bg-gradient-to-b from-white to-slate-50 border-2 border-white/90 shadow-[0_25px_60px_rgba(15,23,42,0.12)] p-6 relative overflow-hidden"
          >
            {/* Ambient Background Aura */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 blur-2xl"
              style={{
                background: `radial-gradient(circle at 50% 30%, ${currentAura.glow}, transparent 70%)`,
              }}
            />

            {/* Badge & Level Banner */}
            <div className="flex items-center justify-between relative z-10 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8F8] text-[#008388] text-xs font-bold">
                <Shield size={12} />
                <span>Level 4 Scholar</span>
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                <Flame size={12} />
                <span>12 Day Streak</span>
              </span>
            </div>

            {/* Avatar Frame with Aura Ring */}
            <div className="relative flex justify-center items-center my-6 z-10">
              <div
                className={`w-48 h-48 rounded-[32px] p-2 ring-4 ${currentAura.ring} transition-all duration-300 shadow-xl flex items-center justify-center relative`}
                style={{ backgroundColor: `#${config.backgroundColor || "F4F8FC"}` }}
              >
                <img src={previewUrl} alt="Character Avatar" className="w-40 h-40 object-contain drop-shadow-md" />

                {/* Floating Elemental Pet Companion */}
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-md p-1.5 shadow-lg border border-white flex items-center justify-center animate-[bounce_3s_ease-in-out_infinite]">
                  <img src={currentCompanion.img} alt={currentCompanion.name} className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {/* Identity Summary Card */}
            <div className="text-center relative z-10 mt-4 pt-4 border-t border-slate-100">
              <h3 className="font-extrabold text-xl text-slate-800">{user?.name || "Student"}</h3>
              <p className="text-xs font-bold text-[#008388] uppercase tracking-wider mt-0.5">{title}</p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-2">
                <span>Companion: <b className="text-slate-600">{currentCompanion.name}</b></span>
                <span>•</span>
                <span>Element: <b className="text-slate-600">{currentCompanion.element}</b></span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-3">
            Move your mouse over the card to experience 3D spatial perspective
          </p>
        </div>

        {/* Customization Workspace */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-[32px] shadow-sm p-6 sm:p-8 space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
            {[
              { id: "character", label: "Character Features" },
              { id: "companion", label: "Companion Mascot" },
              { id: "aura", label: "Aura & Glow" },
              { id: "identity", label: "Title & Identity" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#008388] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: CHARACTER FEATURES */}
          {activeTab === "character" && (
            <div className="space-y-6">
              {/* Style options */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Base Style</p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {STYLE_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => update("style", s.id)}
                      className={`flex flex-col items-center p-2 rounded-2xl border-2 transition cursor-pointer ${
                        config.style === s.id ? "border-[#008388] bg-[#008388]/5" : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <img src={buildAvatarUrl({ ...config, style: s.id })} alt={s.label} className="w-10 h-10 object-contain" />
                      <span className="text-[10px] font-semibold text-slate-600 mt-1 truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hairstyle */}
              {config.style === "adventurer" && (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hairstyle</p>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_OPTIONS.map((h) => (
                        <button
                          key={h}
                          onClick={() => update("hair", h)}
                          className={`p-1 rounded-xl border-2 transition cursor-pointer ${
                            config.hair === h ? "border-[#008388] bg-[#008388]/5" : "border-slate-100"
                          }`}
                        >
                          <img src={buildAvatarUrl({ ...config, hair: h })} alt={h} className="w-10 h-10 object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Eyes & Eyebrows */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Eyes</p>
                      <div className="flex flex-wrap gap-2">
                        {EYES_OPTIONS.slice(0, 6).map((e) => (
                          <button
                            key={e}
                            onClick={() => update("eyes", e)}
                            className={`p-1 rounded-xl border-2 transition cursor-pointer ${
                              config.eyes === e ? "border-[#008388] bg-[#008388]/5" : "border-slate-100"
                            }`}
                          >
                            <img src={buildAvatarUrl({ ...config, eyes: e }, { glasses: null })} alt={e} className="w-9 h-9 object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Eyebrows</p>
                      <div className="flex flex-wrap gap-2">
                        {EYEBROWS_OPTIONS.slice(0, 6).map((eb) => (
                          <button
                            key={eb}
                            onClick={() => update("eyebrows", eb)}
                            className={`p-1 rounded-xl border-2 transition cursor-pointer ${
                              config.eyebrows === eb ? "border-[#008388] bg-[#008388]/5" : "border-slate-100"
                            }`}
                          >
                            <img src={buildAvatarUrl({ ...config, eyebrows: eb }, { glasses: null })} alt={eb} className="w-9 h-9 object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Colors: Skin & Hair */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Skin Tone</p>
                      <div className="flex flex-wrap gap-2">
                        {SKIN_COLORS.map((hex) => (
                          <button
                            key={hex}
                            onClick={() => update("skinColor", hex)}
                            className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${
                              config.skinColor === hex ? "border-[#008388] scale-110" : "border-white shadow-xs"
                            }`}
                            style={{ backgroundColor: `#${hex}` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hair Color</p>
                      <div className="flex flex-wrap gap-2">
                        {HAIR_COLORS.map((hex) => (
                          <button
                            key={hex}
                            onClick={() => update("hairColor", hex)}
                            className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${
                              config.hairColor === hex ? "border-[#008388] scale-110" : "border-white shadow-xs"
                            }`}
                            style={{ backgroundColor: `#${hex}` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Background Color */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Stage Background</p>
                <div className="flex flex-wrap gap-2">
                  {BACKGROUND_COLORS.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => update("backgroundColor", hex)}
                      className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${
                        config.backgroundColor === hex ? "border-[#008388] scale-110" : "border-white shadow-xs"
                      }`}
                      style={{ backgroundColor: `#${hex}` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPANION MASCOT */}
          {activeTab === "companion" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Choose an elemental creature companion to accompany you across your learning journeys.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {COMPANIONS.map((comp) => {
                  const isSelected = companionId === comp.id;
                  return (
                    <div
                      key={comp.id}
                      onClick={() => setCompanionId(comp.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected ? "border-[#008388] bg-[#008388]/5 shadow-sm" : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl p-1 bg-white shadow-xs shrink-0 flex items-center justify-center">
                        <img src={comp.img} alt={comp.name} className="w-10 h-10 object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{comp.name}</h4>
                        <span className="text-[11px] font-semibold text-[#008388]">{comp.element} Element</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: AURA & GLOW */}
          {activeTab === "aura" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Select your energy aura. This glow surrounds your avatar in the living campus and classroom lists.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {AURAS.map((a) => {
                  const isSelected = auraId === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => setAuraId(a.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected ? "border-[#008388] bg-[#008388]/5" : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ring-4 ${a.ring}`} style={{ backgroundColor: a.glow }} />
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{a.name}</h4>
                        <span className="text-xs text-slate-400">Atmospheric Resonance</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TITLE & IDENTITY */}
          {activeTab === "identity" && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Academic Title</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {TITLES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTitle(t)}
                      className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                        title === t ? "border-[#008388] bg-[#008388]/5 text-[#008388] font-bold" : "border-slate-100 text-slate-600"
                      }`}
                    >
                      <Award size={16} />
                      <span className="text-xs font-semibold">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Campus Mood</p>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`px-3 py-1.5 rounded-xl border capitalize text-xs transition cursor-pointer ${
                        mood === m ? "border-[#008388] bg-[#008388] text-white font-bold" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
