'use client';

import Link from 'next/link';

export default function DashboardHome() {
  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white">🍔 Bolt Food Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gray-900 rounded-lg shadow p-4 md:p-6 border border-gray-800">
          <h3 className="text-base md:text-lg font-semibold mb-2 text-gray-100">Total Orders</h3>
          <p className="text-2xl md:text-3xl font-bold text-blue-400">0</p>
          <p className="text-xs md:text-sm text-gray-400 mt-2">No orders yet</p>
        </div>
        <div className="bg-gray-900 rounded-lg shadow p-4 md:p-6 border border-gray-800">
          <h3 className="text-base md:text-lg font-semibold mb-2 text-gray-100">Active Restaurants</h3>
          <p className="text-2xl md:text-3xl font-bold text-green-400">6</p>
          <p className="text-xs md:text-sm text-gray-400 mt-2">Ready to serve</p>
        </div>
        <div className="bg-gray-900 rounded-lg shadow p-4 md:p-6 border border-gray-800">
          <h3 className="text-base md:text-lg font-semibold mb-2 text-gray-100">Menu Items</h3>
          <p className="text-2xl md:text-3xl font-bold text-purple-400">10</p>
          <p className="text-xs md:text-sm text-gray-400 mt-2">Across all restaurants</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow p-4 md:p-6 border border-gray-800">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Link 
            href="/restaurants" 
            className="p-4 border-2 border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition active:bg-gray-700 bg-gray-800"
          >
            <div className="text-3xl md:text-4xl mb-2">🏪</div>
            <h3 className="font-semibold text-sm md:text-base mb-1 text-gray-100">Manage Restaurants</h3>
            <p className="text-xs md:text-sm text-gray-400">View and edit restaurant details</p>
          </Link>
          <Link 
            href="/menu" 
            className="p-4 border-2 border-gray-700 rounded-lg hover:border-green-500 hover:bg-gray-800 transition active:bg-gray-700 bg-gray-800"
          >
            <div className="text-3xl md:text-4xl mb-2">🍕</div>
            <h3 className="font-semibold text-sm md:text-base mb-1 text-gray-100">Manage Menu</h3>
            <p className="text-xs md:text-sm text-gray-400">Add, edit, or remove menu items</p>
          </Link>
          <Link 
            href="/orders" 
            className="p-4 border-2 border-gray-700 rounded-lg hover:border-purple-500 hover:bg-gray-800 transition active:bg-gray-700 bg-gray-800"
          >
            <div className="text-3xl md:text-4xl mb-2">📦</div>
            <h3 className="font-semibold text-sm md:text-base mb-1 text-gray-100">View Orders</h3>
            <p className="text-xs md:text-sm text-gray-400">Monitor and manage all orders</p>
          </Link>
        </div>
      </div>

      <div className="mt-6 md:mt-8 bg-blue-900 border border-blue-700 rounded-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-2 text-blue-100">🚀 Getting Started</h3>
        <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm text-blue-200">
          <li>Set up your Firebase credentials in <code className="bg-gray-900 px-2 py-1 rounded text-xs md:text-sm break-all text-blue-300">.env.local</code></li>
          <li>Run the seed script to populate initial data: <code className="bg-gray-900 px-2 py-1 rounded text-xs md:text-sm break-all text-blue-300">npm run seed-data</code> (in the main app)</li>
          <li>Start managing restaurants, menus, and orders from this dashboard</li>
        </ol>
      </div>
    </div>
  );
}
