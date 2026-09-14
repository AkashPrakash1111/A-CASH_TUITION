import {
  Sigma,
  FlaskConical,
  Atom,
  TestTube,
  Leaf,
  Landmark,
  Globe2,
  Laptop2,
  BookOpen,
  Palette,
  Music,
  Dumbbell,
  Languages,
} from "lucide-react";

const RULES = [
  { keywords: ["math"], icon: Sigma, color: "bg-blue-50 text-blue-600" },
  { keywords: ["physic"], icon: Atom, color: "bg-violet-50 text-violet-600" },
  { keywords: ["chemistry"], icon: TestTube, color: "bg-rose-50 text-rose-600" },
  { keywords: ["bio"], icon: Leaf, color: "bg-green-50 text-green-600" },
  { keywords: ["science"], icon: FlaskConical, color: "bg-emerald-50 text-emerald-600" },
  { keywords: ["history"], icon: Landmark, color: "bg-amber-50 text-amber-600" },
  { keywords: ["geograph"], icon: Globe2, color: "bg-cyan-50 text-cyan-600" },
  { keywords: ["computer", "coding", "programming"], icon: Laptop2, color: "bg-slate-100 text-slate-600" },
  { keywords: ["art"], icon: Palette, color: "bg-pink-50 text-pink-600" },
  { keywords: ["music"], icon: Music, color: "bg-fuchsia-50 text-fuchsia-600" },
  { keywords: ["physical", "sports", "pe"], icon: Dumbbell, color: "bg-orange-50 text-orange-600" },
  { keywords: ["english", "hindi", "language", "literature"], icon: Languages, color: "bg-teal-50 text-teal-600" },
];

export function getSubjectVisual(name = "") {
  const lower = name.toLowerCase();

  const match = RULES.find((rule) =>
    rule.keywords.some((keyword) => lower.includes(keyword))
  );

  return match || { icon: BookOpen, color: "bg-[#EAF8F8] text-[#008388]" };
}
