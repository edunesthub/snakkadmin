import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { MobileNav } from "./components/MobileNav";

export const metadata: Metadata = {
  title: "Bolt Food Admin",
  description: "Admin dashboard for Bolt Food delivery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-gray-950 text-white">
        <div className="min-h-screen flex flex-col md:flex-row">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block md:w-64 bg-gray-900 text-white p-6 overflow-y-auto border-r border-gray-800">
            <h1 className="text-2xl font-bold mb-8 text-white">🍔 Bolt Food</h1>
            <nav className="space-y-2">
              <Link
                href="/"
                className="block px-4 py-2 rounded hover:bg-gray-800 transition text-gray-100"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/restaurants"
                className="block px-4 py-2 rounded hover:bg-gray-800 transition text-gray-100"
              >
                🏪 Restaurants
              </Link>
              <Link
                href="/menu"
                className="block px-4 py-2 rounded hover:bg-gray-800 transition text-gray-100"
              >
                🍕 Menu Items
              </Link>
              <Link
                href="/orders"
                className="block px-4 py-2 rounded hover:bg-gray-800 transition text-gray-100"
              >
                📦 Orders
              </Link>
            </nav>
          </aside>

          <div className="flex flex-col w-full md:flex-1">
            {/* Mobile Navigation */}
            <MobileNav />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-950">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
