'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeRestaurants: 0,
    menuItems: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        
        // Fetch restaurants
        const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
        const activeRestaurants = restaurantsSnapshot.docs.filter(doc => doc.data().isOpen).length;
        
        // Fetch menu items
        const menuSnapshot = await getDocs(collection(db, 'menuItems'));
        
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        setStats({
          totalOrders: ordersSnapshot.size,
          activeRestaurants: activeRestaurants,
          menuItems: menuSnapshot.size,
          totalUsers: usersSnapshot.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-8 min-h-full animate-enter">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">Welcome back to your administration panel.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 md:mb-12">
        {/* Stats Card 1 */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20" />
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Total Orders</h3>
            <p className="text-4xl font-bold font-display text-white mb-2">{stats.totalOrders}</p>
            <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 w-fit px-2 py-1 rounded-lg">
              <span>📦</span>
              <span className="text-blue-200/50">All time</span>
            </div>
          </div>
        </div>

        {/* Stats Card 2 */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-green-500/20" />
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Active Restaurants</h3>
            <p className="text-4xl font-bold font-display text-white mb-2">{stats.activeRestaurants}</p>
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 w-fit px-2 py-1 rounded-lg">
              <span>🏪</span>
              <span>Ready to serve</span>
            </div>
          </div>
        </div>

        {/* Stats Card 3 */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20" />
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Menu Items</h3>
            <p className="text-4xl font-bold font-display text-white mb-2">{stats.menuItems}</p>
            <div className="flex items-center gap-2 text-sm text-purple-400 bg-purple-500/10 w-fit px-2 py-1 rounded-lg">
              <span>🍕</span>
              <span>Across all venues</span>
            </div>
          </div>
        </div>

        {/* Stats Card 4 - Users */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/20" />
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Total Users</h3>
            <p className="text-4xl font-bold font-display text-white mb-2">{stats.totalUsers}</p>
            <Link href="/users" className="flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 w-fit px-2 py-1 rounded-lg hover:bg-orange-500/20 transition-colors">
              <span>👥</span>
              <span>View details</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold font-display text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Link
            href="/restaurants"
            className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 group border border-white/5 hover:border-blue-500/30"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏪
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Manage Restaurants</h3>
            <p className="text-sm text-gray-400">View performance and edit details of your restaurant partners.</p>
          </Link>

          <Link
            href="/menu"
            className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 group border border-white/5 hover:border-green-500/30"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🍕
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Manage Menu</h3>
            <p className="text-sm text-gray-400">Update availability, prices, and add new delicious items.</p>
          </Link>

          <Link
            href="/orders"
            className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 group border border-white/5 hover:border-purple-500/30"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📦
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">View Orders</h3>
            <p className="text-sm text-gray-400">Track incoming orders and manage delivery status in real-time.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
