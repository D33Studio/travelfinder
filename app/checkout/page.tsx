import type { Metadata } from "next";
import CheckoutScreen from "@/components/checkout/CheckoutScreen";

export const metadata: Metadata = { title: "Checkout — Journey" };

export default function CheckoutPage() {
  return (
    <div className="flow">
      <CheckoutScreen />
    </div>
  );
}
