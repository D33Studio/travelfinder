"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import Icon from "@/components/Icon";
import { useTrip } from "@/components/TripContext";
import { searchHref, suggestPlaces, type SearchParams } from "@/lib/search";
import { addDays, flagEmoji, formatDate, formatRange, guestsLabel } from "@/lib/trip";
import GuestPicker from "./GuestPicker";

/* One search bar, two modes:
   - "hero"    — the full bar under the home-page headline (live-filters the rows via onQueryChange)
   - "compact" — a sticky pill on /search that expands into the same bar
   Fields initialise from `initial`; the caller re-keys the component when that changes. */
export default function SearchBar({
  mode,
  initial,
  onQueryChange,
}: {
  mode: "hero" | "compact";
  initial: SearchParams;
  onQueryChange?: (q: string) => void;
}) {
  const router = useRouter();
  const trip = useTrip();
  const uid = useId();
  const listId = `${uid}-places`;
  const panelId = `${uid}-panel`;
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(initial.q);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [adults, setAdults] = useState(initial.adults);
  const [kids, setKids] = useState(initial.children);

  const [expanded, setExpanded] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const editBtn = useRef<HTMLButtonElement>(null);

  const suggestions = q.trim() ? suggestPlaces(q) : [];
  const showList = listOpen && suggestions.length > 0;
  const active = showList && highlight < suggestions.length ? highlight : -1;

  const changeQuery = (value: string) => {
    setQ(value);
    setHighlight(-1);
    onQueryChange?.(value);
  };

  const pick = (label: string) => {
    setQ(label);
    setListOpen(false);
    setHighlight(-1);
    onQueryChange?.(label);
  };

  const onWhereKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!suggestions.length) return;
      setListOpen(true);
      const last = suggestions.length - 1;
      setHighlight(e.key === "ArrowDown" ? (active >= last ? 0 : active + 1) : active <= 0 ? last : active - 1);
    } else if (e.key === "Enter") {
      if (active >= 0) {
        e.preventDefault();
        pick(suggestions[active].label);
      }
      /* otherwise the form submits natively */
    } else if (e.key === "Escape" && showList) {
      e.preventDefault();
      e.stopPropagation();
      setListOpen(false);
      setHighlight(-1);
    }
  };

  const changeFrom = (value: string) => {
    if (!value) return;
    setFrom(value);
    if (value >= to) setTo(addDays(value, 1));
  };

  const changeTo = (value: string) => {
    if (!value) return;
    setTo(value > from ? value : addDays(from, 1));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params: SearchParams = { q: q.trim(), from, to, adults, children: kids };
    setListOpen(false);
    setExpanded(false);
    trip.setLastSearch(params);
    startTransition(() => router.push(searchHref(params)));
  };

  const form = (
    <form className="sb-bar" role="search" aria-label="Search stays" onSubmit={submit}>
      <div className="sb-field sb-where">
        <label className="sb-label" htmlFor={`${uid}-q`}>
          Where
        </label>
        <div className="sb-where-row">
          <svg className="sb-glass" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            id={`${uid}-q`}
            className="sb-input"
            type="text"
            value={q}
            placeholder="Where to? Try Italy, Tokyo or Maldives"
            autoComplete="off"
            role="combobox"
            aria-expanded={showList}
            aria-controls={showList ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            onChange={(e) => {
              setListOpen(true);
              changeQuery(e.target.value);
            }}
            onKeyDown={onWhereKeyDown}
            onFocus={() => setListOpen(true)}
            onClick={() => setListOpen(true)}
            onBlur={() => setListOpen(false)}
          />
        </div>
        {showList && (
          <ul id={listId} className="sb-suggest" role="listbox" aria-label="Suggested places">
            {suggestions.map((s, i) => (
              <li
                key={`${s.label}|${s.sub}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(s.label)}
              >
                <span className="sb-flag" aria-hidden="true">
                  {flagEmoji(s.countryCode)}
                </span>
                <span className="sb-suggest-text">
                  <span>{s.label}</span>
                  <small>{s.sub}</small>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="sb-field sb-date">
        <span className="sb-label">Check in</span>
        <span className="sb-value">{formatDate(from)}</span>
        <input type="date" value={from} onChange={(e) => changeFrom(e.target.value)} aria-label="Check-in date" />
      </label>

      <label className="sb-field sb-date">
        <span className="sb-label">Check out</span>
        <span className="sb-value">{formatDate(to)}</span>
        <input type="date" value={to} min={addDays(from, 1)} onChange={(e) => changeTo(e.target.value)} aria-label="Check-out date" />
      </label>

      <GuestPicker adults={adults} kids={kids} onAdults={setAdults} onKids={setKids} />

      <button type="submit" className="primary-btn sb-submit" disabled={pending} aria-busy={pending}>
        {pending ? "Searching…" : "Search"}
        <Icon name="arrowRight" size={14} />
      </button>
    </form>
  );

  if (mode === "hero") return <div className="sb-hero">{form}</div>;

  const stopCount = trip.ready ? trip.stops.length : 0;
  const toggle = () => setExpanded((o) => !o);
  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setExpanded(false);
      editBtn.current?.focus();
    }
  };

  return (
    <div className="sb-sticky">
      <div className="sb-row">
        <Link href="/" className="crumb-back sb-home">
          <Icon name="arrowLeft" size={13} />
          Home
        </Link>

        <button type="button" className="sb-compact" aria-expanded={expanded} aria-controls={panelId} title="Edit search" onClick={toggle}>
          <span className="sb-seg sb-seg-dest">
            <Icon name="pin" size={12} />
            <b>{initial.q || "Anywhere"}</b>
          </span>
          <span className="sb-dot" aria-hidden="true">·</span>
          <span className="sb-seg">
            <Icon name="calendar" size={12} />
            {formatRange(initial.from, initial.to)}
          </span>
          <span className="sb-dot" aria-hidden="true">·</span>
          <span className="sb-seg">
            <Icon name="users" size={12} />
            {guestsLabel(initial.adults, initial.children)}
          </span>
        </button>

        <button ref={editBtn} type="button" className="ghost-btn sb-edit" aria-expanded={expanded} aria-controls={panelId} onClick={toggle}>
          Edit
          <Icon name="chevronDown" size={13} className="sb-chev" />
        </button>

        {stopCount > 0 && (
          <Link href="/trip" className="ghost-btn sb-trip">
            <Icon name="pin" size={13} />
            View trip ({stopCount})
          </Link>
        )}
      </div>

      <div id={panelId} className={`sb-panel${expanded ? " open" : ""}`} inert={!expanded} onKeyDown={onPanelKeyDown}>
        <div className="sb-panel-inner">{form}</div>
      </div>
    </div>
  );
}
