"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useTrip } from "@/components/TripContext";
import { searchHref } from "@/lib/search";
import { formatRange, money, plural, resolveStops, tripRange, tripTotals, type TripStop } from "@/lib/trip";

type Status = "pending" | "upcoming" | "past";

interface TripSummary {
  key: string;
  status: Status;
  href: string;
  image: string | null;
  title: string;
  start: string;
  end: string;
  stays: number;
  nights: number;
  total: number;
}

const BADGE: Record<Status, string> = { pending: "Pending booking", upcoming: "Booked", past: "Completed" };
const CTA: Record<Status, string> = { pending: "Continue booking", upcoming: "View trip", past: "View trip" };

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function summarize(key: string, status: Status, href: string, stops: TripStop[]): TripSummary | null {
  const resolved = resolveStops(stops);
  const range = tripRange(stops);
  if (!range) return null;
  const totals = tripTotals(resolved);
  /* "Norway → Italy → Greece"; a run of stays in one country reads once. */
  const places = resolved.map((s) => s.property.country).filter((c, i, all) => i === 0 || c !== all[i - 1]);
  return {
    key,
    status,
    href,
    image: resolved[0]?.property.image ?? null,
    title: places.join(" → ") || "Trip",
    start: range.start,
    end: range.end,
    stays: stops.length,
    nights: totals.nights,
    total: totals.total,
  };
}

/* Every trip the traveller has: the one still being put together (pending
   booking), then booked trips split into upcoming and past. A pending trip
   opens the review → checkout flow; a booked one opens its confirmation. */
export default function TripsScreen() {
  const trip = useTrip();

  if (!trip.ready) {
    return (
      <header className="sr-head page-head">
        <h1 className="sr-title">Trips</h1>
      </header>
    );
  }

  const today = todayIso();
  const pending = trip.stops.length ? summarize("pending", "pending", "/trip", trip.stops) : null;
  const booked = trip.bookings
    .map((b) => summarize(b.ref, "upcoming", `/confirmation?ref=${encodeURIComponent(b.ref)}`, b.stops))
    .filter((t): t is TripSummary => t !== null);
  const upcoming = booked.filter((t) => t.end >= today).sort((a, b) => a.start.localeCompare(b.start));
  const past = booked
    .filter((t) => t.end < today)
    .map((t) => ({ ...t, status: "past" as const }))
    .sort((a, b) => b.start.localeCompare(a.start));

  const counts = [
    pending && "1 pending",
    upcoming.length && `${upcoming.length} upcoming`,
    past.length && `${past.length} past`,
  ].filter(Boolean);

  return (
    <>
      <header className="sr-head page-head">
        <h1 className="sr-title">Trips</h1>
        <p className="sr-meta">{counts.length ? counts.join(" · ") : "Trips you book will appear here"}</p>
      </header>

      <div className="content">
        {!pending && !booked.length && (
          <section className="sr-empty">
            <span className="empty-icon">
              <Icon name="pin" size={20} />
            </span>
            <h2 className="sr-empty-title">No trips yet</h2>
            <p className="sr-empty-sub">Find a stay and add it to a trip — it shows up here while you book, and stays here once it&apos;s confirmed.</p>
            <div className="sr-empty-actions">
              <Link href={searchHref(trip.lastSearch ?? {})} className="ghost-btn">
                Find a stay
                <Icon name="arrowRight" size={13} />
              </Link>
            </div>
          </section>
        )}

        {pending && <TripRow title="Pending booking" subtitle="Finish reviewing and check out to confirm these stays" trips={[pending]} />}
        {upcoming.length > 0 && <TripRow title="Upcoming" subtitle="Booked and confirmed" trips={upcoming} />}
        {past.length > 0 && <TripRow title="Past trips" subtitle="Where you've been" trips={past} />}
      </div>
    </>
  );
}

function TripRow({ title, subtitle, trips }: { title: string; subtitle: string; trips: TripSummary[] }) {
  return (
    <section className="trips-row">
      <div className="section-heading">
        <h2 className="section-label">{title}</h2>
        <div className="section-subtitle">{subtitle}</div>
      </div>
      <div className="cards-grid">
        {trips.map((t) => (
          <TripCard key={t.key} trip={t} />
        ))}
      </div>
    </section>
  );
}

/* Shown if a stay's remote photo can't be fetched, so a card never renders broken. */
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";

function TripCard({ trip }: { trip: TripSummary }) {
  const [src, setSrc] = useState(trip.image ?? FALLBACK_IMAGE);
  return (
    <Link href={trip.href} className="card trip-card" aria-label={`${trip.title}, ${formatRange(trip.start, trip.end)} — ${BADGE[trip.status]}`}>
      <div className="card-thumb">
        <Image
          src={src}
          alt=""
          width={210}
          height={328}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          className="card-img"
          onError={() => {
            if (src !== FALLBACK_IMAGE) setSrc(FALLBACK_IMAGE);
          }}
        />
        <div className="card-overlay" />
        <div className={`card-badge trip-badge trip-badge-${trip.status}`}>{BADGE[trip.status]}</div>
      </div>
      <div className="card-body">
        <div className="card-name trip-card-title">{trip.title}</div>
        <div className="trip-card-dates">{formatRange(trip.start, trip.end)}</div>
        <div className="trip-card-meta">
          {plural(trip.stays, "stay")} · {plural(trip.nights, "night")} · <b>{money(trip.total)}</b>
        </div>
        <div className="reserve-wrap">
          <span className="reserve-btn">{CTA[trip.status]}</span>
        </div>
      </div>
    </Link>
  );
}
