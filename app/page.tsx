import SearchSection from "@/components/SearchSection";
import DestinationGrid from "@/components/DestinationGrid";
import TrendingDestinations from "@/components/TrendingDestinations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <SearchSection />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 space-y-16">
        <TrendingDestinations />
        <DestinationGrid />
      </main>
      <Footer />
    </div>
  );
}
