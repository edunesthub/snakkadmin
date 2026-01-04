'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PremiumLoading } from '../components/PremiumLoading';
import { EditRestaurantModal } from '../components/EditRestaurantModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  cuisine: string[];
  categories: string[];
  description: string;
  address?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  distance: string;
  isOpen: boolean;
  isStudent: boolean;
  schools?: string[];
}

interface School {
  id: string;
  name: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [deletingRestaurantId, setDeletingRestaurantId] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [studentOnly, setStudentOnly] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [closingAll, setClosingAll] = useState(false);
  const [autoCloseTime, setAutoCloseTime] = useState('');
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(false);
  const [autoCloseInitialized, setAutoCloseInitialized] = useState(false);

  // Load auto-close settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('snakk:autoClose');
    if (saved) {
      try {
        const { enabled, time } = JSON.parse(saved);
        setAutoCloseEnabled(enabled);
        setAutoCloseTime(time);
      } catch (err) {
        console.error('Failed to load auto-close settings:', err);
      }
    }
    setAutoCloseInitialized(true);
  }, []);

  // Save auto-close settings to localStorage whenever they change
  useEffect(() => {
    if (!autoCloseInitialized) return;
    localStorage.setItem('snakk:autoClose', JSON.stringify({ enabled: autoCloseEnabled, time: autoCloseTime }));
  }, [autoCloseEnabled, autoCloseTime, autoCloseInitialized]);

  useEffect(() => {
    fetchRestaurants();
    fetchSchools();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'restaurants'));
      const data = querySnapshot.docs.map((doc) => {
        const r = doc.data() as Partial<Restaurant>;
        return {
          id: doc.id,
          name: r.name || '',
          image: r.image || '/placeholder.png',
          rating: r.rating || 0,
          deliveryTime: r.deliveryTime || '',
          deliveryFee: r.deliveryFee || 0,
          cuisine: r.cuisine || [],
          categories: r.categories || [],
          description: r.description || '',
          address: r.address || r.addressLine1 || '',
          addressLine1: r.addressLine1 || r.address || '',
          addressLine2: r.addressLine2 || '',
          city: r.city || '',
          state: r.state || '',
          postalCode: r.postalCode || '',
          country: r.country || '',
          isOpen: r.isOpen ?? true,
          distance: r.distance || '',
          isStudent: r.isStudent ?? false,
          schools: r.schools || [],
        } satisfies Restaurant;
      });
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'universities'));
      const data = snapshot.docs.map(doc => {
        const docData = doc.data() as { name?: string };
        return { id: doc.id, name: docData.name || 'Untitled' };
      });
      setSchools(data);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const toggleRestaurantStatus = async (id: string, currentStatus: boolean) => {
    try {
      const restaurantRef = doc(db, 'restaurants', id);
      await updateDoc(restaurantRef, { isOpen: !currentStatus });
      fetchRestaurants();
    } catch (error) {
      console.error('Error updating restaurant:', error);
    }
  };

  const closeAllRestaurants = async () => {
    try {
      setClosingAll(true);
      const updatePromises = restaurants.map(rest => {
        if (rest.isOpen) {
          return updateDoc(doc(db, 'restaurants', rest.id), { isOpen: false });
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
      await fetchRestaurants();
    } catch (error) {
      console.error('Error closing all restaurants:', error);
      alert('Failed to close all restaurants');
    } finally {
      setClosingAll(false);
    }
  };

  useEffect(() => {
    if (!autoCloseEnabled || !autoCloseTime) return;

    const checkAndClose = () => {
      const now = new Date();
      const [hours, minutes] = autoCloseTime.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);

      if (now.getHours() === hours && now.getMinutes() === minutes) {
        void closeAllRestaurants();
      }
    };

    const interval = setInterval(checkAndClose, 60000); // Check every minute
    checkAndClose(); // Check immediately on mount

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCloseEnabled, autoCloseTime]);

  if (loading) {
    return <PremiumLoading />;
  }

  const filteredRestaurants = restaurants.filter((r) => {
    const locationText = [r.city, r.state, r.country, r.addressLine1].filter(Boolean).join(' ').toLowerCase();
    const matchesLocation = locationQuery ? locationText.includes(locationQuery.toLowerCase()) : true;
    const matchesStudent = studentOnly ? r.isStudent === true : true;
    const matchesSchool = selectedSchoolId ? (r.schools || []).includes(selectedSchoolId) : true;
    return matchesLocation && matchesStudent && matchesSchool;
  });

  return (
    <div className="p-4 md:p-8 min-h-full animate-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Restaurants</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your restaurant partners and their status.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={closeAllRestaurants}
            disabled={closingAll}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 font-medium flex items-center justify-center gap-2"
          >
            {closingAll ? 'Closing...' : '🔒 Close All Shops'}
          </button>
          <button
            onClick={() => alert('Add restaurant feature coming soon')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 font-medium flex items-center justify-center gap-2"
          >
            <span>＋</span> Add Restaurant
          </button>
        </div>
      </div>

      {/* Auto-Close Settings */}
      <div className="glass-card rounded-2xl p-4 mb-6 border border-white/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCloseEnabled}
              onChange={(e) => setAutoCloseEnabled(e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-black/40 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-white">🕐 Auto-close all shops at</span>
          </label>
          <input
            type="time"
            value={autoCloseTime}
            onChange={(e) => setAutoCloseTime(e.target.value)}
            disabled={!autoCloseEnabled}
            className="px-4 py-2 bg-[#0a0a0f] border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {autoCloseEnabled && autoCloseTime && (
            <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              ✓ Active
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Filter by location</label>
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="City, state, country, or address"
            className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-600"
          />
        </div>
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Filter by school</label>
          <select
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
          >
            <option value="">All schools</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-white bg-white/5 border border-white/10 px-3 py-2 rounded-xl cursor-pointer select-none">
          <input
            type="checkbox"
            checked={studentOnly}
            onChange={(e) => setStudentOnly(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-black/40 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>🎓 Student only</span>
        </label>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Restaurant</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Delivery Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Fee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Schools</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRestaurants.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 shrink-0">
                      <Image
                        src={restaurant.image}
                        alt={restaurant.name}
                        fill
                        className="rounded-lg object-cover ring-2 ring-white/10"
                        unoptimized
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{restaurant.name}</div>
                      <div className="text-xs text-gray-400">{restaurant.categories.join(', ')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-yellow-400 flex items-center gap-1">
                    <span>⭐</span> {restaurant.rating}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 bg-white/5 px-2 py-1 rounded-md inline-block">
                    {restaurant.deliveryTime}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">${restaurant.deliveryFee}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap max-w-[180px]">
                  <div className="text-sm text-white truncate">{restaurant.city || restaurant.addressLine1 || 'Not set'}</div>
                  <div className="text-xs text-gray-500 truncate">{[restaurant.state, restaurant.country].filter(Boolean).join(', ')}</div>
                  {restaurant.isStudent && (
                    <div className="text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/20 inline-flex px-2 py-0.5 rounded-full mt-1">🎓 Student</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap max-w-[220px]">
                  {restaurant.schools && restaurant.schools.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {restaurant.schools.map((schoolId) => {
                        const school = schools.find((s) => s.id === schoolId);
                        return (
                          <span key={schoolId} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 truncate max-w-[120px]">
                            {school?.name || 'Unknown'}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">All schools</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.isOpen)}
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-all ${restaurant.isOpen
                      ? 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 my-auto ${restaurant.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingRestaurant(restaurant)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingRestaurantId(restaurant.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="glass-card rounded-2xl p-4">
            <div className="flex gap-4 mb-4">
              <div className="relative h-20 w-20 shrink-0">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="rounded-xl object-cover ring-2 ring-white/10"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-white mb-1 truncate">{restaurant.name}</h3>
                <p className="text-sm text-gray-400 mb-2 truncate">{restaurant.categories.join(', ')}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-yellow-400 font-medium">
                    ⭐ {restaurant.rating}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300">{restaurant.deliveryTime}</span>
                </div>
                <div className="mt-1 text-xs text-gray-400 truncate">
                  {restaurant.city || restaurant.addressLine1 || 'Location not set'}
                  {restaurant.country ? `, ${restaurant.country}` : ''}
                </div>
                {restaurant.isStudent && (
                  <div className="mt-1 text-[11px] inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full">
                    🎓 Student
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fee</span>
                <span className="text-white font-medium">${restaurant.deliveryFee}</span>
              </div>
              <button
                onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.isOpen)}
                className={`rounded-xl p-3 flex flex-col items-center justify-center border transition-colors ${restaurant.isOpen
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
              >
                <span className="text-xs uppercase tracking-wider mb-1">Status</span>
                <span className="font-medium">{restaurant.isOpen ? 'Open' : 'Closed'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.schools && restaurant.schools.length > 0 ? (
                restaurant.schools.map((schoolId) => {
                  const school = schools.find((s) => s.id === schoolId);
                  return (
                    <span key={schoolId} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200">
                      {school?.name || 'Unknown school'}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-gray-500">All schools</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingRestaurant(restaurant)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 px-4 rounded-xl font-medium transition-colors border border-white/10"
              >
                Edit
              </button>
              <button
                onClick={() => setDeletingRestaurantId(restaurant.id)}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 px-4 rounded-xl font-medium transition-colors border border-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingRestaurant && (
        <EditRestaurantModal
          restaurant={editingRestaurant}
          isOpen={!!editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onSave={fetchRestaurants}
          schoolsOptions={schools}
        />
      )}

      {/* Delete Modal */}
      {deletingRestaurantId && (
        <DeleteConfirmModal
          itemId={deletingRestaurantId}
          itemName={restaurants.find(r => r.id === deletingRestaurantId)?.name || ''}
          itemType="restaurant"
          isOpen={!!deletingRestaurantId}
          onClose={() => setDeletingRestaurantId(null)}
          onDelete={fetchRestaurants}
        />
      )}
    </div>
  );
}
