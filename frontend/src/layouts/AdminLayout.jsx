import Sidebar from "../components/sidebar/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F4F8FC]">

      {/* Decorative Background */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">

        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="absolute top-52 right-0 w-[450px] h-[450px] rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-teal-100/40 blur-3xl" />

      </div>

      {/* Layout */}

      <div className="relative flex">

        {/* Sidebar */}

        <div className="fixed left-6 top-6 bottom-6 w-72 z-50">

          <Sidebar />

        </div>

        {/* Main Content */}

        <main className="flex-1 ml-[320px] p-6">

          <div
            className="
              min-h-[calc(100vh-48px)]

              rounded-[36px]

              bg-white/70

              backdrop-blur-xl

              border
              border-white/60

              shadow-[0_20px_60px_rgba(15,23,42,0.08)]

              overflow-hidden
            "
          >

            {children}

          </div>

        </main>

      </div>

    </div>
  );
}