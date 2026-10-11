"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import type { Room } from "@/lib/propertyDetails";
import { money, plural } from "@/lib/trip";
import { useBooking } from "./BookingContext";

/* A room as a vertical card: photo, facts, the rate options (each with what
   it includes), then the chosen rate's price and a Select button. Picking a
   rate on the selected room switches the booking straight away; on any other
   room it only previews until Select is pressed. */
export default function RoomCard({ room }: { room: Room }) {
  const b = useBooking();
  const selected = b.selection?.roomId === room.id;
  const [preview, setPreview] = useState(room.rates[0].id);
  const rateId = selected && b.selection ? b.selection.rateId : preview;
  const rate = room.rates.find((r) => r.id === rateId) ?? room.rates[0];

  const pickRate = (id: string) => {
    setPreview(id);
    if (selected) b.select(room.id, id);
  };

  return (
    <article className={`room${selected ? " selected" : ""}`}>
      <div className="room-media">
        <Image src={room.image} alt={room.name} fill sizes="(max-width: 900px) 100vw, 280px" style={{ objectFit: "cover" }} />
        {room.left !== undefined && room.left <= 2 && <span className="glass-badge room-left">Only {room.left} left</span>}
        <span className="glass-badge room-size">
          <Icon name="ruler" size={11} />
          {room.size} m²
        </span>
      </div>

      <div className="room-body">
        <div>
          <h3 className="room-name">{room.name}</h3>
          <div className="room-view">{room.view}</div>
        </div>

        <div className="room-facts">
          <span className="meta-chip">
            <Icon name="bed" size={11} /> {room.bed}
          </span>
          <span className="meta-chip">
            <Icon name="users" size={11} /> Sleeps {room.sleeps}
          </span>
        </div>

        <div className="rates" role="radiogroup" aria-label={`${room.name} rates`}>
          {room.rates.map((r) => {
            const on = r.id === rate.id;
            const included = r.perks.filter((p) => p.included);
            return (
              <button key={r.id} type="button" role="radio" aria-checked={on} className={`rate${on ? " on" : ""}`} onClick={() => pickRate(r.id)}>
                <span className="rate-top">
                  <span className="rate-dot" aria-hidden="true" />
                  <span className="rate-name">{r.name}</span>
                  <span className="rate-price">{money(r.price)}</span>
                </span>
                <span className="rate-perks">
                  {included.length ? (
                    included.map((p) => (
                      <span key={p.label}>
                        <Icon name="check" size={11} />
                        {p.label}
                      </span>
                    ))
                  ) : (
                    <span className="rate-none">{r.note ?? "Room only"}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="room-foot">
          <div className="room-price">
            {money(rate.price)} <span>/night</span>
          </div>
          <div className="room-total">
            {money(rate.price * b.nights)} for {plural(b.nights, "night")}
          </div>
          <button
            type="button"
            className={`room-select${selected ? " on" : ""}`}
            onClick={() => (selected ? b.clear() : b.select(room.id, rate.id))}
            aria-pressed={selected}
          >
            {selected ? (
              <>
                <Icon name="check" size={13} /> Selected
              </>
            ) : (
              "Select room"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
