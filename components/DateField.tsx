"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import Icon from "@/components/Icon";
import { addDays, formatDate } from "@/lib/trip";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const parts = (v: string) => {
  const [y, m] = v.split("-").map(Number);
  return { y, m: m - 1 };
};
const shiftMonth = (y: number, m: number, by: number) => {
  const t = y * 12 + m + by;
  return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
};
const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/* A date field: a trigger that reads like the other search fields, opening a
   rounded month calendar. Replaces the native picker, whose popup can't be
   styled. Arrow keys move through days, Enter picks, Escape closes. */
export default function DateField({
  label,
  value,
  min,
  onChange,
  className,
  labelClassName,
  valueClassName,
  align = "left",
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
  className: string;
  labelClassName: string;
  valueClassName: string;
  /** Which edge of the field the calendar lines up with. */
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !wrap.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    }
  };

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget instanceof Node && !wrap.current?.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div ref={wrap} className={`${className} df`} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={trigger}
        type="button"
        className="df-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-label={`${label}: ${formatDate(value)}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={labelClassName}>{label}</span>
        <span className={valueClassName}>{formatDate(value)}</span>
      </button>
      {open && (
        <Calendar
          id={dialogId}
          label={label}
          value={value}
          min={min}
          align={align}
          onPick={(v) => {
            onChange(v);
            close(true);
          }}
        />
      )}
    </div>
  );
}

function Calendar({
  id,
  label,
  value,
  min,
  align,
  onPick,
}: {
  id: string;
  label: string;
  value: string;
  min?: string;
  align: "left" | "right";
  onPick: (v: string) => void;
}) {
  const [view, setView] = useState(() => parts(value));
  const [cursor, setCursor] = useState(value);
  const grid = useRef<HTMLDivElement>(null);
  /* Opening focuses the selected day; after that, focus follows the cursor
     only when the keyboard moved it (not when the month buttons are used). */
  const follow = useRef(true);
  useEffect(() => {
    if (!follow.current) return;
    follow.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${cursor}"]`)?.focus();
  }, [cursor]);

  const today = (() => {
    const d = new Date();
    return iso(d.getFullYear(), d.getMonth(), d.getDate());
  })();

  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const count = daysIn(view.y, view.m);
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => iso(view.y, view.m, i + 1))];
  const prev = shiftMonth(view.y, view.m, -1);
  const prevDisabled = !!min && iso(prev.y, prev.m, daysIn(prev.y, prev.m)) < min;

  const moveCursor = (to: string) => {
    if (min && to < min) return;
    follow.current = true;
    const p = parts(to);
    if (p.y !== view.y || p.m !== view.m) setView(p);
    setCursor(to);
  };

  const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    moveCursor(addDays(cursor, step));
  };

  const go = (by: number) => {
    const next = shiftMonth(view.y, view.m, by);
    setView(next);
    /* Keep the roving tab stop inside the visible month. */
    const first = iso(next.y, next.m, 1);
    setCursor(min && first < min ? min : first);
  };

  return (
    <div id={id} className={`df-pop df-${align}`} role="dialog" aria-label={`Choose ${label.toLowerCase()} date`}>
      <div className="df-head">
        <button type="button" className="df-nav" onClick={() => go(-1)} disabled={prevDisabled} aria-label="Previous month">
          <Icon name="chevronLeft" size={14} />
        </button>
        <span className="df-month" aria-live="polite">
          {MONTHS[view.m]} {view.y}
        </span>
        <button type="button" className="df-nav" onClick={() => go(1)} aria-label="Next month">
          <Icon name="chevronRight" size={14} />
        </button>
      </div>
      <div className="df-week" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div ref={grid} className="df-grid" role="grid" onKeyDown={onGridKeyDown}>
        {cells.map((day, i) =>
          day === null ? (
            <span key={`pad-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              data-day={day}
              className={`df-day${day === value ? " on" : ""}${day === today ? " today" : ""}`}
              tabIndex={day === cursor ? 0 : -1}
              disabled={!!min && day < min}
              aria-pressed={day === value}
              aria-label={formatDate(day)}
              onClick={() => onPick(day)}
            >
              {Number(day.slice(8))}
            </button>
          )
        )}
      </div>
    </div>
  );
}
