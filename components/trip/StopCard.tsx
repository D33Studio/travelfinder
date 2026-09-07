"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import { propertyHref } from "@/lib/search";
import { flagEmoji, formatRange, money, plural, type ResolvedStop } from "@/lib/trip";

/* One stay in the trip: an image card (click → edit the stop on the property
   page) with a Modify / Remove footer. Removing asks once, inline. */
export default function StopCard({
  stop,
  index,
  active,
  adults,
  kids,
  onActivate,
  onRemove,
}: {
  stop: ResolvedStop;
  index: number;
  active: boolean;
  adults: number;
  kids: number;
  onActivate: () => void;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const { property, detail, room, rate } = stop;
  const n = index + 1;
  /* The property page opens in edit mode for this stop, with the country as the
     query so "Back to search" lands somewhere sensible. */
  const href = propertyHref(property.id, { q: property.country, from: stop.checkIn, to: stop.checkOut, adults, children: kids }, stop.id);
  const roomLabel = `${room?.name ?? "Room"}${rate ? ` · ${rate.name}` : ""}`;

  const onActionsKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && confirming) {
      e.preventDefault();
      setConfirming(false);
    }
  };

  return (
    <article className="tr-stop-wrap" aria-label={`Stop ${n}: ${property.name}`} onMouseEnter={onActivate} onFocus={onActivate}>
      <span className={`tr-stop-label${active ? " on" : ""}`}>Stop {n}</span>

      <Link href={href} className={`tr-stop${active ? " on" : ""}`}>
        <Image src={property.image} alt="" fill sizes="(max-width: 720px) 100vw, 33vw" className="tr-stop-img" style={{ objectFit: "cover" }} />
        <div className="card-overlay" />
        <span className="glass-badge tr-stop-badge tr-stop-badge-l">
          {property.location}
          <span aria-hidden="true">{flagEmoji(property.countryCode)}</span>
        </span>
        <span className="glass-badge tr-stop-badge tr-stop-badge-r">
          {formatRange(stop.checkIn, stop.checkOut)}
          <b>{plural(stop.nights, "night")}</b>
        </span>
        <div className="tr-stop-body">
          <div className="tr-stop-name">{property.name}</div>
          <div className="tr-stop-price">
            {money(stop.nightly)} <span>/night</span>
          </div>
          <div className="tr-stop-meta">
            <span className="meta-chip">
              <Icon name="users" size={10} />
              {detail.guests}
            </span>
            <span className="meta-chip">
              <Icon name="bed" size={10} />
              {detail.bedrooms}
            </span>
            <span className="meta-chip tr-stop-room">
              <Icon name="door" size={10} />
              {roomLabel}
            </span>
          </div>
          <div className="tr-stop-sub">
            {plural(stop.nights, "night")} · {money(stop.subtotal)}
          </div>
        </div>
      </Link>

      <div className="tr-stop-actions" onKeyDown={onActionsKeyDown}>
        <Link href={href} className="ghost-btn">
          <Icon name="calendar" size={13} />
          Modify
        </Link>
        <div className="tr-stop-remove">
          {confirming && (
            <span className="tr-confirm-q" role="status">
              Remove stop?
            </span>
          )}
          {/* Same element in both states so keyboard focus survives the switch. */}
          <button
            type="button"
            className={`ghost-btn danger${confirming ? " tr-confirm" : ""}`}
            aria-label={confirming ? `Yes, remove stop ${n}` : `Remove stop ${n}`}
            onClick={() => (confirming ? onRemove() : setConfirming(true))}
          >
            {confirming ? (
              "Yes"
            ) : (
              <>
                <Icon name="x" size={13} />
                Remove
              </>
            )}
          </button>
          {confirming && (
            <button type="button" className="ghost-btn" onClick={() => setConfirming(false)}>
              Keep
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
