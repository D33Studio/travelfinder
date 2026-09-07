"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useTrip } from "@/components/TripContext";
import { popularDestinations, properties } from "@/lib/properties";
import { DEFAULT_SEARCH, matchesQuery, propertyHref, searchHref, serializeSearchParams } from "@/lib/search";
import PropertyCard from "./PropertyCard";
import SearchBar from "./search/SearchBar";

export default function PropertyGrid() {
  const trip = useTrip();
  const [query, setQuery] = useState("");

  /* Returning travellers keep their dates and party; the destination starts
     blank so the home page always opens on the whole collection. */
  const remembered = trip.ready ? trip.lastSearch : null;
  const initial = remembered ? { ...remembered, q: "" } : DEFAULT_SEARCH;
  const linkParams = { ...(remembered ?? DEFAULT_SEARCH), q: query.trim() };

  const filtered = properties.filter((p) => matchesQuery(p, query));
  const filteredPopular = popularDestinations.filter((p) => matchesQuery(p, query));
  const nothing = !filtered.length && !filteredPopular.length;

  return (
    <>
      <section className="hero">
        <h1>Find your perfect escape</h1>
        <SearchBar key={serializeSearchParams(initial)} mode="hero" initial={initial} onQueryChange={setQuery} />
      </section>

      <div className="content sr-home">
        {nothing ? (
          <div className="sr-empty sr-empty-home">
            <span className="empty-icon">
              <Icon name="pin" size={20} />
            </span>
            <h2 className="sr-empty-title">Nothing here matches “{query.trim()}”</h2>
            <p className="sr-empty-sub">Try a country, city or region — or browse every stay with your dates on the search page.</p>
            <div className="sr-empty-actions">
              <Link href={searchHref({ ...linkParams, q: "" })} className="ghost-btn">
                Browse all stays
                <Icon name="arrowRight" size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {filtered.length > 0 && (
              <>
                <div className="section-label">Featured properties</div>
                <div className="cards-grid">
                  {filtered.map((property) => (
                    <PropertyCard key={property.id} property={property} href={propertyHref(property.id, linkParams)} />
                  ))}
                </div>
              </>
            )}

            {filteredPopular.length > 0 && (
              <>
                <div className="section-heading">
                  <div className="section-label">Popular destinations</div>
                  <div className="section-subtitle">Handpicked hideaways loved by our travelers</div>
                </div>
                <div className="cards-grid">
                  {filteredPopular.map((property) => (
                    <PropertyCard key={property.id} property={property} href={propertyHref(property.id, linkParams)} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
