import { BookOpen, GraduationCap, Check } from "lucide-react";

export default function ClassSelector({
  classes = [],
  subjects = [],
  selectedClass,
  selectedSubject,
  onClassChange,
  onSubjectChange,
}) {
  return (
    <div className="space-y-6">

      {/* CLASSES */}

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">

        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Classes
        </h2>

        <div className="space-y-3">

          {classes.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No Classes Available
            </div>
          ) : (
            classes.map((item) => {
              const active = selectedClass === item;

              return (
                <button
                  key={item}
                  onClick={() => onClassChange(item)}
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    p-4
                    transition-all
                    duration-300
                    border
                    ${
                      active
                        ? "bg-[#008388] text-white border-[#008388] shadow-lg"
                        : "bg-white border-slate-200 hover:border-[#008388] hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">

                    <div
                      className={`
                        w-12
                        h-12
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${
                          active
                            ? "bg-white/20"
                            : "bg-[#EAF8F8] text-[#008388]"
                        }
                      `}
                    >
                      <GraduationCap size={22} />
                    </div>

                    <div className="text-left">
                      <p className="font-semibold">
                        {item}
                      </p>

                      <p
                        className={`text-xs ${
                          active
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        Class
                      </p>
                    </div>

                  </div>

                  {active && (
                    <Check size={20} />
                  )}

                </button>
              );
            })
          )}

        </div>

      </div>

      {/* SUBJECTS */}

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">

        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Subjects
        </h2>

        <div className="space-y-3">

          {subjects.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No Subjects Available
            </div>
          ) : (
            subjects.map((item) => {
              const active = selectedSubject === item;

              return (
                <button
                  key={item}
                  onClick={() => onSubjectChange(item)}
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    p-4
                    transition-all
                    duration-300
                    border
                    ${
                      active
                        ? "bg-[#008388] text-white border-[#008388] shadow-lg"
                        : "bg-white border-slate-200 hover:border-[#008388] hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">

                    <div
                      className={`
                        w-12
                        h-12
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${
                          active
                            ? "bg-white/20"
                            : "bg-[#EAF8F8] text-[#008388]"
                        }
                      `}
                    >
                      <BookOpen size={22} />
                    </div>

                    <div className="text-left">
                      <p className="font-semibold">
                        {item}
                      </p>

                      <p
                        className={`text-xs ${
                          active
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        Subject
                      </p>
                    </div>

                  </div>

                  {active && (
                    <Check size={20} />
                  )}

                </button>
              );
            })
          )}

        </div>

      </div>

    </div>
  );
}