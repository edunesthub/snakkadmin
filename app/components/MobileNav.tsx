'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/restaurants', label: 'Restaurants', icon: '🏪' },
    { href: '/schools', label: 'Schools', icon: '🎓' },
    { href: '/menu', label: 'Menu Items', icon: '🍕' },
    { href: '/orders', label: 'Orders', icon: '📦' },
    { href: '/ads', label: 'Ads', icon: '📢' },
    { href: '/users', label: 'Users', icon: '👥' },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between glass-panel px-4 py-3 sticky top-0 z-50">
        <Link href='/'>
          <h1 className="text-xl font-bold font-display bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Snakk
          </h1>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 glass-button rounded-lg text-gray-200 active:scale-95 transition-transform"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Sidebar */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-[280px] bg-[#0a0a0f] z-50 transform transition-transform duration-300 ease-out border-l border-white/10 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 glass-button rounded-full text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium text-lg">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-white/10 mt-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shadow-lg">
                AD
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@bolt.food</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
