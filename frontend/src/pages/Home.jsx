import HeroSection from "../components/dashboard/HeroSection";
import StatsPanel from "../components/dashboard/StatsPanel";
import AdminLayout from "../layouts/AdminLayout";
import QuickActions from "../components/dashboard/QuickActions";
import CampusScene from "../components/dashboard/CampusScene";
import AIHub from "../components/dashboard/AIHub";

export default function Home() {
  return (
  <AdminLayout>
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">

      <div className="max-w-[1700px] mx-auto px-8 py-8">

        <HeroSection />

        <StatsPanel />

        <QuickActions />

        <CampusScene />

        <AIHub />

      </div>

    </main>
  </AdminLayout>
);
}