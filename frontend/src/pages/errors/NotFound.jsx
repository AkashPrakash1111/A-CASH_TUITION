import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">

      <div className="text-center">

        <h1 className="text-6xl font-bold">

          404

        </h1>

        <p className="mt-4">

          Page Not Found

        </p>

        <Link
          to="/login"
          className="text-blue-500 mt-6 block"
        >
          Go Back
        </Link>

      </div>

    </div>
  );
}