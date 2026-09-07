"use client";

import { Fragment } from "react";
import Icon from "@/components/Icon";
import { flagEmoji, formatRange, type ResolvedStop } from "@/lib/trip";

/* The itinerary as a row of chips — dates · city · flag — with arrows between
   them. Clicking a chip selects that stop on the map and in the cards below. */
export default function TripTimeline({
  stops,
  activeId,
  onSelect,
}: {
  stops: ResolvedStop[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="tr-timeline" role="group" aria-label="Stops in order">
      {stops.map((stop, i) => {
        const on = stop.id === activeId;
        return (
          <Fragment key={stop.id}>
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
          </Fragment>
        );
      })}
    </div>
  );
}
