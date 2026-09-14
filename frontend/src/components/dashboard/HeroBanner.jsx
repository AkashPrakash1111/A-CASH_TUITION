import {
  Sparkles,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import AvatarEngine from "../../core/avatar/AvatarEngine";
import AnimatedButton from "../ui/premium/AnimatedButton";

export default function HeroBanner() {
  const students = AvatarEngine.getTopPerformers(5);
  const ai = AvatarEngine.getAI();

  return (
    <section
      className="
        relative
        overflow-hidden

        rounded-[40px]

        bg-gradient-to-br
        from-[#008388]
        via-cyan-500
        to-blue-600

        p-10

        text-white

        shadow-[0_25px_70px_rgba(15,23,42,0.15)]
      "
    >
      {/* Decorative Background */}

      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

      <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-2 items-stretch">

        {/* Left */}

        <div className="flex flex-col justify-center">

          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-md">

            <Sparkles size={16} />

            Welcome to ACASH Digital Campus

          </div>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight">

            Good Morning,
            <br />
            Admin 👋

          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">

            Manage your entire tuition ecosystem from one
            intelligent workspace. Students, teachers,
            assignments, notes and AI are all connected
            through your Digital Campus.

          </p>

          {/* Buttons */}

          <div className="mt-8 flex flex-wrap gap-4">

            <AnimatedButton>

              Explore Campus

              <ArrowRight size={18} />

            </AnimatedButton>

            <AnimatedButton variant="secondary">

              <CalendarDays size={18} />

              Today's Schedule

            </AnimatedButton>

          </div>

        </div>

        {/* Right */}

        <div className="flex flex-col justify-between gap-6 h-full">

          {/* AI Card */}

          <div className="flex-1 rounded-[28px] bg-white/15 backdrop-blur-xl border border-white/20 p-6 flex flex-col justify-center">

            <div className="flex items-center gap-4">

              <img
                src={ai.avatar}
                alt="AI"
                className="h-16 w-16 rounded-2xl bg-white"
              />

              <div>

                <h3 className="text-xl font-bold">

                  {ai.name}

                </h3>

                <p className="text-white/80">

                  Ready to help your campus today.

                </p>

              </div>

            </div>

            <div className="mt-6 rounded-2xl bg-white/10 p-4">

              <p className="text-sm leading-7">

                📚 12 new note submissions today

                <br />

                🎥 3 live classes are scheduled

                <br />

                📝 8 assignments are pending review

              </p>

            </div>

          </div>

          {/* Community */}

          <div className="flex-1 rounded-[28px] bg-white/15 backdrop-blur-xl border border-white/20 p-6 flex flex-col justify-center">

            <h3 className="font-bold text-lg">

              Active Campus Community

            </h3>

            <div className="mt-5 flex items-center">

              {students.map((student) => (

                <img
                  key={student.id}
                  src={student.avatar}
                  alt={student.name}
                  className="
                    h-12
                    w-12
                    rounded-full
                    border-2
                    border-white
                    -ml-2
                    first:ml-0
                    shadow-lg
                  "
                />

              ))}

              <div className="ml-4">

                <p className="font-semibold">

                  {AvatarEngine.getCounts().online} members online

                </p>

                <p className="text-sm text-white/80">

                  Students • Teachers • AI Assistant

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}