import { Destination } from "@/lib/destinations";
import Link from "next/link";

interface Props {
  destination: Destination;
  featured?: boolean;
}

export default function DestinationCard({ destination, featured }: Props) {
  return (
    <Link
      href={`/destination/${destination.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      <div className={`relative bg-gradient-to-br ${destination.imageColor} ${featured ? "h-44" : "h-36"} flex items-center justify-center`}>
        <span className="text-6xl drop-shadow-lg group-hover:scale-110 transition-transform duration-200">
          {destination.emoji}
        </span>
        {destination.trending && (
          <span className="absolute top-3 left-3 bg-white/90 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            🔥 Trending
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="font-semibold text-slate-900 text-base leading-tight">{destination.name}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{destination.country} · {destination.region}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-400">From</p>
            <p className="font-bold text-slate-900 text-sm">${destination.priceFrom}</p>
          </div>
        </div>

        <p className="text-slate-600 text-xs leading-relaxed mt-2 line-clamp-2">{destination.description}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="text-yellow-400">★</span>
            <span className="font-medium text-slate-700">{destination.rating}</span>
            <span>({destination.reviewCount.toLocaleString()})</span>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {destination.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
