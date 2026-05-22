"use client";

import { useState } from "react";
import { destinations, regions, filterDestinations } from "@/lib/destinations";
import DestinationCard from "./DestinationCard";

export default function DestinationGrid() {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = filterDestinations(destinations, query, selectedRegion);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Destinations</h2>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} places to explore</p>
        </div>
        <span className="text-2xl">🌍</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter destinations..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedRegion === region
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-medium">No destinations found</p>
          <p className="text-sm mt-1">Try a different search or region</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      )}
    </section>
  );
}
