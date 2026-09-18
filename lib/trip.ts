import type { Property } from "./properties";
import { getProperty, getPropertyDetail, type PropertyDetail, type Room, type RoomRate } from "./propertyDetails";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** One stay in a multi-destination trip. Dates are ISO `YYYY-MM-DD`. */
export interface TripStop {
  id: string;
  propertyId: string;
  roomId: string;
  rateId: string;
  checkIn: string;
  checkOut: string;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PaymentSummary {
  brand: string;
  last4: string;
}

export interface TripTotals {
  nights: number;
  subtotal: number;
  taxes: number;
  service: number;
  total: number;
}

/** A confirmed (mock-paid) trip, kept so the confirmation page can show it. */
export interface Booking {
  ref: string;
  createdAt: string;
  stops: TripStop[];
  adults: number;
  children: number;
  guest: GuestDetails;
  payment: PaymentSummary;
  totals: TripTotals;
}

/** A stop joined with the catalogue data it points at. */
export interface ResolvedStop extends TripStop {
  property: Property;
  detail: PropertyDetail;
  room: Room | null;
  rate: RoomRate | null;
  nights: number;
  /** Nightly price actually charged (rate price, falling back to the property's headline price). */
  nightly: number;
  subtotal: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const TAX_RATE = 0.12;
export const SERVICE_RATE = 0.03;

/* Fixed defaults keep server and client markup identical on first render. */
export const DEFAULT_CHECK_IN = "2026-10-16";
export const DEFAULT_CHECK_OUT = "2026-10-19";
export const MAX_ADULTS = 12;
export const MAX_CHILDREN = 8;

/* ------------------------------------------------------------------ */
/*  Dates                                                              */
/* ------------------------------------------------------------------ */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseIso(iso: string) {
  return new Date(iso + "T12:00:00");
}

export function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(parseIso(v).getTime());
}

export function nightsBetween(a: string, b: string) {
  const ms = parseIso(b).getTime() - parseIso(a).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function addDays(iso: string, days: number) {
  const d = parseIso(iso);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* Hand-rolled rather than Intl so the server and browser produce byte-identical
   markup (Node's ICU and Chrome punctuate "en-GB" short dates differently). */

/** "Thu, 16 Oct" */
export function formatDate(iso: string) {
  const d = parseIso(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "Oct 16" */
export function formatShort(iso: string) {
  const d = parseIso(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Oct 16–19" within a month, "Oct 30 – Nov 2" across months. */
export function formatRange(from: string, to: string) {
  const a = parseIso(from);
  const b = parseIso(to);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${MONTHS[a.getMonth()]} ${a.getDate()}–${b.getDate()}`;
  }
  return `${formatShort(from)} – ${formatShort(to)}`;
}

/** "Thursday 16 October 2026" */
export function formatLong(iso: string) {
  const d = parseIso(iso);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* ------------------------------------------------------------------ */
/*  Money & misc formatting                                            */
/* ------------------------------------------------------------------ */

export function money(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function plural(n: number, one: string, many = one + "s") {
  return `${n} ${n === 1 ? one : many}`;
}

export function guestsLabel(adults: number, children: number) {
  const total = adults + children;
  return plural(total, "guest");
}

/** "IT" → "🇮🇹" via regional indicator symbols. */
export function flagEmoji(countryCode: string) {
  const cc = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Joins names as "Rome, Florence and Venice". */
export function joinNames(names: string[]) {
  const uniq = [...new Set(names)];
  if (uniq.length <= 1) return uniq[0] ?? "";
  return `${uniq.slice(0, -1).join(", ")} and ${uniq[uniq.length - 1]}`;
}

/* ------------------------------------------------------------------ */
/*  Ids (client-side only — call from event handlers, never in render)  */
/* ------------------------------------------------------------------ */

export function newStopId() {
  return `stop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Booking references look like "JRN-7K3F2Q". */
export function newBookingRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `JRN-${out}`;
}

/* ------------------------------------------------------------------ */
/*  Resolution & pricing                                               */
/* ------------------------------------------------------------------ */

export function sortStops<T extends TripStop>(stops: T[]): T[] {
  return [...stops].sort((a, b) => (a.checkIn < b.checkIn ? -1 : a.checkIn > b.checkIn ? 1 : 0));
}

export function resolveStop(stop: TripStop): ResolvedStop | null {
  const property = getProperty(stop.propertyId);
  const detail = getPropertyDetail(stop.propertyId);
  if (!property || !detail) return null;
  const room = detail.rooms.find((r) => r.id === stop.roomId) ?? null;
  const rate = room?.rates.find((r) => r.id === stop.rateId) ?? null;
  const nights = nightsBetween(stop.checkIn, stop.checkOut);
  const nightly = rate?.price ?? property.price;
  return { ...stop, property, detail, room, rate, nights, nightly, subtotal: nightly * nights };
}

/** Resolves every stop that still points at a real property, sorted by check-in. */
export function resolveStops(stops: TripStop[]): ResolvedStop[] {
  return sortStops(stops.map(resolveStop).filter((s): s is ResolvedStop => s !== null));
}

export function tripTotals(stops: ResolvedStop[]): TripTotals {
  const subtotal = stops.reduce((n, s) => n + s.subtotal, 0);
  const nights = stops.reduce((n, s) => n + s.nights, 0);
  const taxes = Math.round(subtotal * TAX_RATE);
  const service = Math.round(subtotal * SERVICE_RATE);
  return { nights, subtotal, taxes, service, total: subtotal + taxes + service };
}

/** Earliest check-in and latest check-out across the trip. */
export function tripRange(stops: TripStop[]): { start: string; end: string } | null {
  if (!stops.length) return null;
  let start = stops[0].checkIn;
  let end = stops[0].checkOut;
  for (const s of stops) {
    if (s.checkIn < start) start = s.checkIn;
    if (s.checkOut > end) end = s.checkOut;
  }
  return { start, end };
}

/** Sensible dates for the next stop: it starts the day the last one ends. */
export function suggestNextDates(stops: TripStop[], nights = 2): { checkIn: string; checkOut: string } {
  const range = tripRange(stops);
  if (!range) return { checkIn: DEFAULT_CHECK_IN, checkOut: DEFAULT_CHECK_OUT };
  return { checkIn: range.end, checkOut: addDays(range.end, nights) };
}

/** Distinct countries in trip order, e.g. "Italy" or "Italy & Greece". */
export function tripCountriesLabel(stops: ResolvedStop[]) {
  const countries = [...new Set(stops.map((s) => s.property.country))];
  if (countries.length === 0) return "";
  if (countries.length === 1) return countries[0];
  return `${countries.slice(0, -1).join(", ")} & ${countries[countries.length - 1]}`;
}
