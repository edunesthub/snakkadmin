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
  address: string;
  isOpen: boolean;
  distance: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [deletingRestaurantId, setDeletingRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'restaurants'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <PremiumLoading />;
  }

  return (
    <div className="p-4 md:p-8 min-h-full animate-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Restaurants</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your restaurant partners and their status.</p>
        </div>
        <button
          onClick={() => alert('Add restaurant feature coming soon')}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 font-medium flex items-center justify-center gap-2"
        >
          <span>＋</span> Add Restaurant
        </button>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {restaurants.map((restaurant) => (
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
        {restaurants.map((restaurant) => (
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
