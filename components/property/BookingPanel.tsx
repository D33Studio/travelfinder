"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import type { PropertyDetail } from "@/lib/propertyDetails";
import { useBooking, formatDate } from "./BookingContext";

const money = (n: number) => `$${n.toLocaleString()}`;

export default function BookingPanel({ detail }: { detail: PropertyDetail }) {
  const b = useBooking();
  const [reserved, setReserved] = useState(false);

  const nightly = b.selectedRate?.price ?? detail.price;
  const guests = b.adults + b.children;
  const subtotal = nightly * b.nights;
  const taxes = Math.round(subtotal * 0.12);
  const service = Math.round(subtotal * 0.03);
  const total = subtotal + taxes + service;

  const goToRooms = () => document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="bk">
      <div className="bk-head">
        <div>
          <div className="bk-price">
            {!b.selectedRate && <span className="bk-from">from</span>}
            {money(nightly)} <span>/night</span>
          </div>
          <div className="bk-sub">Includes chef, host and housekeeping</div>
        </div>
        <div className="rating-pill">
          <Icon name="star" size={10} filled />
          {detail.rating.toFixed(1)}
        </div>
      </div>

      <div className="bk-fields">
        <label className="bk-field">
          <span className="bk-label">Check in</span>
          <span className="bk-value">{formatDate(b.checkIn)}</span>
          <input type="date" value={b.checkIn} onChange={(e) => e.target.value && b.setCheckIn(e.target.value)} aria-label="Check-in date" />
        </label>
        <label className="bk-field">
          <span className="bk-label">Check out</span>
          <span className="bk-value">{formatDate(b.checkOut)}</span>
          <input type="date" value={b.checkOut} min={b.checkIn} onChange={(e) => e.target.value && b.setCheckOut(e.target.value)} aria-label="Check-out date" />
        </label>
        <div className="bk-field bk-guests">
          <span className="bk-label">Guests</span>
          <span className="bk-value">
            {b.adults} adult{b.adults > 1 ? "s" : ""}
            {b.children > 0 && `, ${b.children} child${b.children > 1 ? "ren" : ""}`}
          </span>
          <div className="stepper-row">
            <Stepper label="Adults" value={b.adults} min={1} onChange={b.setAdults} />
            <Stepper label="Children" value={b.children} min={0} onChange={b.setChildren} />
          </div>
        </div>
      </div>

      <button type="button" className="bk-room" onClick={goToRooms}>
        <div className="bk-room-icon">
          <Icon name="bed" size={15} />
        </div>
        <div className="bk-room-text">
          {b.selectedRoom && b.selectedRate ? (
            <>
              <strong>{b.selectedRoom.name}</strong>
              <span>{b.selectedRate.name} · {b.selectedRoom.bed}</span>
            </>
          ) : (
            <>
              <strong>Choose a room</strong>
              <span>{detail.rooms.length} room types available</span>
            </>
          )}
        </div>
        <Icon name="chevronRight" size={14} className="bk-room-chev" />
      </button>

      {reserved ? (
        <div className="bk-confirm">
          <div className="bk-confirm-icon">
            <Icon name="check" size={16} />
          </div>
          <div>
            <strong>Request sent</strong>
            <span>The property confirms within 2 hours. Nothing has been charged.</span>
          </div>
        </div>
      ) : (
        <button type="button" className="primary-btn bk-cta" onClick={() => setReserved(true)}>
          {b.selectedRate ? "Reserve" : "Reserve from " + money(nightly)}
          <Icon name="arrowRight" size={14} />
        </button>
      )}
      <div className="bk-note">You won&apos;t be charged yet</div>

      <div className="bk-breakdown">
        <div>
          <span>{money(nightly)} × {b.nights} night{b.nights > 1 ? "s" : ""}</span>
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
          <span>Total · {guests} guest{guests > 1 ? "s" : ""}</span>
          <span>{money(total)}</span>
        </div>
      </div>

      <ul className="bk-perks">
        <li><Icon name="shield" size={13} /> Best price guaranteed</li>
        <li><Icon name="clock" size={13} /> {b.selectedRate?.perks.find((p) => p.label === "Free cancellation")?.included ? "Free cancellation on this rate" : "Flexible rates available"}</li>
        <li><Icon name="sparkles" size={13} /> Members earn {Math.round(total / 10).toLocaleString()} points</li>
      </ul>
    </div>
  );
}

function Stepper({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (n: number) => void }) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <div className="stepper-ctrl">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          <Icon name="minus" size={12} />
        </button>
        <b>{value}</b>
        <button type="button" onClick={() => onChange(value + 1)} aria-label={`More ${label.toLowerCase()}`}>
          <Icon name="plus" size={12} />
        </button>
      </div>
    </div>
  );
}
