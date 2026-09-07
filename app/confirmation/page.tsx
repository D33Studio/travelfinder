import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import ConfirmationScreen from "@/components/checkout/ConfirmationScreen";

export const metadata: Metadata = { title: "Booking confirmed — Journey" };

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  /* Read here and passed down as a plain prop so the client screen
     never needs useSearchParams (and its Suspense requirement). */
  const sp = await searchParams;
  const raw = Array.isArray(sp.ref) ? sp.ref[0] : sp.ref;
  const ref = typeof raw === "string" && raw.trim() ? raw.trim().toUpperCase() : null;

  return (
    <>
      <Sidebar />
      <div className="main">
        <div className="flow">
          <ConfirmationScreen refParam={ref} />
        </div>
      </div>
    </>
  );
}
