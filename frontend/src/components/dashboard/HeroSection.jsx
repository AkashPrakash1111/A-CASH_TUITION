import React from "react";
import { Sparkles, ArrowRight, BrainCircuit } from "lucide-react";
import Button from "../ui/Button";

export default function HeroSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[32px]
        bg-gradient-to-br
        from-[#008388]
        via-[#0FA3A8]
        to-[#4FD1C5]
        text-white
        p-10
        shadow-2xl
      "
    >
      {/* Background Glow */}

      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">

        {/* Left */}

        <div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md">
            <Sparkles size={16} />
            Welcome to ACASH AI Campus
          </div>

          <h1 className="mt-6 text-5xl font-black leading-tight">
            The Future of
            <br />
            Smart Tuition
            <br />
            Management.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-white/90 leading-8">
            Manage students, teachers, batches, live classes,
            assignments, exams and AI learning from one intelligent platform.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Button
              size="lg"
              className="bg-white text-[#008388] hover:bg-gray-100"
            >
              Launch Campus
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#008388]"
            >
              Learn More
              <ArrowRight size={18} />
            </Button>

          </div>

        </div>

        {/* Right */}

        <div className="flex justify-center">

          <div
            className="
              w-72
              h-72
              rounded-full
              bg-white/10
              backdrop-blur-xl
              border
              border-white/20
              flex
              items-center
              justify-center
              shadow-2xl
            "
          >
            <div
              className="
                w-48
                h-48
                rounded-full
                bg-white
                flex
                items-center
                justify-center
                shadow-xl
              "
            >
              <BrainCircuit
                size={90}
                className="text-[#008388]"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}