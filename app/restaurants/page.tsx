'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg md:text-xl">Loading restaurants...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Restaurants</h1>
        <button
          onClick={() => alert('Add restaurant feature coming soon')}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition"
        >
          + Add Restaurant
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Restaurant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-gray-800 border-b border-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-100">{restaurant.name}</div>
                      <div className="text-sm text-gray-400">{restaurant.categories.join(', ')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-100">⭐ {restaurant.rating}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-100">{restaurant.deliveryTime}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-100">${restaurant.deliveryFee}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.isOpen)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      restaurant.isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => setEditingRestaurant(restaurant)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setDeletingRestaurantId(restaurant.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-gray-900 rounded-lg shadow p-4 border border-gray-800">
            <div className="flex gap-4 mb-3">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-100">{restaurant.name}</h3>
                <p className="text-sm text-gray-400">{restaurant.categories.join(', ')}</p>
                <p className="text-xs text-gray-500 mt-1">{restaurant.address}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <div className="text-center">
                <p className="text-gray-400">Rating</p>
                <p className="font-semibold text-gray-100">⭐ {restaurant.rating}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">Time</p>
                <p className="font-semibold text-gray-100">{restaurant.deliveryTime}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">Fee</p>
                <p className="font-semibold text-gray-100">${restaurant.deliveryFee}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.isOpen)}
                className={`flex-1 py-2 px-3 rounded text-xs font-semibold ${
                  restaurant.isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </button>
              <button 
                onClick={() => setEditingRestaurant(restaurant)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded text-xs font-semibold hover:bg-blue-100"
              >
                Edit
              </button>
              <button 
                onClick={() => setDeletingRestaurantId(restaurant.id)}
                className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded text-xs font-semibold hover:bg-red-100"
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
