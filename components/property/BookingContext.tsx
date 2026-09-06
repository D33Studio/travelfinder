"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { PropertyDetail, Room, RoomRate } from "@/lib/propertyDetails";

export interface Selection {
  roomId: string;
  rateId: string;
}

interface BookingState {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  nights: number;
  selection: Selection | null;
  selectedRoom: Room | null;
  selectedRate: RoomRate | null;
  setCheckIn: (v: string) => void;
  setCheckOut: (v: string) => void;
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
  select: (roomId: string, rateId: string) => void;
  clear: () => void;
}

const BookingContext = createContext<BookingState | null>(null);

/* Fixed defaults keep server and client markup identical on first render;
   the user can change them from the booking panel. */
const DEFAULT_CHECK_IN = "2026-10-16";
const DEFAULT_CHECK_OUT = "2026-10-19";

function nightsBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function BookingProvider({ detail, children }: { detail: PropertyDetail; children: ReactNode }) {
  const [checkIn, setCheckIn] = useState(DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState(DEFAULT_CHECK_OUT);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);

  const value = useMemo<BookingState>(() => {
    const selectedRoom = selection ? detail.rooms.find((r) => r.id === selection.roomId) ?? null : null;
    const selectedRate = selectedRoom && selection ? selectedRoom.rates.find((r) => r.id === selection.rateId) ?? null : null;
    return {
      checkIn,
      checkOut,
      adults,
      children: kids,
      nights: nightsBetween(checkIn, checkOut),
      selection,
      selectedRoom,
      selectedRate,
      setCheckIn: (v) => {
        setCheckIn(v);
        if (v >= checkOut) {
          const d = new Date(v);
          d.setDate(d.getDate() + 1);
          setCheckOut(d.toISOString().slice(0, 10));
        }
      },
      setCheckOut: (v) => setCheckOut(v > checkIn ? v : checkOut),
      setAdults: (n) => setAdults(Math.min(12, Math.max(1, n))),
      setChildren: (n) => setKids(Math.min(8, Math.max(0, n))),
      select: (roomId, rateId) => setSelection({ roomId, rateId }),
      clear: () => setSelection(null),
    };
  }, [detail.rooms, checkIn, checkOut, adults, kids, selection]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Hand-rolled rather than Intl so the server and browser produce byte-identical
   markup (Node's ICU and Chrome punctuate "en-GB" short dates differently). */
export function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
