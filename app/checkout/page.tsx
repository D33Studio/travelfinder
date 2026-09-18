import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import CheckoutScreen from "@/components/checkout/CheckoutScreen";

export const metadata: Metadata = { title: "Checkout — Journey" };

export default function CheckoutPage() {
  return (
    <>
      <Sidebar />
      <div className="main">
        <div className="flow">
          <CheckoutScreen />
        </div>
      </div>
    </>
  );
}
