import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import loginIsland from "../../assets/login/login-island.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [entering, setEntering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(email, password);
      setEntering(true);
      setTimeout(() => {
        switch (user.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "teacher":
            navigate("/teacher/dashboard");
            break;
          case "student":
          case "parent":
          default:
            navigate("/student/dashboard");
            break;
        }
      }, 400);
    } catch (err) {
      setError(err.message || "Login failed");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F8FC] flex overflow-hidden">
      {/* Left — the living island. Hidden on small screens to keep the form usable on mobile. */}
      <div
        className="hidden lg:block lg:w-[56%] relative bg-cover bg-center"
        style={{ backgroundImage: `url(${loginIsland})` }}
        aria-hidden="true"
      >
        {/* Soft fade into the card side so there's no hard seam */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#F4F8FC]" />

        {/* Ambient floating atmosphere */}
        <span className="absolute top-[22%] left-[70%] w-1.5 h-1.5 rounded-full bg-cyan-200 blur-[1px] animate-[pulse_4s_ease-in-out_infinite]" />
        <span className="absolute top-[45%] left-[20%] w-2 h-2 rounded-full bg-white/80 blur-[1px] animate-[pulse_5s_ease-in-out_infinite_0.8s]" />
        <span className="absolute top-[65%] left-[55%] w-1 h-1 rounded-full bg-cyan-100 blur-[1px] animate-[pulse_4.5s_ease-in-out_infinite_1.6s]" />
      </div>

      {/* Right — the Gate Pass */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div
          aria-hidden="true"
          className="lg:hidden pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(20,184,166,0.22),_rgba(14,165,233,0.12)_45%,_transparent_70%)]"
        />

        <div
          className={`relative w-full max-w-[440px] transition-all duration-500 ${
            entering ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.10)] p-8 md:p-10"
          >
            {/* Wordmark */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-[#008388] to-blue-600 shadow-[0_10px_25px_rgba(0,131,136,0.35)] mb-4">
                <Sparkles className="w-7 h-7 text-white" strokeWidth={1.75} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-[#008388] to-blue-600 bg-clip-text text-transparent">
                ACASH TUTION
              </h1>
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mt-1">
                Digital Campus Portal
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Enter your credentials to unlock your learning world
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5">
                {error}
              </div>
            )}

            {/* Login ID or Email */}
            <div className="relative mb-4">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" strokeWidth={1.75} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Login ID or Email"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white/80 pl-11 pr-4 py-3.5 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20"
              />
            </div>

            {/* Password */}
            <div className="relative mb-6">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" strokeWidth={1.75} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white/80 pl-11 pr-11 py-3.5 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#008388] focus:ring-2 focus:ring-[#008388]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" strokeWidth={1.75} /> : <Eye className="w-4.5 h-4.5" strokeWidth={1.75} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-[#008388] to-blue-600 bg-[length:200%_auto] hover:bg-[right_center] text-white font-medium py-3.5 transition-all duration-500 shadow-[0_10px_30px_rgba(0,131,136,0.25)] hover:shadow-[0_16px_40px_rgba(0,131,136,0.4)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} />
              {submitting ? "Entering Campus..." : "Enter Campus"}
            </button>

            <div className="flex justify-between text-xs text-slate-400 mt-6">
              <span className="text-slate-500">
                Contact administration for account access
              </span>
              <span className="font-medium text-[#008388]">
                v0.2.0
              </span>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
