// Fixed, non-interactive layer behind the whole app: soft aurora glows plus
// slowly twinkling pastel sparkles. Positions are fixed numbers (not random)
// so the layer never changes between renders.
const SPARKLES = [
  { l: "6%", t: "12%", s: 14, c: "text-violet-300", d: 0 },
  { l: "18%", t: "70%", s: 10, c: "text-amber-300", d: 1.2 },
  { l: "30%", t: "28%", s: 8, c: "text-pink-300", d: 2.1 },
  { l: "44%", t: "88%", s: 12, c: "text-cyan-300", d: 0.6 },
  { l: "58%", t: "10%", s: 10, c: "text-amber-300", d: 1.8 },
  { l: "71%", t: "52%", s: 14, c: "text-violet-300", d: 2.6 },
  { l: "83%", t: "20%", s: 9, c: "text-pink-300", d: 0.9 },
  { l: "92%", t: "78%", s: 12, c: "text-cyan-300", d: 3.1 },
  { l: "96%", t: "42%", s: 8, c: "text-amber-300", d: 1.5 },
  { l: "12%", t: "46%", s: 7, c: "text-cyan-300", d: 2.9 },
];

export default function MagicBackdrop() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <div className="aurora-blob absolute -top-32 -left-32 w-[26rem] h-[26rem] rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="aurora-blob absolute top-48 right-0 w-[30rem] h-[30rem] rounded-full bg-violet-200/40 blur-3xl" style={{ animationDelay: "-4s" }} />
      <div className="aurora-blob absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-pink-100/60 blur-3xl" style={{ animationDelay: "-8s" }} />
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className={`sparkle ${s.c}`}
          style={{ left: s.l, top: s.t, width: s.s, height: s.s, "--delay": `${s.d}s`, "--dur": `${4 + (i % 3)}s` }}
        />
      ))}
    </div>
  );
}
