"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useTrip } from "@/components/TripContext";
import {
  flagEmoji,
  formatDate,
  formatRange,
  guestsLabel,
  money,
  plural,
  resolveStops,
  tripRange,
  type Booking,
} from "@/lib/trip";
import { FlowSteps, StayThumb, roomLine } from "./shared";

/* The last screen of the flow: the booking that `confirmBooking` stored,
   looked up by the `ref` in the URL (or the most recent one when absent). */
export default function ConfirmationScreen({ refParam }: { refParam: string | null }) {
  const trip = useTrip();

  if (!trip.ready) return <ConfirmationSkeleton />;

  const booking = refParam ? trip.getBooking(refParam) : trip.bookings[0];
  if (!booking) return <NotFound refParam={refParam} />;

  return <Confirmed booking={booking} />;
}

function Confirmed({ booking }: { booking: Booking }) {
  const resolved = resolveStops(booking.stops);
  const range = tripRange(booking.stops);
  const { totals, guest, payment } = booking;

  return (
    <div className="flow-inner co-page">
      <FlowSteps current={4} />

      <header className="flow-head">
        <span className="flow-icon co-success">
          <Icon name="check" size={24} />
        </span>
        <h1 className="flow-title">You&apos;re all set</h1>
        <p className="flow-subtitle co-ref-line">
          Booking reference <span className="co-ref">{booking.ref}</span>
          <CopyButton value={booking.ref} />
        </p>
        <p className="co-sent">A confirmation has been sent to {guest.email}</p>
        <div className="co-chips">
          {range && (
            <span className="flow-chip">
              <Icon name="calendar" size={12} />
              {formatRange(range.start, range.end)}
            </span>
          )}
          <span className="flow-chip">
            <Icon name="users" size={12} />
            {guestsLabel(booking.adults, booking.children)}
          </span>
        </div>
      </header>

      <div className="co-confirm-grid">
        <section className="flow-panel" aria-labelledby="co-itin-title">
          <div className="co-panel-head">
            <div>
              <h2 id="co-itin-title" className="co-section-title">Your itinerary</h2>
              <p className="co-section-hint">
                {plural(resolved.length, "stay")} · {plural(totals.nights, "night")}
              </p>
            </div>
          </div>

          {resolved.length ? (
            <ol className="co-itinerary">
              {resolved.map((s, i) => (
                <li key={s.id} className="co-it-row">
                  <span className="co-it-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <StayThumb className="co-it-thumb" src={s.property.image} sizes="64px" />
                  <div className="co-it-body">
                    <Link href={`/property/${s.property.id}`} className="co-it-name">
                      {s.property.name}
                    </Link>
                    <div className="co-item-meta">
                      {s.property.city} {flagEmoji(s.property.countryCode)} · {formatDate(s.checkIn)} → {formatDate(s.checkOut)} · {plural(s.nights, "night")}
                    </div>
                    <div className="co-item-rate">{roomLine(s)}</div>
                  </div>
                  <div className="co-item-price">{money(s.subtotal)}</div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="co-section-hint">The stays in this booking are no longer in the collection.</p>
          )}
        </section>

        <aside className="co-side">
          <section className="flow-panel" aria-labelledby="co-paid-title">
            <div className="co-panel-head">
              <div>
                <h2 id="co-paid-title" className="co-section-title">Payment</h2>
                <p className="co-section-hint">
                  {payment.brand} •••• {payment.last4} · {guest.firstName} {guest.lastName}
                </p>
              </div>
            </div>
            <div className="co-paid">
              <span>Paid</span>
              <b>{money(totals.total)}</b>
            </div>
            <div className="co-breakdown">
              <div>
                <span>Subtotal</span>
                <span>{money(totals.subtotal)}</span>
              </div>
              <div>
                <span>Taxes &amp; local levies</span>
                <span>{money(totals.taxes)}</span>
              </div>
              <div>
                <span>Journey service fee</span>
                <span>{money(totals.service)}</span>
              </div>
            </div>
            <div className="notice co-notice">
              <span className="notice-tag">
                <span className="dot" />
                Test booking
              </span>
              <p>No real payment was taken. Each property confirms your arrival details by email.</p>
            </div>
          </section>

          <div className="co-actions">
            <Link href="/" className="primary-btn">
              Plan another trip
              <Icon name="arrowRight" size={14} />
            </Link>
            <Link href="/search" className="ghost-btn">
              Search more stays
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — the reference is still visible on screen */
    }
  };

  return (
    <button type="button" className="ghost-btn co-copy" onClick={copy} aria-live="polite">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ConfirmationSkeleton() {
  return (
    <div className="flow-inner co-page" aria-busy="true">
      <FlowSteps current={4} />
      <header className="flow-head">
        <span className="flow-icon co-success">
          <Icon name="check" size={24} />
        </span>
        <h1 className="flow-title">You&apos;re all set</h1>
        <span className="co-skel co-skel-subtitle" aria-hidden="true" />
        <span className="co-sr" role="status">
          Loading your booking
        </span>
      </header>
      <div className="co-confirm-grid">
        <div className="flow-panel co-skeleton" aria-hidden="true">
          <span className="co-skel co-skel-lg" />
          <span className="co-skel co-skel-box" />
          <span className="co-skel co-skel-box" />
          <span className="co-skel co-skel-box" />
        </div>
        <div className="flow-panel co-skeleton" aria-hidden="true">
          <span className="co-skel co-skel-lg" />
          <span className="co-skel co-skel-md" />
          <span className="co-skel co-skel-md" />
        </div>
      </div>
    </div>
  );
}

function NotFound({ refParam }: { refParam: string | null }) {
  return (
    <div className="flow-inner narrow co-page">
      <FlowSteps current={4} />
      <div className="flow-head co-empty">
        <span className="flow-icon">
          <Icon name="info" size={22} />
        </span>
        <h1 className="flow-title">We couldn&apos;t find that booking</h1>
        <p className="co-empty-sub">
          {refParam ? `Nothing matches reference ${refParam}. ` : ""}
          It may have been made in a different browser, or the link is out of date.
        </p>
        <div className="co-actions">
          <Link href="/" className="primary-btn">
            <Icon name="arrowLeft" size={14} />
            Back to search
          </Link>
          <Link href="/trip" className="ghost-btn">
            View current trip
          </Link>
        </div>
      </div>
    </div>
  );
}
