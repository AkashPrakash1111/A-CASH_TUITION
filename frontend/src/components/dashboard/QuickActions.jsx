import React from "react";
import {
  UserPlus,
  GraduationCap,
  BookOpen,
  Layers3,
  ArrowRight,
} from "lucide-react";

const actions = [
  {
    title: "Add Student",
    description: "Enroll a new student",
    icon: UserPlus,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Add Teacher",
    description: "Create a faculty profile",
    icon: GraduationCap,
    color: "from-emerald-500 to-green-400",
  },
  {
    title: "Add Subject",
    description: "Create a new subject",
    icon: BookOpen,
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Create Batch",
    description: "Organize classes",
    icon: Layers3,
    color: "from-orange-500 to-yellow-400",
  },
];

export default function QuickActions() {
  return (
    <section className="mt-10">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <p className="text-gray-500 mt-1">
            Frequently used shortcuts.
          </p>

        </div>

      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

        {actions.map((action) => {

          const Icon = action.icon;

          return (

            <div
              key={action.title}
              className="
                group
                rounded-3xl
                bg-white
                border
                border-gray-200
                p-6
                shadow-sm
                hover:shadow-xl
                hover:-translate-y-1
                transition-all
                duration-300
                cursor-pointer
              "
            >

              <div
                className={`
                  bg-gradient-to-br
                  ${action.color}
                  w-16
                  h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  text-white
                  mb-6
                `}
              >
                <Icon size={30} />
              </div>

              <h3 className="text-lg font-bold">
                {action.title}
              </h3>

              <p className="text-gray-500 mt-2">
                {action.description}
              </p>

              <div className="mt-6 flex items-center text-[#008388] font-semibold">

                Open

                <ArrowRight
                  size={18}
                  className="
                    ml-2
                    transition-transform
                    group-hover:translate-x-2
                  "
                />

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
}