import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/search.css";
import "./styles/booking.css";
import "./styles/trip.css";
import "./styles/checkout.css";
import { TripProvider } from "@/components/TripContext";
import TripTray from "@/components/trip/TripTray";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Journey — Luxury Travel Finder",
  description: "Discover and book the world's most exclusive luxury properties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <TripProvider>
          {children}
          <TripTray />
        </TripProvider>
      </body>
    </html>
  );
}
