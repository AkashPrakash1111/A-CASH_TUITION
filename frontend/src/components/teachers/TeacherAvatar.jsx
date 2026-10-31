import { buildAvatarUrl } from "../avatar/dicebearOptions";

const GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-green-500",
  "from-orange-500 to-amber-500",
  "from-violet-500 to-purple-500",
  "from-rose-500 to-pink-500",
  "from-[#008388] to-teal-500",
  "from-indigo-500 to-blue-500",
  "from-yellow-500 to-orange-400",
];

function gradientFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function initialsFor(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function TeacherAvatar({
  name = "",
  avatar_config = null,
  size = "w-16 h-16",
  textSize = "text-xl",
}) {
  let avatarUrl = null;
  if (avatar_config) {
    try {
      const cfg = typeof avatar_config === "string" ? JSON.parse(avatar_config) : avatar_config;
      avatarUrl = buildAvatarUrl(cfg);
    } catch {
      // fallback
    }
  }

  if (avatarUrl) {
    return (
      <div
        className={`
          ${size}
          rounded-2xl
          bg-white
          border border-slate-100
          p-1
          flex
          items-center
          justify-center
          shadow-md
          shrink-0
          overflow-hidden
        `}
      >
        <img src={avatarUrl} alt={name} className="w-full h-full object-contain rounded-xl" />
      </div>
    );
  }

  return (
    <div
      className={`
        ${size}
        rounded-2xl
        bg-gradient-to-br
        ${gradientFor(name)}
        flex
        items-center
        justify-center
        text-white
        font-bold
        ${textSize}
        shadow-md
        shrink-0
      `}
    >
      {initialsFor(name)}
    </div>
  );
}
