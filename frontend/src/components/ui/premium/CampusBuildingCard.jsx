import { ArrowRight, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatusBadge from "./StatusBadge";

export default function CampusBuildingCard({
  building,
}) {
  const navigate = useNavigate();

  const Icon = building.icon;

  return (
    <div
      onClick={() => navigate(building.route)}
      className="
        group
        relative
        overflow-hidden

        rounded-[32px]

        bg-white

        border
        border-slate-200

        shadow-sm

        hover:shadow-2xl
        hover:-translate-y-2

        transition-all
        duration-500

        cursor-pointer
      "
    >
      {/* Gradient Background */}

      <div
        className={`
          absolute
          inset-0

          bg-gradient-to-br

          ${building.gradient}

          opacity-[0.06]

          group-hover:opacity-[0.12]

          transition
        `}
      />

      {/* Content */}

      <div className="relative p-7">

        {/* Header */}

        <div className="flex justify-between items-start">

          {/* Icon */}

          <div
            className="
              w-16
              h-16

              rounded-2xl

              bg-white

              shadow-lg

              flex
              items-center
              justify-center
            "
          >
            <Icon
              size={30}
              color={building.color}
            />
          </div>

          <StatusBadge
            status={building.status}
            size="sm"
          />

        </div>

        {/* Title */}

        <div className="mt-6">

          <h2 className="text-2xl font-bold text-slate-800">

            {building.title}

          </h2>

          <p className="text-slate-500 mt-2 leading-7">

            {building.description}

          </p>

        </div>

        {/* Avatars */}

        <div className="mt-7 flex items-center">

          {building.avatars.length === 0 ? (

            <div className="flex">

              {[1,2,3].map((i)=>(

                <div
                  key={i}
                  className="
                    -ml-2 first:ml-0

                    w-10
                    h-10

                    rounded-full

                    bg-gradient-to-br
                    from-cyan-400
                    to-blue-500

                    border-2
                    border-white

                    flex
                    items-center
                    justify-center

                    text-white
                    font-bold
                  "
                >
                  {i}
                </div>

              ))}

            </div>

          ) : (

            <div className="flex">

              {building.avatars.map((avatar,index)=>(

                <img
                  key={index}
                  src={avatar}
                  alt=""
                  className="
                    w-10
                    h-10
                    rounded-full
                    object-cover

                    border-2
                    border-white

                    -ml-2
                    first:ml-0
                  "
                />

              ))}

            </div>

          )}

          <span className="ml-4 text-sm text-slate-500">

            Active Community

          </span>

        </div>

        {/* Live Activity */}

        <div
          className="
            mt-8

            rounded-2xl

            bg-slate-50

            p-4

            flex
            items-center
            gap-3
          "
        >

          <Activity
            size={18}
            className="text-[#008388]"
          />

          <span className="text-sm text-slate-600">

            {building.liveActivity}

          </span>

        </div>

        {/* Statistics */}

        <div className="grid grid-cols-3 gap-3 mt-7">

          <div className="rounded-2xl bg-slate-50 p-3">

            <p className="text-xs text-slate-400">

              Primary

            </p>

            <h4 className="font-bold mt-1">

              {building.stats.primary}

            </h4>

          </div>

          <div className="rounded-2xl bg-slate-50 p-3">

            <p className="text-xs text-slate-400">

              Secondary

            </p>

            <h4 className="font-bold mt-1">

              {building.stats.secondary}

            </h4>

          </div>

          <div className="rounded-2xl bg-slate-50 p-3">

            <p className="text-xs text-slate-400">

              Today

            </p>

            <h4 className="font-bold mt-1">

              {building.stats.tertiary}

            </h4>

          </div>

        </div>

        {/* Footer */}

        <div
          className="
            mt-8

            flex
            items-center
            justify-between
          "
        >

          <span
            className="
              font-semibold

              text-[#008388]
            "
          >
            Enter Building
          </span>

          <div
            className="
              w-12
              h-12

              rounded-xl

              bg-slate-100

              flex
              items-center
              justify-center

              group-hover:bg-[#008388]
              group-hover:text-white

              transition
            "
          >
            <ArrowRight size={20}/>
          </div>

        </div>

      </div>
    </div>
  );
}