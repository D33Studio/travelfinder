"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DateField from "@/components/DateField";
import Icon from "@/components/Icon";
import { useTrip } from "@/components/TripContext";
import type { PropertyDetail } from "@/lib/propertyDetails";
import { searchHref } from "@/lib/search";
import {
  MAX_ADULTS,
  MAX_CHILDREN,
  SERVICE_RATE,
  TAX_RATE,
  addDays,
  formatRange,
  guestsLabel,
  money,
  plural,
  resolveStops,
  tripTotals,
} from "@/lib/trip";
import { useBooking } from "./BookingContext";

/* How long the rooms section keeps its outline pulse after "Choose a room". */
const NUDGE_MS = 1000;

export default function BookingPanel({ detail }: { detail: PropertyDetail }) {
  const b = useBooking();
  const trip = useTrip();
  const router = useRouter();
  const nudgeTimer = useRef<number | undefined>(undefined);
  const [tripOpen, setTripOpen] = useState(false);
  const editBtn = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => () => window.clearTimeout(nudgeTimer.current), []);

  const nightly = b.selectedRate?.price ?? detail.price;
  const guests = b.adults + b.children;
  const subtotal = nightly * b.nights;
  const taxes = Math.round(subtotal * TAX_RATE);
  const service = Math.round(subtotal * SERVICE_RATE);
  const total = subtotal + taxes + service;

  /* With ?stop=… the panel can't tell add from edit until the stored trip has
     been read, so it shows placeholders rather than the wrong call to action. */
  const resolving = b.stopId !== null && !trip.ready;
  const editing = b.mode === "edit";

  /* The rest of the trip, excluding the stop being edited. */
  const others = useMemo(
    () => resolveStops(trip.ready ? trip.stops.filter((s) => s.id !== b.stopId) : []),
    [trip.ready, trip.stops, b.stopId]
  );
  const othersTotal = tripTotals(others).total;
  const alreadyInTrip = !editing && others.some((s) => s.propertyId === detail.id);

  const stay =
    b.selectedRoom && b.selectedRate
      ? { propertyId: detail.id, roomId: b.selectedRoom.id, rateId: b.selectedRate.id, checkIn: b.checkIn, checkOut: b.checkOut }
      : null;

  const goToRooms = () => {
    const rooms = document.getElementById("rooms");
    if (!rooms) return;
    rooms.scrollIntoView({ behavior: "smooth", block: "start" });
    rooms.querySelector<HTMLElement>(".room-select")?.focus({ preventScroll: true });
    window.clearTimeout(nudgeTimer.current);
    rooms.classList.remove("bkx-nudge");
    void rooms.offsetWidth; // restart the pulse if it is still running
    rooms.classList.add("bkx-nudge");
    nudgeTimer.current = window.setTimeout(() => rooms.classList.remove("bkx-nudge"), NUDGE_MS);
  };

  const addToTrip = () => {
    if (!stay) {
      goToRooms();
      return;
    }
    trip.addStop(stay);
    trip.setGuests(b.adults, b.children);
    router.push("/trip");
  };

  const addAndFindAnother = () => {
    if (!stay) {
      goToRooms();
      return;
    }
    trip.addStop(stay);
    trip.setGuests(b.adults, b.children);
    router.push(
      searchHref({ q: detail.country, from: b.checkOut, to: addDays(b.checkOut, b.nights), adults: b.adults, children: b.children })
    );
  };

  const updateStop = () => {
    if (!stay || !b.stopId) {
      goToRooms();
      return;
    }
    trip.updateStop(b.stopId, stay);
    trip.setGuests(b.adults, b.children);
    router.push("/trip");
  };

  const removeStop = () => {
    if (!b.stopId) return;
    trip.removeStop(b.stopId);
    router.push("/trip");
  };

  return (
    <div className="bk">
      {resolving ? (
        <div className="bkx-editing bkx-resolving" aria-hidden="true">
          <span className="bkx-skel bkx-skel-md" />
        </div>
      ) : editing ? (
        <div className="bkx-editing">
          <span className="bkx-editing-text">
            <span className="bkx-editing-dot" />
            Editing stop {b.stopIndex} of your trip
          </span>
          <Link href="/trip" className="bkx-editing-link">
            <Icon name="arrowLeft" size={12} />
            Back to trip
          </Link>
        </div>
      ) : null}

      <div className="bk-trip">
        <button
          type="button"
          className="sb-compact bk-compact"
          aria-expanded={tripOpen}
          aria-controls={panelId}
          title="Change dates or guests"
          onClick={() => setTripOpen((o) => !o)}
        >
          <span className="sb-seg">
            <Icon name="calendar" size={12} />
            {formatRange(b.checkIn, b.checkOut)}
          </span>
          <span className="sb-dot" aria-hidden="true">·</span>
          <span className="sb-seg">
            <Icon name="users" size={12} />
            {guestsLabel(b.adults, b.children)}
          </span>
        </button>
        <button
          ref={editBtn}
          type="button"
          className="ghost-btn sb-edit"
          aria-expanded={tripOpen}
          aria-controls={panelId}
          onClick={() => setTripOpen((o) => !o)}
        >
          Edit
          <Icon name="chevronDown" size={13} className="sb-chev" />
        </button>
      </div>

      <div
        id={panelId}
        className={`sb-panel${tripOpen ? " open" : ""}`}
        inert={!tripOpen}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setTripOpen(false);
            editBtn.current?.focus();
          }
        }}
      >
        <div className="sb-panel-inner">
          <div className="bk-edit">
            <div className="bk-dates">
              <DateField label="Check in" value={b.checkIn} onChange={b.setCheckIn} className="bk-field" labelClassName="bk-label" valueClassName="bk-value" />
              <DateField label="Check out" value={b.checkOut} min={addDays(b.checkIn, 1)} onChange={b.setCheckOut} align="right" className="bk-field" labelClassName="bk-label" valueClassName="bk-value" />
            </div>
            <div className="stepper-row">
              <Stepper label="Adults" value={b.adults} min={1} max={MAX_ADULTS} onChange={b.setAdults} />
              <Stepper label="Children" value={b.children} min={0} max={MAX_CHILDREN} onChange={b.setChildren} />
            </div>
          </div>
        </div>
      </div>

      {resolving ? (
        <div className="bk-room" aria-hidden="true">
          <div className="bk-room-text">
            <span className="bkx-skel bkx-skel-md" />
            <span className="bkx-skel bkx-skel-sm" />
          </div>
        </div>
      ) : b.selectedRoom && b.selectedRate ? (
        <>
          <button type="button" className="bk-pick" onClick={goToRooms} aria-label={`${b.selectedRoom.name} — change room`}>
            <Image src={b.selectedRoom.image} alt="" fill sizes="320px" style={{ objectFit: "cover" }} />
            <span className="card-overlay" />
            <span className="glass-badge bk-pick-change">Change</span>
            <span className="bk-pick-name">{b.selectedRoom.name}</span>
          </button>
          <div className="bk-pick-meta">
            <span>
              {b.selectedRate.name} · {b.selectedRoom.bed}
            </span>
            <span className="bk-pick-price">
              {money(nightly)} <span>/night</span>
            </span>
          </div>
          <div className="bk-breakdown">
            <div>
              <span>{money(nightly)} × {plural(b.nights, "night")}</span>
              <span>{money(subtotal)}</span>
            </div>
            <div>
              <span>Taxes &amp; local levies</span>
              <span>{money(taxes)}</span>
            </div>
            <div>
              <span>Journey service fee</span>
              <span>{money(service)}</span>
            </div>
            <div className="bk-total">
              <span>Total · {plural(guests, "guest")}</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </>
      ) : (
        <button type="button" className="bk-room" onClick={goToRooms}>
          <div className="bk-room-icon">
            <Icon name="bed" size={15} />
          </div>
          <div className="bk-room-text">
            <strong>Choose a room</strong>
            <span>
              {detail.rooms.length} room types · from {money(detail.price)}/night
            </span>
          </div>
          <Icon name="chevronRight" size={14} className="bk-room-chev" />
        </button>
      )}

      <div className="bkx-actions">
        {resolving ? (
          <div className="bkx-skeleton" role="status">
            <span className="bkx-sr">Loading your trip</span>
            <span className="bkx-skel-btn" aria-hidden="true" />
            <span className="bkx-skel-btn bkx-skel-btn-sm" aria-hidden="true" />
          </div>
        ) : (
          <>
            {alreadyInTrip && (
              <p className="bkx-already">
                Already in your trip · <Link href="/trip">View trip</Link>
              </p>
            )}
            {!stay ? (
              <button type="button" className="primary-btn bkx-primary" onClick={goToRooms}>
                Choose a room to continue
                <Icon name="chevronDown" size={14} />
              </button>
            ) : editing ? (
              <button type="button" className="primary-btn bkx-primary" onClick={updateStop}>
                Update stop
                <Icon name="arrowRight" size={14} />
              </button>
            ) : (
              <>
                <button type="button" className="primary-btn bkx-primary" onClick={addToTrip}>
                  Add to trip
                  <Icon name="arrowRight" size={14} />
                </button>
                <button type="button" className="ghost-btn bkx-secondary" onClick={addAndFindAnother}>
                  <Icon name="plus" size={13} />
                  Add &amp; find another stay
                </button>
              </>
            )}
            {editing && (
              <button type="button" className="ghost-btn danger bkx-secondary" onClick={removeStop}>
                <Icon name="x" size={13} />
                Remove from trip
              </button>
            )}
          </>
        )}
      </div>
      <div className="bk-note">{editing ? "Changes apply to your trip overview" : "You won't be charged until checkout"}</div>

      {others.length > 0 && (
        <div className="bkx-tripline">
          <span>
            Trip so far · {plural(others.length, "stay")} · {money(othersTotal)}
          </span>
          <Link href="/trip">View</Link>
        </div>
      )}

      <ul className="bk-perks">
        <li><Icon name="shield" size={13} /> Best price guaranteed</li>
        <li><Icon name="clock" size={13} /> {b.selectedRate?.perks.find((p) => p.label === "Free cancellation")?.included ? "Free cancellation on this rate" : "Flexible rates available"}</li>
        <li><Icon name="sparkles" size={13} /> Members earn {Math.round(total / 10).toLocaleString("en-US")} points</li>
      </ul>
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <div className="stepper-ctrl">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          <Icon name="minus" size={12} />
        </button>
        <b>{value}</b>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
          <Icon name="plus" size={12} />
        </button>
      </div>
    </div>
  );
}
