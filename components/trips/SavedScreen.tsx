"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import PropertyCard from "@/components/PropertyCard";
import { useTrip } from "@/components/TripContext";
import { getProperty } from "@/lib/propertyDetails";
import type { Property } from "@/lib/properties";
import { propertyHref, searchHref } from "@/lib/search";
import { plural } from "@/lib/trip";

/* Every stay the traveller has bookmarked, most recent first, laid out like
   the search page. Un-saving a card removes it from the row straight away. */
export default function SavedScreen() {
  const trip = useTrip();
  const stays = trip.ready ? trip.saved.map(getProperty).filter((p): p is Property => p !== undefined) : [];

  return (
    <>
      <header className="sr-head page-head">
        <h1 className="sr-title">Saved</h1>
        {trip.ready && <p className="sr-meta">{stays.length ? `${plural(stays.length, "saved stay")}` : "Nothing saved yet"}</p>}
      </header>

      {trip.ready && (
        <div className="content">
          {stays.length ? (
            <section>
              <div className="section-heading">
                <h2 className="section-label">Your saved stays</h2>
                <div className="section-subtitle">Tap the bookmark on a card to remove it</div>
              </div>
              <div className="cards-grid">
                {stays.map((p) => (
                  <PropertyCard key={p.id} property={p} href={propertyHref(p.id, trip.lastSearch)} />
                ))}
              </div>
            </section>
          ) : (
            <section className="sr-empty">
              <span className="empty-icon">
                <Icon name="bookmark" size={20} />
              </span>
              <h2 className="sr-empty-title">Save a destination</h2>
              <p className="sr-empty-sub">Tap the bookmark on any stay and it will be kept here, ready for when you plan your next trip.</p>
              <div className="sr-empty-actions">
                <Link href={searchHref(trip.lastSearch ?? {})} className="ghost-btn">
                  Explore stays
                  <Icon name="arrowRight" size={13} />
                </Link>
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
