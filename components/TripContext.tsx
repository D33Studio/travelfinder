"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  MAX_ADULTS,
  MAX_CHILDREN,
  newBookingRef,
  newStopId,
  resolveStops,
  sortStops,
  tripTotals,
  type Booking,
  type GuestDetails,
  type PaymentSummary,
  type TripStop,
} from "@/lib/trip";
import type { SearchParams } from "@/lib/search";

/* ------------------------------------------------------------------ */
/*  The trip being built, shared by every screen and kept in            */
/*  localStorage so a refresh (or a return visit) doesn't lose it.       */
/*                                                                     */
/*  Implemented as a tiny external store read through                   */
/*  useSyncExternalStore: the server (and the hydration render) see an  */
/*  empty trip, the client swaps in the stored one right after mount.   */
/* ------------------------------------------------------------------ */

const TRIP_KEY = "journey.trip.v1";
const BOOKINGS_KEY = "journey.bookings.v1";

interface PersistedTrip {
  stops: TripStop[];
  adults: number;
  children: number;
  lastSearch: SearchParams | null;
}

export interface TripState {
  /** False during server render and hydration; true once the stored trip has been read. Render placeholders, not "empty trip", while false. */
  ready: boolean;
  /** Always sorted by check-in. */
  stops: TripStop[];
  adults: number;
  children: number;
  /** The most recent search the traveller ran, so property pages can fall back to its dates and party. */
  lastSearch: SearchParams | null;
  bookings: Booking[];

  addStop: (input: Omit<TripStop, "id">) => TripStop;
  updateStop: (id: string, patch: Partial<Omit<TripStop, "id">>) => void;
  removeStop: (id: string) => void;
  getStop: (id: string) => TripStop | undefined;
  setGuests: (adults: number, children: number) => void;
  setLastSearch: (p: SearchParams) => void;
  clearTrip: () => void;
  /** Mock "payment": snapshots the trip as a Booking, stores it, empties the trip, and returns it. */
  confirmBooking: (input: { guest: GuestDetails; payment: PaymentSummary }) => Booking;
  getBooking: (ref: string) => Booking | undefined;
}

const EMPTY: PersistedTrip = { stops: [], adults: 2, children: 0, lastSearch: null };
const NO_BOOKINGS: Booking[] = [];

/* ---------- persistence helpers ---------- */

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode, quota) — the trip just won't persist */
  }
}

function isStop(v: unknown): v is TripStop {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.propertyId === "string" &&
    typeof s.roomId === "string" &&
    typeof s.rateId === "string" &&
    typeof s.checkIn === "string" &&
    typeof s.checkOut === "string"
  );
}

function sanitizeTrip(v: unknown): PersistedTrip {
  if (!v || typeof v !== "object") return EMPTY;
  const t = v as Partial<PersistedTrip>;
  const stops = Array.isArray(t.stops) ? sortStops(t.stops.filter(isStop)) : [];
  const adults = typeof t.adults === "number" ? Math.min(MAX_ADULTS, Math.max(1, t.adults)) : 2;
  const children = typeof t.children === "number" ? Math.min(MAX_CHILDREN, Math.max(0, t.children)) : 0;
  const lastSearch = t.lastSearch && typeof t.lastSearch === "object" ? (t.lastSearch as SearchParams) : null;
  return { stops, adults, children, lastSearch };
}

function sanitizeBookings(v: unknown): Booking[] {
  return Array.isArray(v) ? (v.filter((b) => b && typeof b === "object" && typeof (b as Booking).ref === "string") as Booking[]) : NO_BOOKINGS;
}

/* ---------- the store (module-level, client only) ---------- */

let tripState: PersistedTrip = EMPTY;
let bookingsState: Booking[] = NO_BOOKINGS;
let loaded = false;
const listeners = new Set<() => void>();

function loadOnce() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  tripState = sanitizeTrip(readJson<unknown>(TRIP_KEY, EMPTY));
  bookingsState = sanitizeBookings(readJson<unknown>(BOOKINGS_KEY, NO_BOOKINGS));
}

function emit() {
  listeners.forEach((l) => l());
}

function setTrip(updater: (t: PersistedTrip) => PersistedTrip) {
  loadOnce();
  tripState = updater(tripState);
  writeJson(TRIP_KEY, tripState);
  emit();
}

function setBookings(updater: (b: Booking[]) => Booking[]) {
  loadOnce();
  bookingsState = updater(bookingsState);
  writeJson(BOOKINGS_KEY, bookingsState);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  /* Keep tabs in sync: a stop added in one tab shows up in the other. */
  const onStorage = (e: StorageEvent) => {
    if (e.key === TRIP_KEY) {
      tripState = sanitizeTrip(readJson<unknown>(TRIP_KEY, EMPTY));
      emit();
    }
    if (e.key === BOOKINGS_KEY) {
      bookingsState = sanitizeBookings(readJson<unknown>(BOOKINGS_KEY, NO_BOOKINGS));
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getTripSnapshot = () => {
  loadOnce();
  return tripState;
};
const getBookingsSnapshot = () => {
  loadOnce();
  return bookingsState;
};
const getServerTrip = () => EMPTY;
const getServerBookings = () => NO_BOOKINGS;
const subscribeNoop = () => () => {};
const clientTrue = () => true;
const serverFalse = () => false;

/* ---------- actions ---------- */

function addStop(input: Omit<TripStop, "id">) {
  const stop: TripStop = { ...input, id: newStopId() };
  setTrip((t) => ({ ...t, stops: sortStops([...t.stops, stop]) }));
  return stop;
}

function updateStop(id: string, patch: Partial<Omit<TripStop, "id">>) {
  setTrip((t) => ({ ...t, stops: sortStops(t.stops.map((s) => (s.id === id ? { ...s, ...patch, id } : s))) }));
}

function removeStop(id: string) {
  setTrip((t) => ({ ...t, stops: t.stops.filter((s) => s.id !== id) }));
}

function setGuests(adults: number, kids: number) {
  setTrip((t) => ({
    ...t,
    adults: Math.min(MAX_ADULTS, Math.max(1, adults)),
    children: Math.min(MAX_CHILDREN, Math.max(0, kids)),
  }));
}

function setLastSearch(p: SearchParams) {
  setTrip((t) => ({ ...t, lastSearch: p, adults: p.adults, children: p.children }));
}

function clearTrip() {
  setTrip((t) => ({ ...t, stops: [] }));
}

function confirmBooking({ guest, payment }: { guest: GuestDetails; payment: PaymentSummary }) {
  loadOnce();
  const resolved = resolveStops(tripState.stops);
  const booking: Booking = {
    ref: newBookingRef(),
    createdAt: new Date().toISOString(),
    stops: resolved.map(({ id, propertyId, roomId, rateId, checkIn, checkOut }) => ({ id, propertyId, roomId, rateId, checkIn, checkOut })),
    adults: tripState.adults,
    children: tripState.children,
    guest,
    payment,
    totals: tripTotals(resolved),
  };
  setBookings((b) => [booking, ...b].slice(0, 20));
  setTrip((t) => ({ ...t, stops: [] }));
  return booking;
}

/* ---------- React binding ---------- */

const TripContext = createContext<TripState | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(subscribeNoop, clientTrue, serverFalse);
  const trip = useSyncExternalStore(subscribe, getTripSnapshot, getServerTrip);
  const bookings = useSyncExternalStore(subscribe, getBookingsSnapshot, getServerBookings);

  const value = useMemo<TripState>(
    () => ({
      ready,
      stops: trip.stops,
      adults: trip.adults,
      children: trip.children,
      lastSearch: trip.lastSearch,
      bookings,
      addStop,
      updateStop,
      removeStop,
      getStop: (id) => trip.stops.find((s) => s.id === id),
      setGuests,
      setLastSearch,
      clearTrip,
      confirmBooking,
      getBooking: (ref) => bookings.find((b) => b.ref === ref),
    }),
    [ready, trip, bookings]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used inside <TripProvider>");
  return ctx;
}
