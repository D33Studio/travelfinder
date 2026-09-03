import type { CSSProperties } from "react";

/* A single, consistent stroke-icon set so every glyph on the property page
   shares the same weight as the sidebar and card icons (1.75px, round caps). */

const paths = {
  pin: <><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
  bed: <><path d="M3 18v-7a2 2 0 012-2h14a2 2 0 012 2v7" /><path d="M3 18h18M5 9V6a1 1 0 011-1h12a1 1 0 011 1v3" /><path d="M8 9h8v2H8z" /></>,
  bath: <><path d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3z" /><path d="M6 12V5a2 2 0 012-2h1a2 2 0 012 2" /><path d="M6 21l1-2M18 21l-1-2" /></>,
  ruler: <><path d="M3 17l14-14 4 4L7 21H3v-4z" /><path d="M14 6l1.5 1.5M11 9l1.5 1.5M8 12l1.5 1.5" /></>,
  wifi: <><path d="M5 12.55a11 11 0 0114.08 0" /><path d="M1.42 9a16 16 0 0121.16 0" /><path d="M8.53 16.11a6 6 0 016.95 0" /><circle cx="12" cy="20" r="0.6" /></>,
  pool: <><path d="M2 18c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0" /><path d="M2 13c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0" /><path d="M8 13V5a2 2 0 012-2h1M16 13V5a2 2 0 00-2-2h-1" /></>,
  spa: <><path d="M12 22c-4-3-7-6-7-10a7 7 0 0114 0c0 4-3 7-7 10z" /><path d="M12 22V9" /><path d="M9 12c1 0 2 .5 3 2 1-1.5 2-2 3-2" /></>,
  gym: <><path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" /></>,
  restaurant: <><path d="M6 3v7a3 3 0 006 0V3M9 3v18" /><path d="M18 3c-2 2-3 5-3 8h3v10" /></>,
  car: <><path d="M5 17h14M3 12l2-5a2 2 0 012-1h10a2 2 0 012 1l2 5v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-5z" /><circle cx="7.5" cy="14.5" r="1" /><circle cx="16.5" cy="14.5" r="1" /></>,
  chef: <><path d="M8 20h8v-6H8z" /><path d="M7 14a4 4 0 01-1-7.9 4.5 4.5 0 018.5-1.5A4 4 0 0117 14" /></>,
  snow: <><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
  leaf: <><path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="M20 6L9 17l-5-5" />,
  x: <path d="M18 6L6 18M6 6l12 12" />,
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></>,
  bookmark: <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  plane: <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  train: <><rect x="4" y="3" width="16" height="14" rx="3" /><path d="M4 11h16M8 21l2-4M16 21l-2-4" /><circle cx="8.5" cy="14" r="1" /><circle cx="15.5" cy="14" r="1" /></>,
  city: <><path d="M3 21h18M5 21V7l6-4v18M13 21V11l6-3v13" /><path d="M8 9h1M8 13h1M8 17h1M16 13h1M16 17h1" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
  arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
  coffee: <><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path d="M6 1v3M10 1v3M14 1v3" /></>,
  wine: <><path d="M8 22h8M12 15v7M7 3h10l-1 7a4 4 0 01-8 0L7 3z" /></>,
  key: <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></>,
  sparkles: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /><path d="M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17z" /></>,
  waves: <><path d="M2 6c2 0 2.5 2 5 2s3-2 5-2 2.5 2 5 2 3-2 5-2" /><path d="M2 12c2 0 2.5 2 5 2s3-2 5-2 2.5 2 5 2 3-2 5-2" /><path d="M2 18c2 0 2.5 2 5 2s3-2 5-2 2.5 2 5 2 3-2 5-2" /></>,
  mountain: <><path d="M8 3l4 8 5-5 5 15H2L8 3z" /></>,
  tree: <><path d="M12 22v-4" /><path d="M8 18h8l-2-4h1l-3-5h1l-3-6-3 6h1l-3 5h1l-2 4z" /></>,
  flame: <path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-3-8-1 3-3 5-4 8-1 2-1 3-1 4 0 4 3 7 7 7z" />,
  hottub: <><path d="M3 12h18v4a4 4 0 01-4 4H7a4 4 0 01-4-4v-4z" /><path d="M8 8c0-1.5 1-1.5 1-3M12 8c0-1.5 1-1.5 1-3M16 8c0-1.5 1-1.5 1-3" /></>,
  boat: <><path d="M3 17l1.5 3h15L21 17" /><path d="M3 17c3-1 6-1 9 0s6 1 9 0" /><path d="M12 3v10M12 3c4 1 6 4 6 8H6c0-4 2-7 6-8z" /></>,
  concierge: <><path d="M3 18h18v2H3z" /><path d="M4 18a8 8 0 0116 0" /><path d="M12 10V7M10 7h4" /></>,
  laundry: <><rect x="4" y="2" width="16" height="20" rx="3" /><circle cx="12" cy="13" r="5" /><path d="M8 5h1M11 5h1" /></>,
  safe: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="12" cy="12" r="3" /><path d="M12 9v-1M12 16v-1M9 12H8M16 12h-1" /></>,
  tv: <><rect x="2" y="4" width="20" height="14" rx="3" /><path d="M8 22h8M12 18v4" /></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="3" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></>,
  bike: <><circle cx="6" cy="17" r="3.5" /><circle cx="18" cy="17" r="3.5" /><path d="M6 17l4-8h6l2 8M10 9L8 5h3M14 9l4 8" /></>,
  binoculars: <><path d="M6 10V5a1 1 0 011-1h2a1 1 0 011 1v5M14 10V5a1 1 0 011-1h2a1 1 0 011 1v5" /><rect x="2" y="10" width="8" height="10" rx="3" /><rect x="14" y="10" width="8" height="10" rx="3" /><path d="M10 14h4" /></>,
  tent: <><path d="M3 20L12 4l9 16H3z" /><path d="M12 12l-3 8M12 12l3 8" /></>,
  home: <><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z" /><path d="M9 21v-6h6v6" /></>,
  map: <><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /><path d="M8 2v16M16 6v16" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></>,
  door: <><path d="M13 4h3a2 2 0 012 2v14M2 20h20M13 20V4L4 6v14" /><circle cx="10" cy="12" r="0.8" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
};

export type IconName = keyof typeof paths;

export default function Icon({
  name,
  size = 16,
  className,
  style,
  filled = false,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0, ...style }}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
