"use client";

import Icon from "@/components/Icon";
import { flagEmoji, formatRange, guestsLabel, money, plural, type ResolvedStop, type TripTotals } from "@/lib/trip";
import { StayThumb, roomLine } from "./shared";

export default function OrderSummary({
  resolved,
  totals,
  adults,
  kids,
}: {
  resolved: ResolvedStop[];
  totals: TripTotals;
  adults: number;
  kids: number;
}) {
  return (
    <section className="flow-panel" aria-labelledby="co-summary-title">
      <div className="co-panel-head">
        <div>
          <h2 id="co-summary-title" className="co-section-title">Your trip</h2>
          <p className="co-section-hint">
            {plural(resolved.length, "stay")} · {plural(totals.nights, "night")} · {guestsLabel(adults, kids)}
          </p>
        </div>
      </div>

      <ul className="co-items">
        {resolved.map((s) => (
          <li key={s.id} className="co-item">
            <StayThumb className="co-thumb" src={s.property.image} sizes="56px" />
            <div className="co-item-body">
              <div className="co-item-name">{s.property.name}</div>
              <div className="co-item-meta">
                {s.property.city} {flagEmoji(s.property.countryCode)} · {formatRange(s.checkIn, s.checkOut)} · {plural(s.nights, "night")}
              </div>
              <div className="co-item-rate">{roomLine(s)}</div>
            </div>
            <div className="co-item-price">{money(s.subtotal)}</div>
          </li>
        ))}
      </ul>

      <div className="co-breakdown">
        <div>
          <span>Subtotal</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        <div>
          <span>Taxes &amp; local levies (12%)</span>
          <span>{money(totals.taxes)}</span>
        </div>
        <div>
          <span>Journey service fee (3%)</span>
          <span>{money(totals.service)}</span>
        </div>
        <div className="co-total">
          <span>Total</span>
          <span>{money(totals.total)}</span>
        </div>
      </div>

      <ul className="co-perks">
        <li><Icon name="shield" size={13} /> Best price guaranteed</li>
        <li><Icon name="clock" size={13} /> Free cancellation on flexible rates</li>
        <li><Icon name="sparkles" size={13} /> Members earn {Math.round(totals.total / 10).toLocaleString("en-US")} points</li>
      </ul>

      <p className="co-foot">Amounts in USD. Taxes are estimates and settled with each property.</p>
    </section>
  );
}
