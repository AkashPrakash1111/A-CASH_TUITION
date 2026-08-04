import React from "react";
import { Sparkles, BrainCircuit, ArrowRight } from "lucide-react";

export default function AIHub() {
  return (
    <section className="mt-10">

      <div
        className="
          relative
          overflow-hidden
          rounded-[32px]
          bg-gradient-to-r
          from-[#008388]
          via-[#0F9EA3]
          to-cyan-500
          p-8
          text-white
          shadow-xl
        "
      >

        {/* Glow */}

        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-cyan-300/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">

          {/* Left */}

          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2">

              <Sparkles size={16} />

              <span className="text-sm font-medium">
                ACASH AI Assistant
              </span>

            </div>

            <h2 className="text-4xl font-bold mt-6 leading-tight">

              Your Personal AI
              <br />
              Teaching Assistant

            </h2>

            <p className="mt-5 text-white/90 leading-8">

              Generate notes, assignments,
              question papers, lesson plans,
              answer student doubts and manage
              your tuition effortlessly using AI.

            </p>

            <button
              className="
                mt-8
                flex
                items-center
                gap-3
                bg-white
                text-[#008388]
                px-6
                py-3
                rounded-2xl
                font-semibold
                hover:scale-105
                transition
              "
            >

              Open AI Studio

              <ArrowRight size={20} />

            </button>

          </div>

          {/* Right */}

          <div
            className="
              w-56
              h-56
              rounded-full
              bg-white/15
              backdrop-blur-xl
              flex
              items-center
              justify-center
              border
              border-white/20
            "
          >

            <div
              className="
                w-36
                h-36
                rounded-full
                bg-white
                flex
                items-center
                justify-center
                shadow-xl
              "
            >

              <BrainCircuit
                size={70}
                className="text-[#008388]"
              />

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}