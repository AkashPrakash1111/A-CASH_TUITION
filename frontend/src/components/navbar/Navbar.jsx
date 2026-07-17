import { Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">

      {/* Left Side */}

      <h2 className="text-2xl font-bold text-[#008388]">
        ACASH Tuition Portal
      </h2>

      {/* Right Side */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">

          <Search size={18} className="text-gray-500" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-2"
          />

        </div>

        {/* Notification */}

        <button className="relative">

          <Bell className="text-gray-700" />

          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            2
          </span>

        </button>

        {/* User */}

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-[#008388] text-white flex items-center justify-center font-bold">
            A
          </div>

          <div>

            <p className="font-semibold">

              Akash

            </p>

            <p className="text-xs text-gray-500">

              Administrator

            </p>

          </div>

        </div>

      </div>

    </header>
  );
}