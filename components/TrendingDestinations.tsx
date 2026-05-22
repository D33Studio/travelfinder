import { destinations } from "@/lib/destinations";
import DestinationCard from "./DestinationCard";

export default function TrendingDestinations() {
  const trending = destinations.filter((d) => d.trending);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trending Now</h2>
          <p className="text-slate-500 text-sm mt-1">Most popular destinations this season</p>
        </div>
        <span className="text-2xl">🔥</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {trending.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} featured />
        ))}
      </div>
    </section>
  );
}
