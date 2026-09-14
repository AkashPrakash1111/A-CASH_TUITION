import HeroBanner from "../components/dashboard/HeroBanner";
import StatsRow from "../components/dashboard/StatsRow";
import CampusMap from "../components/dashboard/CampusMap";

export default function Home() {
  return (
    <div className="p-8 space-y-8">
      {/* Hero */}
      <HeroBanner />

      {/* Quick stats */}
      <StatsRow />

      {/* Interactive Campus */}
      <div>
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-800">
            Explore Your Campus
          </h2>
          <p className="text-slate-500 mt-1">
            Click any building to jump straight into that part of your portal.
          </p>
        </div>

        <CampusMap />
      </div>
    </div>
  );
}
