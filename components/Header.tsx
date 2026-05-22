"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <span className="font-bold text-xl text-slate-900">TravelFinder</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">Destinations</Link>
          <Link href="/" className="hover:text-slate-900 transition-colors">Flights</Link>
          <Link href="/" className="hover:text-slate-900 transition-colors">Hotels</Link>
          <Link href="/" className="hover:text-slate-900 transition-colors">Experiences</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            Sign in
          </button>
          <button className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors">
            Get started
          </button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-slate-700 mb-1" />
          <div className="w-5 h-0.5 bg-slate-700 mb-1" />
          <div className="w-5 h-0.5 bg-slate-700" />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 text-sm font-medium text-slate-700">
          <Link href="/" className="block hover:text-slate-900">Destinations</Link>
          <Link href="/" className="block hover:text-slate-900">Flights</Link>
          <Link href="/" className="block hover:text-slate-900">Hotels</Link>
          <Link href="/" className="block hover:text-slate-900">Experiences</Link>
          <div className="pt-2 flex gap-3">
            <button className="flex-1 border border-slate-300 rounded-lg py-2 text-center hover:bg-slate-50">Sign in</button>
            <button className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-center hover:bg-blue-700">Get started</button>
          </div>
        </div>
      )}
    </header>
  );
}
