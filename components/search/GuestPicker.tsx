"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import Icon from "@/components/Icon";
import { MAX_ADULTS, MAX_CHILDREN, plural } from "@/lib/trip";

/** "2 adults, 1 child" */
function partyLabel(adults: number, kids: number) {
  return kids > 0 ? `${plural(adults, "adult")}, ${plural(kids, "child", "children")}` : plural(adults, "adult");
}

/* The Guests field of the search bar: a trigger that reads like the other
   fields, opening a small popover with adult / child steppers. */
export default function GuestPicker({
  adults,
  kids,
  onAdults,
  onKids,
}: {
  adults: number;
  kids: number;
  onAdults: (n: number) => void;
  onKids: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;
    dialog.current?.focus();
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

  /* Tabbing out of the popover closes it; clicks on non-focusable bits inside
     (relatedTarget null) are left to the pointer listener above. */
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget instanceof Node && !wrap.current?.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div ref={wrap} className="sb-field sb-guests" onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={trigger}
        type="button"
        className="sb-guests-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sb-label">Guests</span>
        <span className="sb-value">{partyLabel(adults, kids)}</span>
        <Icon name="chevronDown" size={13} className="sb-guests-chev" />
      </button>

      {open && (
        <div ref={dialog} id={dialogId} className="sb-pop" role="dialog" aria-label="Guests" tabIndex={-1}>
          <Stepper label="Adults" hint="Ages 13 or above" value={adults} min={1} max={MAX_ADULTS} onChange={onAdults} />
          <Stepper label="Children" hint="Ages 0 to 12" value={kids} min={0} max={MAX_CHILDREN} onChange={onKids} />
          <div className="sb-pop-foot">
            <span>Up to {MAX_ADULTS} adults and {MAX_CHILDREN} children</span>
            <button type="button" className="ghost-btn" onClick={() => close(true)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const noun = label.toLowerCase();
  return (
    <div className="stepper">
      <span className="sb-stepper-text">
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
      <div className="stepper-ctrl">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${noun}`}>
          <Icon name="minus" size={12} />
        </button>
        <b aria-live="polite">{value}</b>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${noun}`}>
          <Icon name="plus" size={12} />
        </button>
      </div>
    </div>
  );
}
