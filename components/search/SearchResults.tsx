"use client";

import Link from "next/link";
import { useEffect } from "react";
import Icon from "@/components/Icon";
import PropertyCard from "@/components/PropertyCard";
import { useTrip } from "@/components/TripContext";
import {
  buildSearchResults,
  describeMatches,
  propertyHref,
  searchHref,
  searchProperties,
  serializeSearchParams,
  type ResultGroup,
  type SearchParams,
} from "@/lib/search";
import { formatDate, guestsLabel, nightsBetween, plural } from "@/lib/trip";

export default function SearchResults({ params }: { params: SearchParams }) {
  const { ready, lastSearch, setLastSearch } = useTrip();
  const serialized = serializeSearchParams(params);

  /* Remember the search so property pages can fall back to its dates and party.
     Guarded so a store update doesn't re-trigger a write of the same value. */
  useEffect(() => {
    if (!ready) return;
    if (lastSearch && serializeSearchParams(lastSearch) === serialized) return;
    setLastSearch(params);
  }, [ready, lastSearch, serialized, params, setLastSearch]);

  const groups = buildSearchResults(params);
  const matches = params.q ? searchProperties(params.q) : [];
  const title = !params.q
    ? "All stays"
    : matches.length
      ? `Stays in ${describeMatches(params.q, matches)}`
      : `Nothing found for “${params.q}”`;
  const nights = nightsBetween(params.from, params.to);

  return (
    <>
      <header className="sr-head">
        <h1 className="sr-title">{title}</h1>
        <div className="sr-meta">
          <span className="sr-meta-item">
            <Icon name="calendar" size={13} />
            <b>{formatDate(params.from)}</b> – <b>{formatDate(params.to)}</b>
          </span>
          <span className="sr-meta-sep" aria-hidden="true" />
          <span>{plural(nights, "night")}</span>
          <span className="sr-meta-sep" aria-hidden="true" />
          <span className="sr-meta-item">
            <Icon name="users" size={13} />
            {guestsLabel(params.adults, params.children)}
          </span>
        </div>
        <p className="sr-hint">
          <Icon name="sparkles" size={12} />
          Add as many stays as you like — they all appear on your trip overview.
        </p>
      </header>

      <div className="content">
        {groups.map((group) => (
          <ResultRow key={group.id} group={group} params={params} />
        ))}
      </div>
    </>
  );
}

function ResultRow({ group, params }: { group: ResultGroup; params: SearchParams }) {
  if (!group.items.length) {
    return (
      <section className="sr-empty">
        <span className="empty-icon">
          <Icon name="pin" size={20} />
        </span>
        <h2 className="sr-empty-title">{group.title}</h2>
        <p className="sr-empty-sub">{group.subtitle}</p>
        <div className="sr-empty-actions">
          <Link href={searchHref({ ...params, q: "Italy" })} className="ghost-btn">
            Try Italy
          </Link>
          <Link href={searchHref({ ...params, q: "Japan" })} className="ghost-btn">
            Try Japan
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-heading">
        <h2 className="section-label">{group.title}</h2>
        <div className="section-subtitle">{group.subtitle}</div>
      </div>
      <div className="cards-grid">
        {group.items.map((p) => (
          <PropertyCard key={p.id} property={p} href={propertyHref(p.id, params)} />
        ))}
      </div>
    </section>
  );
}
