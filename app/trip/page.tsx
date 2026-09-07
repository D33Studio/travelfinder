import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import TripOverview from "@/components/trip/TripOverview";

export const metadata: Metadata = { title: "Your trip — Journey" };

export default function TripPage() {
  return (
    <>
      <Sidebar />
      <div className="main">
        <TripOverview />
      </div>
    </>
  );
}
