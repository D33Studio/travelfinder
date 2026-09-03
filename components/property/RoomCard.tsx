"use client";

import Image from "next/image";
import Icon from "@/components/Icon";
import type { Room } from "@/lib/propertyDetails";
import { useBooking } from "./BookingContext";

const pillClass = { blue: "p-blue", green: "p-green", amber: "p-amber", teal: "p-teal", olive: "p-olive", dim: "p-dim" } as const;

export default function RoomCard({ room }: { room: Room }) {
  const b = useBooking();
  const selected = b.selection?.roomId === room.id;

  return (
    <article className={`room${selected ? " selected" : ""}`}>
      <div className="room-media">
        <Image src={room.image} alt={room.name} fill sizes="(max-width: 1100px) 100vw, 320px" style={{ objectFit: "cover" }} />
        <div className="room-media-shade" />
        {room.left !== undefined && room.left <= 2 && (
          <span className="glass-badge room-left">Only {room.left} left</span>
        )}
        <span className="glass-badge room-size">
          <Icon name="ruler" size={11} />
          {room.size} m²
        </span>
      </div>

      <div className="room-body">
        <div className="room-head">
          <div>
            <h3 className="room-name">{room.name}</h3>
            <div className="room-view">{room.view}</div>
          </div>
          <div className="room-from">
            <span>from</span> ${room.rates[0].price.toLocaleString()}
          </div>
        </div>

        <div className="room-facts">
          <span className="meta-chip"><Icon name="bed" size={11} /> {room.bed}</span>
          <span className="meta-chip"><Icon name="users" size={11} /> Sleeps {room.sleeps}</span>
        </div>

        <div className="card-pills room-pills">
          {room.features.map((f) => (
            <span key={f.label} className={`pill ${pillClass[f.color]}`}>{f.label}</span>
          ))}
        </div>

        <div className="rates">
          {room.rates.map((rate) => {
            const on = selected && b.selection?.rateId === rate.id;
            return (
              <div key={rate.id} className={`rate${on ? " on" : ""}`}>
                <div className="rate-main">
                  <div className="rate-name">{rate.name}</div>
                  <div className="rate-perks">
                    {rate.perks.map((p) => (
                      <span key={p.label} className={p.included ? "yes" : "no"}>
                        <Icon name={p.included ? "check" : "x"} size={11} />
                        {p.label}
                      </span>
                    ))}
                  </div>
                  {rate.note && <div className="rate-note">{rate.note}</div>}
                </div>
                <div className="rate-side">
                  <div className="rate-price">
                    ${rate.price.toLocaleString()} <span>/night</span>
                  </div>
                  <div className="rate-total">${(rate.price * b.nights).toLocaleString()} for {b.nights} night{b.nights > 1 ? "s" : ""}</div>
                  <button
                    type="button"
                    className={`rate-btn${on ? " on" : ""}`}
                    onClick={() => (on ? b.clear() : b.select(room.id, rate.id))}
                    aria-pressed={on}
                  >
                    {on ? (
                      <>
                        <Icon name="check" size={13} /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
