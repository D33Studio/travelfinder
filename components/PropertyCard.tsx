"use client";

import { useState } from "react";
import Image from "next/image";
import { Property, PillColor } from "@/lib/properties";

const pillClass: Record<PillColor, string> = {
  blue:  "p-blue",
  green: "p-green",
  amber: "p-amber",
  teal:  "p-teal",
  olive: "p-olive",
  dim:   "p-dim",
};

export default function PropertyCard({ property }: { property: Property }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="card">
      <div className="card-thumb">
        <Image
          src={property.image}
          alt={property.name}
          width={275}
          height={430}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
          className="card-img"
        />
        <div className="card-overlay" />
        <div className="card-badge">{property.location}</div>
        <button
          className={`card-save${saved ? " saved" : ""}`}
          onClick={() => setSaved(!saved)}
          aria-label="Save property"
        >
          <svg
            viewBox="0 0 24 24"
            style={{ width: 13, height: 13, stroke: "rgba(255,255,255,0.9)", fill: saved ? "#ffffff" : "none", strokeWidth: 1.75, strokeLinecap: "round" } as React.CSSProperties}
          >
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      <div className="card-body">
        <div className="card-name">{property.name}</div>
        <div className="card-price-row">
          <div className="card-price">
            ${property.price.toLocaleString()} <span>/night</span>
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
        <div className="card-pills">
          {property.pills.map((pill) => (
            <span key={pill.label} className={`pill ${pillClass[pill.color]}`}>
              {pill.label}
            </span>
          ))}
        </div>
        <div className="reserve-wrap">
          <button className="reserve-btn">Reserve →</button>
        </div>
      </div>
    </div>
  );
}
