"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import type { ResolvedStop } from "@/lib/trip";

/* Small pieces shared by the checkout and confirmation screens. */

const STEPS = ["Choose stays", "Review trip", "Checkout", "Confirmed"] as const;

/** The 4-step progress row at the top of every flow page. */
export function FlowSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <nav className="flow-steps" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const on = n === current;
        return (
          <Fragment key={label}>
            {i > 0 && (
              <span className="flow-step-sep" aria-hidden="true">
                <Icon name="chevronRight" size={12} />
              </span>
            )}
            <span className={`flow-step${done ? " done" : on ? " on" : ""}`} aria-current={on ? "step" : undefined}>
              <b aria-hidden="true">{n}</b>
              {label}
              {done && <span className="co-sr">, completed</span>}
            </span>
          </Fragment>
        );
      })}
    </nav>
  );
}

/** Padlock in the same weight as `components/Icon.tsx` (1.75 stroke, round caps). */
export function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="10" rx="3" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}

/* Shown if a property's remote photo can't be fetched, so a row never renders broken. */
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";

/** Fixed-size cover thumbnail; the wrapper class sets the box and radius. */
export function StayThumb({ src, sizes, className }: { src: string; sizes: string; className: string }) {
  const [current, setCurrent] = useState(src);
  return (
    <span className={className}>
      <Image
        src={current}
        alt=""
        fill
        sizes={sizes}
        style={{ objectFit: "cover" }}
        onError={() => {
          if (current !== FALLBACK_IMAGE) setCurrent(FALLBACK_IMAGE);
        }}
      />
    </span>
  );
}

/** "Terrace Suite · Flexible stay" — tolerant of a room or rate the catalogue no longer has. */
export function roomLine(stop: ResolvedStop) {
  return [stop.room?.name ?? "Room", stop.rate?.name].filter(Boolean).join(" · ");
}
