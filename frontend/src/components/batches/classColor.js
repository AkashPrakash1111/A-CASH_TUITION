const PALETTE = [
  { bar: "bg-cyan-500", badge: "bg-cyan-50 text-cyan-700", ring: "#06b6d4", soft: "bg-cyan-500/10" },
  { bar: "bg-violet-500", badge: "bg-violet-50 text-violet-700", ring: "#8b5cf6", soft: "bg-violet-500/10" },
  { bar: "bg-orange-500", badge: "bg-orange-50 text-orange-700", ring: "#f97316", soft: "bg-orange-500/10" },
  { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700", ring: "#10b981", soft: "bg-emerald-500/10" },
  { bar: "bg-pink-500", badge: "bg-pink-50 text-pink-700", ring: "#ec4899", soft: "bg-pink-500/10" },
  { bar: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700", ring: "#6366f1", soft: "bg-indigo-500/10" },
  { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700", ring: "#f59e0b", soft: "bg-amber-500/10" },
  { bar: "bg-teal-500", badge: "bg-teal-50 text-teal-700", ring: "#14b8a6", soft: "bg-teal-500/10" },
];

// Deterministic index from the class name so the same class always gets
// the same color across cards, filters and the insights panel.
export function getClassColor(className = "") {
  let hash = 0;

  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash);
  }

  return PALETTE[Math.abs(hash) % PALETTE.length];
}
