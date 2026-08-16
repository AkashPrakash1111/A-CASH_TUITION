import campusBuildings from "../../data/campusBuildings";
import CampusBuildingCard from "../ui/premium/CampusBuildingCard";

import { Sparkles } from "lucide-react";

export default function DigitalCampus() {
  return (
    <section className="mt-10">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <span
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-cyan-50
              px-4
              py-2
              text-sm
              font-semibold
              text-[#008388]
            "
          >
            <Sparkles size={16} />

            ACASH Digital Campus

          </span>

          <h2 className="mt-4 text-4xl font-bold text-slate-800">

            Explore Your Campus

          </h2>

          <p className="mt-3 max-w-3xl text-slate-500 leading-7">

            Every building represents an important part of your tuition
            ecosystem. Enter a building to manage students, teachers,
            notes, exams and AI-powered learning.

          </p>

        </div>

      </div>

      {/* Campus Hero */}

      <div
        className="
          rounded-[36px]
          bg-gradient-to-r
          from-cyan-500
          via-[#008388]
          to-blue-600

          p-10

          text-white

          relative

          overflow-hidden

          mb-10
        "
      >
        {/* Decorative circles */}

        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />

        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/5" />

        <div className="relative">

          <h2 className="text-5xl font-bold">

            Welcome to ACASH Campus

          </h2>

          <p className="mt-5 max-w-2xl text-lg text-white/90 leading-8">

            Your complete digital institution.
            Manage every department through an
            interactive campus experience.

          </p>

        </div>

      </div>

      {/* Buildings */}

      <div
        className="
          grid
          gap-8

          md:grid-cols-2

          xl:grid-cols-3
        "
      >

        {campusBuildings.map((building) => (

          <CampusBuildingCard
            key={building.id}
            building={building}
          />

        ))}

      </div>

    </section>
  );
}