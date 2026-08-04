import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  NotebookPen,
  ClipboardCheck,
  Video,
  Bot,
  BarChart3,
} from "lucide-react";

import CampusBuilding from "./CampusBuilding";

export default function CampusScene() {
  const navigate = useNavigate();

  return (
    <section className="relative mt-10">

      {/* Background */}

      <div className="rounded-[40px] bg-gradient-to-br from-slate-50 to-cyan-50 p-10 border border-gray-200 shadow-lg">

        <div className="grid grid-cols-3 gap-10 items-center">

          {/* LEFT */}

          <div className="space-y-6">

            <CampusBuilding
              title="Students"
              subtitle="Manage students"
              icon={Users}
              gradient="from-blue-500/10 to-cyan-500/10"
              onClick={() => navigate("/admin/students")}
            />

            <CampusBuilding
              title="Teachers"
              subtitle="Faculty Management"
              icon={GraduationCap}
              gradient="from-green-500/10 to-emerald-500/10"
              onClick={() => navigate("/admin/teachers")}
            />

            <CampusBuilding
              title="Subjects"
              subtitle="Academic Subjects"
              icon={BookOpen}
              gradient="from-purple-500/10 to-fuchsia-500/10"
              onClick={() => navigate("/admin/subjects")}
            />

          </div>

          {/* CENTER */}

          <div className="flex justify-center">

            <div
              className="
              w-72
              h-72
              rounded-full
              bg-gradient-to-br
              from-[#008388]
              to-cyan-400
              flex
              items-center
              justify-center
              shadow-2xl
              animate-pulse
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
              "
              >

                <Bot
                  size={90}
                  className="text-[#008388]"
                />

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            <CampusBuilding
              title="Notes"
              subtitle="Digital Library"
              icon={NotebookPen}
              gradient="from-pink-500/10 to-rose-500/10"
              onClick={() => navigate("/admin/notes")}
            />

            <CampusBuilding
              title="Exams"
              subtitle="Mock Tests"
              icon={ClipboardCheck}
              gradient="from-orange-500/10 to-yellow-500/10"
              onClick={() => navigate("/admin/exams")}
            />

            <CampusBuilding
              title="Live Classes"
              subtitle="Online Learning"
              icon={Video}
              gradient="from-indigo-500/10 to-blue-500/10"
              onClick={() => navigate("/admin/live-classes")}
            />

          </div>

        </div>

        {/* Bottom Row */}

        <div className="grid md:grid-cols-2 gap-6 mt-10">

          <CampusBuilding
            title="AI Studio"
            subtitle="AI Powered Learning"
            icon={Bot}
            gradient="from-cyan-500/10 to-teal-500/10"
            onClick={() => navigate("/admin/ai-studio")}
          />

          <CampusBuilding
            title="Analytics"
            subtitle="Performance Dashboard"
            icon={BarChart3}
            gradient="from-violet-500/10 to-indigo-500/10"
            onClick={() => navigate("/admin/analytics")}
          />

        </div>

      </div>

    </section>
  );
}