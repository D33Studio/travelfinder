"use client";

import { useState } from "react";
import { properties, popularDestinations } from "@/lib/properties";
import PropertyCard from "./PropertyCard";

function matchesQuery(p: { name: string; location: string }, query: string) {
  return (
    !query ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.location.toLowerCase().includes(query.toLowerCase())
  );
}

export default function PropertyGrid() {
  const [query, setQuery] = useState("");

  const filtered = properties.filter((p) => matchesQuery(p, query));
  const filteredPopular = popularDestinations.filter((p) => matchesQuery(p, query));

  return (
    <>
      <section className="hero">
        <h1>Find your perfect escape</h1>
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search for location or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      <div className="content">
        <div className="section-label">Featured properties</div>
        <div className="cards-grid">
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="section-heading">
          <div className="section-label">Popular destinations</div>
          <div className="section-subtitle">Handpicked hideaways loved by our travelers</div>
        </div>
        <div className="cards-grid">
          {filteredPopular.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </>
  );
}
