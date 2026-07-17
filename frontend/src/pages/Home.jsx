import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Navbar />

        <main className="p-8 overflow-auto">

          {/* Greeting */}

          <div className="mb-8">

            <h1 className="text-4xl font-bold text-gray-800">
              Good Morning, Akash 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Monday • Today's Teaching Dashboard
            </p>

          </div>

          {/* First Row */}

          <div className="grid grid-cols-3 gap-6">

            {/* Today's Classes */}

            <div className="bg-white rounded-2xl shadow p-6">

              <div className="flex justify-between">

                <h2 className="font-bold text-lg">
                  Today's Classes
                </h2>

                <button className="text-[#008388] font-semibold">
                  + Add
                </button>

              </div>

              <div className="mt-6 space-y-4">

                <div className="border rounded-xl p-3">

                  <h3 className="font-semibold">
                    Science
                  </h3>

                  <p className="text-gray-500">
                    5:00 PM
                  </p>

                </div>

                <div className="border rounded-xl p-3">

                  <h3 className="font-semibold">
                    Chemistry
                  </h3>

                  <p className="text-gray-500">
                    7:00 PM
                  </p>

                </div>

              </div>

            </div>

            {/* Live Class */}

            <div className="bg-[#008388] rounded-2xl shadow text-white p-6">

              <h2 className="text-2xl font-bold">

                🎥 Live Class Center

              </h2>

              <div className="mt-8 flex flex-col gap-3">

                <button className="bg-white text-[#008388] rounded-xl py-3 font-semibold">

                  Generate Meet Link

                </button>

                <button className="bg-white text-[#008388] rounded-xl py-3 font-semibold">

                  Start Class

                </button>

                <button className="bg-white text-[#008388] rounded-xl py-3 font-semibold">

                  Edit Schedule

                </button>

              </div>

            </div>

            {/* Papers */}

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="font-bold text-lg">

                Papers To Check

              </h2>

              <h1 className="text-6xl font-bold text-[#EC815D] mt-6">

                12

              </h1>

              <p className="text-gray-500">

                Pending Papers

              </p>

              <button className="mt-8 w-full bg-[#EC815D] text-white rounded-xl py-3">

                Open Correction Portal

              </button>

            </div>

          </div>

          {/* Second Row */}

          <div className="grid grid-cols-2 gap-6 mt-8">

            {/* Analytics */}

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="font-bold text-xl">

                Analytics

              </h2>

              <div className="grid grid-cols-3 gap-4 mt-6">

                <div className="bg-gray-100 rounded-xl p-5">

                  <h1 className="text-3xl font-bold text-[#008388]">
                    53
                  </h1>

                  <p>Students</p>

                </div>

                <div className="bg-gray-100 rounded-xl p-5">

                  <h1 className="text-3xl font-bold text-[#FAB250]">
                    96%
                  </h1>

                  <p>Attendance</p>

                </div>

                <div className="bg-gray-100 rounded-xl p-5">

                  <h1 className="text-3xl font-bold text-[#58466A]">
                    82%
                  </h1>

                  <p>Average</p>

                </div>

              </div>

            </div>

            {/* AI */}

            <div className="bg-white rounded-2xl shadow p-6">

              <h2 className="font-bold text-xl">

                AI Quick Actions

              </h2>

              <div className="grid grid-cols-2 gap-4 mt-6">

                <button className="bg-[#008388] text-white rounded-xl p-4">

                  Generate Notes

                </button>

                <button className="bg-[#FAB250] rounded-xl p-4">

                  Generate MCQs

                </button>

                <button className="bg-[#58466A] text-white rounded-xl p-4">

                  Generate PYQs

                </button>

                <button className="bg-[#EC815D] text-white rounded-xl p-4">

                  Revision Sheet

                </button>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}