import type { Metadata } from "next";
import TripOverview from "@/components/trip/TripOverview";

export const metadata: Metadata = { title: "Your trip — Journey" };

export default function TripPage() {
  return <TripOverview />;
}
