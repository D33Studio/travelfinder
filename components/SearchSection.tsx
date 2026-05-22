"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-9xl select-none">✈️</div>
        <div className="absolute bottom-5 right-20 text-8xl select-none rotate-12">🌍</div>
        <div className="absolute top-20 right-40 text-6xl select-none -rotate-6">🏖️</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Discover your next
          <span className="block text-yellow-300">adventure</span>
        </h1>
        <p className="text-blue-100 text-lg md:text-xl max-w-xl mx-auto mb-10">
          Explore thousands of destinations, find the best deals, and start planning your dream trip today.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-2xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations, countries, experiences..."
                className="flex-1 text-slate-900 text-base placeholder-slate-400 outline-none bg-transparent py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm">
          {["Paris", "Bali", "Tokyo", "Santorini", "New York"].map((place) => (
            <button
              key={place}
              onClick={() => setQuery(place)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full transition-colors backdrop-blur-sm"
            >
              {place}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
