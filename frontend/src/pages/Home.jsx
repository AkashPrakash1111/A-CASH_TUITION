import HeroBanner from "../components/dashboard/HeroBanner";
import CampusMap from "../components/dashboard/CampusMap";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F8FC]">
      <div className="max-w-[1700px] mx-auto px-8 py-8 space-y-10">

        {/* Hero */}
        <HeroBanner />

        {/* Interactive Campus */}
        <CampusMap />

      </div>
    </main>
  );
}