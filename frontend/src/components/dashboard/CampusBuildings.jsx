import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { campusLayout, getBuildingRoute } from "../../data/campusLayout";

import library from "../../assets/buildings/library.png";
import ai from "../../assets/buildings/ai.png";
import faculty from "../../assets/buildings/faculty.png";
import students from "../../assets/buildings/students.png";
import assignments from "../../assets/buildings/assignments.png";
import exam from "../../assets/buildings/exam.png";
import analytics from "../../assets/buildings/analytics.png";
import admin from "../../assets/buildings/admin.png";
import live from "../../assets/buildings/live.png";

const images = {
  administration: admin,
  ai,
  library,
  faculty,
  students,
  assignments,
  exams: exam,
  analytics,
  live,
};

export default function CampusBuildings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "admin";

  return (
    <>
      {Object.entries(campusLayout).map(([key, building]) => (
        <div
          key={key}
          className="absolute -translate-x-1/2 -translate-y-1/2 group"
          style={{
            top: building.building.top,
            left: building.building.left,
            width: building.building.width,
            zIndex: building.building.zIndex,
          }}
        >
          {/* Glow */}

          <div
            className="
              absolute
              inset-0
              rounded-full
              bg-cyan-400/20
              blur-2xl
              scale-90
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-500
            "
          />

          {/* Shadow */}

          <div
            className="
              absolute
              left-1/2
              top-[88%]

              h-5
              w-[70%]

              -translate-x-1/2

              rounded-full

              bg-black/20

              blur-xl
            "
          />

          {/* Building */}

          <img
            src={images[key]}
            alt={building.title}
            draggable={false}
            onClick={() => navigate(getBuildingRoute(key, role))}
            className="
              relative

              cursor-pointer
              select-none

              transition-all
              duration-500

              group-hover:scale-110
              group-hover:-translate-y-3

              drop-shadow-2xl
            "
          />
        </div>
      ))}
    </>
  );
}