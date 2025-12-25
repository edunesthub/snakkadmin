import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { MobileNav } from "./components/MobileNav";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </head>
      <body className="bg-background text-foreground antialiased font-sans selection:bg-primary selection:text-white overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
        </div>

        <div className="h-screen flex flex-col md:flex-row overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 glass-card border-r border-white/5 z-20">
            <div className="p-6">
              <h1 className="text-2xl font-bold font-display bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Bolt Food
              </h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Admin</p>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98] group text-gray-300 hover:text-white"
              >
                <span className="text-xl group-hover:animate-bounce-subtle">📊</span>
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/restaurants"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98] group text-gray-300 hover:text-white"
              >
                <span className="text-xl group-hover:animate-bounce-subtle">🏪</span>
                <span className="font-medium">Restaurants</span>
              </Link>
              <Link
                href="/menu"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98] group text-gray-300 hover:text-white"
              >
                <span className="text-xl group-hover:animate-bounce-subtle">🍕</span>
                <span className="font-medium">Menu Items</span>
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98] group text-gray-300 hover:text-white"
              >
                <span className="text-xl group-hover:animate-bounce-subtle">📦</span>
                <span className="font-medium">Orders</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                  AD
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">Admin User</p>
                  <p className="text-xs text-gray-400 truncate">admin@bolt.food</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex flex-col w-full md:flex-1 h-full relative z-10">
            {/* Mobile Navigation */}
            <MobileNav />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 custom-scrollbar scroll-smooth">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
