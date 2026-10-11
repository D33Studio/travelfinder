"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTrip } from "@/components/TripContext";
import type { Property } from "@/lib/properties";

/* Shown if a property's remote photo can't be fetched, so a card never renders broken. */
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";

export default function PropertyCard({
  property,
  href,
  cta = "View rooms",
}: {
  property: Property;
  /** Override the link target, e.g. to carry search dates and party along. */
  href?: string;
  /** Label on the card's bottom button. */
  cta?: string;
}) {
  const trip = useTrip();
  const saved = trip.isSaved(property.id);
  const [src, setSrc] = useState(property.image);

  return (
    <Link href={href ?? `/property/${property.id}`} className="card" aria-label={`${property.name}, ${property.location}`}>
      <div className="card-thumb">
        <Image
          src={src}
          alt={property.name}
          width={210}
          height={328}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
          className="card-img"
          onError={() => {
            if (src !== FALLBACK_IMAGE) setSrc(FALLBACK_IMAGE);
          }}
        />
        <div className="card-overlay" />
        <div className="card-badge">{property.location}</div>
        <span
          role="button"
          tabIndex={0}
          className={`card-save${saved ? " saved" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            trip.toggleSaved(property.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              trip.toggleSaved(property.id);
            }
          }}
          aria-label={saved ? `Remove ${property.name} from saved` : `Save ${property.name}`}
          aria-pressed={saved}
        >
          <svg viewBox="0 0 24 24" width={17} height={17} fill={saved ? "#ffffff" : "none"} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </span>
      </div>

      <div className="card-body">
        <div className="card-name">{property.name}</div>
        <div className="card-price-row">
          <div className="card-price">
            ${property.price.toLocaleString("en-US")} <span>/night</span>
          </div>
          <div className="card-meta">
            <div className="meta-chip">
              <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, stroke: "currentColor", fill: "none", strokeWidth: 1.75, strokeLinecap: "round" } as React.CSSProperties}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              {property.guests}
            </div>
            <div className="meta-chip">
              <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, stroke: "currentColor", fill: "none", strokeWidth: 1.75, strokeLinecap: "round" } as React.CSSProperties}>
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              {property.bedrooms}
            </div>
          </div>
        </div>
        <div className="reserve-wrap">
          <span className="reserve-btn">{cta}</span>
        </div>
      </div>
    </Link>
  );
}
