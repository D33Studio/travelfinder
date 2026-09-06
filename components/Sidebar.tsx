"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTrip } from "@/components/TripContext";

interface NavItem {
  label: string;
  href: string;
  /** Path prefixes that light this item up. */
  match: string[];
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Search",
    href: "/",
    match: ["/", "/property"],
    icon: (
      <svg className="ni" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    label: "Trips",
    href: "/trip",
    match: ["/trip", "/checkout", "/confirmation"],
    icon: (
      <svg className="ni" viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Explore",
    href: "/search",
    match: ["/search"],
    icon: (
      <svg className="ni" viewBox="0 0 24 24">
        <polygon points="3,11 22,2 13,21 11,13 3,11" />
      </svg>
    ),
  },
  {
    label: "Saved",
    href: "#",
    match: [],
    icon: (
      <svg className="ni" viewBox="0 0 24 24">
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "#",
    match: [],
    icon: (
      <svg className="ni" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    label: "Messages",
    href: "#",
    match: [],
    icon: (
      <svg className="ni" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

function isActive(item: NavItem, pathname: string) {
  return item.match.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(m + "/")));
}

export default function Sidebar() {
  const pathname = usePathname();
  const trip = useTrip();
  const stopCount = trip.ready ? trip.stops.length : 0;

  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar-logo">
        Journey<span>.</span>
      </Link>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = isActive(item, pathname);
          const inert = item.href === "#";
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-item${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={inert ? (e) => e.preventDefault() : undefined}
            >
              {item.icon}
              {item.label}
              {item.label === "Trips" && stopCount > 0 && (
                <span className="nav-badge" aria-label={`${stopCount} stops in your trip`}>
                  {stopCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-profile">
        <div className="profile-avatar">D</div>
        <span className="profile-name">Dan</span>
        <div className="profile-dots">
          <svg viewBox="0 0 20 20" fill="currentColor" stroke="none" width="14" height="14">
            <circle cx="4" cy="10" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="16" cy="10" r="1.5" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
