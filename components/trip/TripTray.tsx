"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { useTrip } from "@/components/TripContext";
import { money, plural, resolveStops, tripTotals } from "@/lib/trip";

/* Routes where the trip itself is the page (or, on property pages, where the
   booking panel already carries a "Trip so far" line and sits where the tray would). */
const HIDDEN_ON = ["/trip", "/checkout", "/confirmation", "/property"];

/* Floating "your trip so far" pill, mounted once in the root layout. Renders
   nothing until the stored trip has been read, so server and client agree. */
export default function TripTray() {
  const pathname = usePathname();
  const trip = useTrip();
  const resolved = useMemo(() => (trip.ready ? resolveStops(trip.stops) : []), [trip.ready, trip.stops]);

  if (!resolved.length || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const total = tripTotals(resolved).total;

  return (
    <aside className="tr-tray" aria-label="Your trip so far">
      <div className="tr-tray-thumbs" aria-hidden="true">
        {resolved.slice(0, 3).map((s) => (
          <Image key={s.id} src={s.property.image} alt="" width={26} height={26} className="tr-tray-thumb" />
        ))}
      </div>
      <span className="tr-tray-text">
        Your trip · {plural(resolved.length, "stay")} · <b>{money(total)}</b>
      </span>
      <Link href="/trip" className="primary-btn tr-tray-btn">
        View trip
        <Icon name="arrowRight" size={12} />
      </Link>
    </aside>
  );
}
