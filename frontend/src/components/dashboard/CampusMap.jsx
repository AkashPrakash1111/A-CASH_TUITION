import campusMap from "../../assets/campus/campus-map.png";

import CampusBuildings from "./CampusBuildings";
import CampusPeople from "./CampusPeople";
import BuildingLabel from "./BuildingLabel";

import campusLayout, { getBuildingRoute } from "../../data/campusLayout";
import { useAuth } from "../../hooks/useAuth";

import {
  LibraryBig,
  BrainCircuit,
  GraduationCap,
  Users,
  ClipboardList,
  FileCheck2,
  Video,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const icons = {
  administration: ShieldCheck,
  analytics: BarChart3,
  ai: BrainCircuit,
  library: LibraryBig,
  faculty: GraduationCap,
  live: Video,
  exams: FileCheck2,
  students: Users,
  assignments: ClipboardList,
};

export default function CampusMap() {
  const { user } = useAuth();
  const role = user?.role || "admin";

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        rounded-[40px]
        bg-white
        shadow-2xl
      "
    >
      {/* =====================================================
          CAMPUS GROUND
      ====================================================== */}

      <img
        src={campusMap}
        alt="ACASH Digital Campus"
        draggable={false}
        className="
          block
          w-full
          h-auto
          select-none
          pointer-events-none
        "
      />

      {/* =====================================================
          BUILDINGS
      ====================================================== */}

      <CampusBuildings />

      {/* =====================================================
          CAMPUS PEOPLE / AVATARS
      ====================================================== */}

      <CampusPeople />

      {/* =====================================================
          BUILDING LABELS
          Read positions from campusLayout.js
      ====================================================== */}

      {Object.entries(campusLayout).map(([key, building]) => {
        const Icon = icons[key];

        if (!Icon) return null;

        return (
          <BuildingLabel
            key={key}
            title={building.title}
            subtitle={building.subtitle}
            icon={Icon}
            route={getBuildingRoute(key, role)}
            top={building.label.top}
            left={building.label.left}
          />
        );
      })}
    </section>
  );
}