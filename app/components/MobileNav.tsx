'use client';

import { useState } from 'react';
import Link from 'next/link';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 text-white p-4 sticky top-0 z-20">
        <h1 className="text-xl font-bold">🍔 Bolt Food</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-800 rounded transition"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-gray-800 text-white border-t border-gray-700">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 hover:bg-gray-700 transition border-b border-gray-700"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/restaurants"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 hover:bg-gray-700 transition border-b border-gray-700"
          >
            🏪 Restaurants
          </Link>
          <Link
            href="/menu"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 hover:bg-gray-700 transition border-b border-gray-700"
          >
            🍕 Menu Items
          </Link>
          <Link
            href="/orders"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 hover:bg-gray-700 transition"
          >
            📦 Orders
          </Link>
        </nav>
      )}

      {/* Main content wrapper */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Content is passed as children */}
      </main>
    </>
  );
}
