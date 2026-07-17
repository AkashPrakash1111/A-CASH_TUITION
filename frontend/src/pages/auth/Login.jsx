import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center">

      <div className="bg-slate-800 p-10 rounded-xl w-[400px]">

        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          ACASH Tuition Portal
        </h1>

        <input
          className="w-full p-3 rounded mb-4"
          placeholder="Email"
        />

        <input
          className="w-full p-3 rounded mb-6"
          placeholder="Password"
          type="password"
        />

        <button className="bg-blue-600 w-full p-3 rounded text-white">
          Login
        </button>

        <div className="flex justify-between mt-6 text-sm">

          <Link
            className="text-blue-400"
            to="/admin/dashboard"
          >
            Admin Demo
          </Link>

          <Link
            className="text-green-400"
            to="/student/dashboard"
          >
            Student Demo
          </Link>

        </div>

      </div>

    </div>
  );
}