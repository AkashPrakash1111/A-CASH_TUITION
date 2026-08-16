import AvatarEngine from "../../core/avatar/AvatarEngine";

const people = [
  {
    user: AvatarEngine.getStudents()[0],
    top: "22%",
    left: "30%",
  },
  {
    user: AvatarEngine.getStudents()[1],
    top: "36%",
    left: "76%",
  },
  {
    user: AvatarEngine.getStudents()[2],
    top: "62%",
    left: "18%",
  },
  {
    user: AvatarEngine.getStudents()[3],
    top: "74%",
    left: "48%",
  },
  {
    user: AvatarEngine.getTeachers()[0],
    top: "28%",
    left: "58%",
  },
  {
    user: AvatarEngine.getTeachers()[1],
    top: "70%",
    left: "82%",
  },
  {
    user: AvatarEngine.getAI(),
    top: "16%",
    left: "48%",
  },
];

export default function CampusPeople() {
  return (
    <>
      {people.map((person, index) => (
        <div
          key={index}
          style={{
            top: person.top,
            left: person.left,
          }}
          className="
            absolute
            -translate-x-1/2
            -translate-y-1/2
            z-20

            animate-float
          "
        >
          <div className="relative group">

            {/* Online Indicator */}

            <div
              className="
                absolute
                -top-1
                -right-1

                w-3
                h-3

                rounded-full

                bg-green-500

                border-2
                border-white
              "
            />

            {/* Avatar */}

            <img
              src={person.user.avatar}
              alt={person.user.name}
              className="
                w-12
                h-12

                rounded-full

                border-4
                border-white

                shadow-xl

                transition-all
                duration-300

                group-hover:scale-110
              "
            />

            {/* Name */}

            <div
              className="
                absolute

                left-1/2
                -translate-x-1/2

                top-14

                whitespace-nowrap

                rounded-xl

                bg-white

                px-3
                py-1

                text-xs
                font-semibold

                shadow-lg

                opacity-0

                group-hover:opacity-100

                transition
              "
            >
              {person.user.name}
            </div>

          </div>
        </div>
      ))}
    </>
  );
}