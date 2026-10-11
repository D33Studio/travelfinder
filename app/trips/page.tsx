import type { Metadata } from "next";
import TripsScreen from "@/components/trips/TripsScreen";

export const metadata: Metadata = { title: "Trips — Journey" };

export default function TripsPage() {
  return <TripsScreen />;
}
