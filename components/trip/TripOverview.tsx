"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useTrip } from "@/components/TripContext";
import { searchHref, type SearchParams } from "@/lib/search";
import {
  MAX_ADULTS,
  MAX_CHILDREN,
  formatRange,
  guestsLabel,
  money,
  plural,
  resolveStops,
  suggestNextDates,
  tripCountriesLabel,
  tripRange,
  tripTotals,
} from "@/lib/trip";
import StopCard from "./StopCard";
import TripMap from "./TripMap";
import TripTimeline from "./TripTimeline";

const STEPS = ["Choose stays", "Review trip", "Checkout", "Confirmed"];

export default function TripOverview() {
  const trip = useTrip();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const resolved = useMemo(() => (trip.ready ? resolveStops(trip.stops) : []), [trip.ready, trip.stops]);
  /* Derived rather than stored: if the selected stop is removed, the first one takes over. */
  const active = resolved.find((s) => s.id === activeId) ?? resolved[0] ?? null;

  if (!trip.ready) return <TripSkeleton />;
  if (!active) return <TripEmpty lastSearch={trip.lastSearch} stale={trip.stops.length > 0} onClear={trip.clearTrip} />;

  const range = tripRange(resolved) ?? { start: active.checkIn, end: active.checkOut };
  const totals = tripTotals(resolved);
  const countries = tripCountriesLabel(resolved);
  /* Countries in trip order for the header pill; a stretch of stops in one country reads once. */
  const places = resolved.map((s) => s.property.country).filter((c, i, all) => i === 0 || c !== all[i - 1]);
  const summary = `${plural(resolved.length, "stay")} · ${plural(totals.nights, "night")}`;

  /* "Add another stay" searches the last stop's country for the nights right after it. */
  const last = resolved[resolved.length - 1];
  const next = suggestNextDates(resolved, 2);
  const addHref = searchHref({ q: last.property.country, from: next.checkIn, to: next.checkOut, adults: trip.adults, children: trip.children });

  const overlaps: [number, number][] = [];
  for (let i = 1; i < resolved.length; i++) {
    if (resolved[i].checkIn < resolved[i - 1].checkOut) overlaps.push([i, i + 1]);
  }

  const onCtaKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && clearing) {
      e.preventDefault();
      setClearing(false);
    }
  };

  return (
    <div className="flow">
      <div className="flow-inner">
        <FlowSteps current={1} />

        <header className="flow-head">
          <span className="flow-icon">
            <GlobeIcon />
          </span>
          <h1 className="flow-title">Trip Overview</h1>
          <TripChip adults={trip.adults} kids={trip.children} dates={formatRange(range.start, range.end)} places={places} onChange={trip.setGuests} />
        </header>

        <TripTimeline stops={resolved} activeId={active.id} addHref={addHref} onSelect={setActiveId} />

        <TripMap stops={resolved} activeId={active.id} onSelect={setActiveId} />
        <p className="tr-map-caption">
          {summary}
          {countries && ` · ${countries}`}
        </p>

        <div className="tr-total-row">
          <div>
            <div className="tr-total">
              <span className="tr-total-label">Trip Total:</span>
              <b>{money(totals.total)}</b>
            </div>
            <div className="tr-total-sub">{summary} · includes taxes &amp; service fees</div>
          </div>
        </div>

        {overlaps.map(([a, b]) => (
          <div key={`${a}-${b}`} className="notice tr-notice" role="status">
            <span className="notice-tag">
              <span className="dot" />
              Overlap
            </span>
            <p>
              Stops {a} and {b} overlap — adjust the dates on one of them.
            </p>
          </div>
        ))}

        <div className="tr-stops">
          {resolved.map((stop, i) => (
            <StopCard
              key={stop.id}
              stop={stop}
              index={i}
              active={stop.id === active.id}
              adults={trip.adults}
              kids={trip.children}
              onActivate={() => setActiveId(stop.id)}
              onRemove={() => trip.removeStop(stop.id)}
            />
          ))}
        </div>

        <div className="flow-panel tr-cta">
          <div className="tr-cta-left">
            <div className="tr-cta-total">
              <span>Trip total</span>
              <b>{money(totals.total)}</b>
            </div>
            <div className="tr-cta-perks">
              <span>
                <Icon name="clock" size={13} />
                Free cancellation on flexible rates
              </span>
              <span>
                <Icon name="shield" size={13} />
                Best price guaranteed
              </span>
            </div>
          </div>
          <div className="tr-cta-actions" onKeyDown={onCtaKeyDown}>
            {clearing && (
              <span className="tr-confirm-q" role="status">
                Clear the whole trip?
              </span>
            )}
            {/* Same element in both states so keyboard focus survives the switch. */}
            <button
              type="button"
              className={`ghost-btn${clearing ? " danger tr-confirm" : ""}`}
              onClick={() => {
                if (clearing) trip.clearTrip();
                else setClearing(true);
              }}
            >
              {clearing ? (
                "Yes, clear"
              ) : (
                <>
                  <Icon name="x" size={13} />
                  Clear trip
                </>
              )}
            </button>
            {clearing && (
              <button type="button" className="ghost-btn" onClick={() => setClearing(false)}>
                Keep
              </button>
            )}
            <Link href="/checkout" className="primary-btn">
              Continue to checkout
              <Icon name="arrowRight" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

function FlowSteps({ current }: { current: number }) {
  return (
    <nav className="pill-row flow-steps" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const done = i < current;
        const on = i === current;
        return (
          <Fragment key={label}>
            {i > 0 && (
              <span className="flow-step-sep" aria-hidden="true">
                ›
              </span>
            )}
            <span className={`flow-step${done ? " done" : on ? " on" : ""}`} aria-current={on ? "step" : undefined}>
              <b>{done ? <Icon name="check" size={10} /> : i + 1}</b>
              {label}
            </span>
          </Fragment>
        );
      })}
    </nav>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="3.6" ry="9" />
      <path d="M3 12h18" />
    </svg>
  );
}

/* One pill under the title — guests, dates, then the countries as a chain
   (Norway → Italy → Japan) — that opens a small popover with adult / child
   steppers writing straight to the trip store. The pill row is its own
   scroller so the popover isn't clipped by it. */
function TripChip({
  adults,
  kids,
  dates,
  places,
  onChange,
}: {
  adults: number;
  kids: number;
  dates: string;
  places: string[];
  onChange: (adults: number, kids: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;
    dialog.current?.focus();
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !wrap.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    }
  };

  /* Tabbing out of the popover closes it; clicks inside on non-focusable bits
     (relatedTarget null) are left to the pointer listener above. */
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget instanceof Node && !wrap.current?.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div ref={wrap} className="tr-guests" onKeyDown={onKeyDown} onBlur={onBlur}>
      <div className="pill-row tr-chips">
        <button
          ref={trigger}
          type="button"
          className="flow-chip tr-chip-btn tr-summary"
          title="Change guests"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="tr-seg">{guestsLabel(adults, kids)}</span>
          <span className="tr-seg">{dates}</span>
          {places.length > 0 && (
            <span className="tr-seg">
              {places.map((place, i) => (
                <Fragment key={i}>
                  {i > 0 && <Icon name="arrowRight" size={11} className="tr-seg-arrow" />}
                  {place}
                </Fragment>
              ))}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div ref={dialog} id={dialogId} className="tr-guests-pop" role="dialog" aria-label="Guests" tabIndex={-1}>
          <Stepper label="Adults" hint="Ages 13 or above" value={adults} min={1} max={MAX_ADULTS} onChange={(n) => onChange(n, kids)} />
          <Stepper label="Children" hint="Ages 0 to 12" value={kids} min={0} max={MAX_CHILDREN} onChange={(n) => onChange(adults, n)} />
          <div className="tr-guests-foot">
            <span>Applies to every stay in the trip</span>
            <button type="button" className="ghost-btn" onClick={() => close(true)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const noun = label.toLowerCase();
  return (
    <div className="stepper">
      <span className="tr-stepper-text">
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
      <div className="stepper-ctrl">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${noun}`}>
          <Icon name="minus" size={12} />
        </button>
        <b aria-live="polite">{value}</b>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${noun}`}>
          <Icon name="plus" size={12} />
        </button>
      </div>
    </div>
  );
}

/* ---------- states ---------- */

/* Server render and hydration: the trip isn't known yet, so the parts that
   depend on it are shimmering blocks of the same size — nothing jumps. */
function TripSkeleton() {
  return (
    <div className="flow">
      <div className="flow-inner">
        <FlowSteps current={1} />
        <header className="flow-head">
          <span className="flow-icon">
            <GlobeIcon />
          </span>
          <h1 className="flow-title">Trip Overview</h1>
          <div className="tr-skeleton" role="status">
            <span className="tr-sr">Loading your trip</span>
            <span className="tr-skel tr-skel-chip" aria-hidden="true" />
          </div>
        </header>
        <div className="tr-timeline" aria-hidden="true">
          <span className="tr-skel tr-skel-tchip" />
          <span className="tr-skel tr-skel-tchip" />
          <span className="tr-skel tr-skel-tchip" />
        </div>
        <div className="tr-skel tr-skel-map" aria-hidden="true" />
        <div className="tr-total-row" aria-hidden="true">
          <span className="tr-skel tr-skel-total" />
          <span className="tr-skel tr-skel-btn" />
        </div>
        <div className="tr-stops" aria-hidden="true">
          <div className="tr-skel tr-skel-card" />
          <div className="tr-skel tr-skel-card" />
          <div className="tr-skel tr-skel-card" />
        </div>
      </div>
    </div>
  );
}

function TripEmpty({ lastSearch, stale, onClear }: { lastSearch: SearchParams | null; stale: boolean; onClear: () => void }) {
  return (
    <div className="flow">
      <div className="flow-inner narrow">
        <FlowSteps current={0} />
        <div className="tr-empty">
          <span className="empty-icon">
            <Icon name="pin" size={20} />
          </span>
          <h1 className="flow-title">Your trip is empty</h1>
          <p className="tr-empty-sub">
            {stale
              ? "The stays that were in your trip are no longer available — start again with a fresh search."
              : "Search for a destination and add a stay to start building your itinerary."}
          </p>
          <div className="tr-empty-actions">
            <Link href={searchHref(lastSearch ?? {})} className="primary-btn">
              Find a stay
              <Icon name="arrowRight" size={14} />
            </Link>
            <Link href="/search" className="ghost-btn">
              Browse popular destinations
            </Link>
            {stale && (
              <button type="button" className="ghost-btn danger" onClick={onClear}>
                <Icon name="x" size={13} />
                Clear trip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
