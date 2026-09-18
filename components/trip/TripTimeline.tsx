"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { flagEmoji, formatRange, type ResolvedStop } from "@/lib/trip";

/* The itinerary as a chain of chips — dates · city · flag — joined by arrows
   and ending in an "Add another place" chip. Clicking a stop chip selects it
   on the map and in the cards below. Each arrow is grouped with the chip it
   points at, so a wrapped row never starts or ends with a stray arrow. */
export default function TripTimeline({
  stops,
  activeId,
  addHref,
  onSelect,
}: {
  stops: ResolvedStop[];
  activeId: string;
  addHref: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="tr-timeline" role="group" aria-label="Stops in order">
      {stops.map((stop, i) => {
        const on = stop.id === activeId;
        return (
          <span key={stop.id} className="tr-tl-item">
            {i > 0 && <Icon name="arrowRight" size={14} className="tr-chip-arrow" />}
            <button type="button" className={`tr-chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => onSelect(stop.id)}>
              <b>{formatRange(stop.checkIn, stop.checkOut)}</b>
              <span className="tr-chip-dot" aria-hidden="true">
                ·
              </span>
              <span>{stop.property.city}</span>
              <span className="tr-chip-flag" aria-hidden="true">
                {flagEmoji(stop.property.countryCode)}
              </span>
            </button>
          </span>
        );
      })}
      <span className="tr-tl-item">
        <Icon name="arrowRight" size={14} className="tr-chip-arrow" />
        <Link href={addHref} className="tr-chip tr-chip-add">
          <Icon name="plus" size={12} />
          Add another place
        </Link>
      </span>
    </div>
  );
}
