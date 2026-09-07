"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useTrip } from "@/components/TripContext";
import type { PropertyDetail, Room, RoomRate } from "@/lib/propertyDetails";
import { DEFAULT_SEARCH, type SearchParams } from "@/lib/search";
import {
  MAX_ADULTS,
  MAX_CHILDREN,
  addDays,
  isIsoDate,
  nightsBetween,
  suggestNextDates,
  type TripStop,
} from "@/lib/trip";

export interface Selection {
  roomId: string;
  rateId: string;
}

export type BookingMode = "add" | "edit";

interface BookingState {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  nights: number;
  selection: Selection | null;
  selectedRoom: Room | null;
  selectedRate: RoomRate | null;
  /** "edit" when `stopId` points at a stop that exists in the trip. */
  mode: BookingMode;
  stopId: string | null;
  /** The stop being edited; null in add mode. */
  editingStop: TripStop | null;
  /** 1-based position of `editingStop` in the sorted trip, 0 when not editing. */
  stopIndex: number;
  setCheckIn: (v: string) => void;
  setCheckOut: (v: string) => void;
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
  select: (roomId: string, rateId: string) => void;
  clear: () => void;
}

const BookingContext = createContext<BookingState | null>(null);

/* Only what the traveller has changed on this page. Everything else is derived
   at render time from the stop being edited, the URL, or the trip — so when the
   stored trip arrives after hydration the panel updates without an effect.
   `selection: null` means "explicitly cleared" and overrides the base. */
interface Edits {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  selection?: Selection | null;
}

interface Base {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  selection: Selection | null;
}

interface BaseInputs {
  editingStop: TripStop | null;
  initial: SearchParams;
  hasDates: boolean;
  trip: { ready: boolean; stops: TripStop[]; adults: number; children: number; lastSearch: SearchParams | null };
}

function deriveBase({ editingStop, initial, hasDates, trip }: BaseInputs): Base {
  if (editingStop) {
    return {
      checkIn: editingStop.checkIn,
      checkOut: editingStop.checkOut,
      adults: trip.adults,
      children: trip.children,
      selection: { roomId: editingStop.roomId, rateId: editingStop.rateId },
    };
  }
  if (hasDates) {
    return { checkIn: initial.from, checkOut: initial.to, adults: initial.adults, children: initial.children, selection: null };
  }
  if (trip.ready && trip.stops.length) {
    /* A second destination starts the day the previous one ends. */
    return { ...suggestNextDates(trip.stops, 2), adults: trip.adults, children: trip.children, selection: null };
  }
  const last = trip.ready ? trip.lastSearch : null;
  if (last && isIsoDate(last.from) && isIsoDate(last.to) && last.from < last.to) {
    return { checkIn: last.from, checkOut: last.to, adults: trip.adults, children: trip.children, selection: null };
  }
  return { checkIn: initial.from, checkOut: initial.to, adults: initial.adults, children: initial.children, selection: null };
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function BookingProvider({
  detail,
  initial = DEFAULT_SEARCH,
  hasDates = false,
  stopId = null,
  children,
}: {
  detail: PropertyDetail;
  /** Dates and party parsed from the URL (defaults when absent). */
  initial?: SearchParams;
  /** True when the URL explicitly carried `from` or `to`, so those dates win over the trip's suggestion. */
  hasDates?: boolean;
  stopId?: string | null;
  children: ReactNode;
}) {
  const trip = useTrip();
  const [edits, setEdits] = useState<Edits>({});

  const editingStop = (trip.ready && stopId ? trip.getStop(stopId) : undefined) ?? null;

  const value = useMemo<BookingState>(() => {
    const base = deriveBase({ editingStop, initial, hasDates, trip });

    const checkIn = edits.checkIn ?? base.checkIn;
    const rawCheckOut = edits.checkOut ?? base.checkOut;
    const checkOut = rawCheckOut > checkIn ? rawCheckOut : addDays(checkIn, 1);
    const adults = edits.adults ?? base.adults;
    const kids = edits.children ?? base.children;
    const selection = edits.selection === undefined ? base.selection : edits.selection;

    const selectedRoom = selection ? detail.rooms.find((r) => r.id === selection.roomId) ?? null : null;
    const selectedRate = selectedRoom && selection ? selectedRoom.rates.find((r) => r.id === selection.rateId) ?? null : null;

    /* The date setters read the other date through `base` so a check-in that
       lands on or after the check-out pushes it to the next day in one update. */
    const setCheckIn = (v: string) => {
      if (!isIsoDate(v)) return;
      setEdits((e) => {
        const out = e.checkOut ?? base.checkOut;
        return v >= out ? { ...e, checkIn: v, checkOut: addDays(v, 1) } : { ...e, checkIn: v };
      });
    };
    const setCheckOut = (v: string) => {
      if (!isIsoDate(v)) return;
      setEdits((e) => (v > (e.checkIn ?? base.checkIn) ? { ...e, checkOut: v } : e));
    };

    return {
      checkIn,
      checkOut,
      adults,
      children: kids,
      nights: nightsBetween(checkIn, checkOut),
      selection,
      selectedRoom,
      selectedRate,
      mode: editingStop ? "edit" : "add",
      stopId,
      editingStop,
      stopIndex: editingStop ? trip.stops.findIndex((s) => s.id === editingStop.id) + 1 : 0,
      setCheckIn,
      setCheckOut,
      setAdults: (n) => setEdits((e) => ({ ...e, adults: clamp(n, 1, MAX_ADULTS) })),
      setChildren: (n) => setEdits((e) => ({ ...e, children: clamp(n, 0, MAX_CHILDREN) })),
      select: (roomId, rateId) => setEdits((e) => ({ ...e, selection: { roomId, rateId } })),
      clear: () => setEdits((e) => ({ ...e, selection: null })),
    };
  }, [detail.rooms, edits, editingStop, hasDates, initial, stopId, trip]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
