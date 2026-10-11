import type { Metadata } from "next";
import SavedScreen from "@/components/trips/SavedScreen";

export const metadata: Metadata = { title: "Saved — Journey" };

export default function SavedPage() {
  return <SavedScreen />;
}
