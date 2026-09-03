import Icon from "@/components/Icon";
import type { PropertyDetail } from "@/lib/propertyDetails";

export default function LocationSection({ detail }: { detail: PropertyDetail }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.address)}`;

  return (
    <div className="loc">
      <div className="loc-map" aria-hidden="true">
        {/* Stylised map placeholder in the product's own palette — swaps for a live map tile later. */}
        <svg viewBox="0 0 640 320" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0v40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </pattern>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c9a96e" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="640" height="320" fill="#141414" />
          <rect width="640" height="320" fill="url(#grid)" />
          <path d="M-20 240 C120 200 180 260 320 210 S540 180 660 230" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="14" strokeLinecap="round" />
          <path d="M-20 240 C120 200 180 260 320 210 S540 180 660 230" fill="none" stroke="#1d1d1d" strokeWidth="10" strokeLinecap="round" />
          <path d="M90 -20 C120 80 60 160 110 260 S160 330 140 340" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
          <path d="M420 -20 C400 60 470 120 430 200 S400 300 440 340" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
          <path d="M-20 90 C100 110 200 60 320 95 S520 130 660 80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="520" cy="250" rx="90" ry="55" fill="rgba(90,140,200,0.12)" />
          <path d="M180 150 l60 -30 l70 40 l-40 60 l-70 -20z" fill="rgba(120,160,90,0.12)" />
          <circle cx="320" cy="160" r="70" fill="url(#glow)" />
          <g transform="translate(320 160)">
            <path d="M0 18c-7-9-14-15-14-24a14 14 0 0128 0c0 9-7 15-14 24z" fill="#c9a96e" stroke="#111" strokeWidth="2" />
            <circle cx="0" cy="-6" r="4.5" fill="#111" />
          </g>
        </svg>
        <a className="glass-btn loc-open" href={mapsUrl} target="_blank" rel="noreferrer">
          <Icon name="map" size={13} />
          Open in Maps
        </a>
      </div>

      <div className="loc-body">
        <div className="loc-address">
          <Icon name="pin" size={16} />
          <span>{detail.address}</span>
        </div>
        <p className="prose">{detail.locationBlurb}</p>
        <ul className="loc-nearby">
          {detail.nearby.map((n) => (
            <li key={n.name}>
              <span className="amen-icon">
                <Icon name={n.icon} size={14} />
              </span>
              <span className="loc-name">{n.name}</span>
              <span className="loc-dist">{n.distance}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
