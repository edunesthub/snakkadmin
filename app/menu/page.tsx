'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { EditMenuItemModal } from '../components/EditMenuItemModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular: boolean;
  isVegetarian: boolean;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'menuItems'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg md:text-xl">Loading menu items...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Menu Items</h1>
        <button onClick={() => alert('Add item feature coming soon')} className="w-full sm:w-auto bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition">
          + Add Item
        </button>
      </div>

      <div className="mb-4 md:mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-auto px-3 md:px-4 py-2 border border-gray-700 rounded-lg text-sm md:text-base bg-gray-900 text-gray-100"
        >
          <option value="all">All Categories</option>
          <option value="Pizza">Pizza</option>
          <option value="Burgers">Burgers</option>
          <option value="Sushi">Sushi</option>
          <option value="Healthy">Healthy</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border border-gray-800">
            <img src={item.image} alt={item.name} className="w-full h-32 sm:h-40 md:h-48 object-cover" />
            <div className="p-3 md:p-4">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="text-sm md:text-lg font-semibold flex-1 text-gray-100">{item.name}</h3>
                <span className="text-base md:text-lg font-bold text-blue-400 whitespace-nowrap">${item.price}</span>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex gap-2 flex-wrap mb-3">
                <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                  {item.category}
                </span>
                {item.isPopular && (
                  <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded-full">
                    ⭐ Popular
                  </span>
                )}
                {item.isVegetarian && (
                  <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                    🌱 Vegetarian
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingItem(item)}
                  className="flex-1 bg-blue-900 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-800 active:bg-blue-700 text-xs md:text-sm font-semibold transition"
                >
                  Edit
                </button>
                <button 
                  onClick={() => setDeletingItemId(item.id)}
                  className="flex-1 bg-red-900 text-red-300 px-3 py-2 rounded-lg hover:bg-red-800 active:bg-red-700 text-xs md:text-sm font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditMenuItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={fetchMenuItems}
        />
      )}

      {/* Delete Modal */}
      {deletingItemId && (
        <DeleteConfirmModal
          itemId={deletingItemId}
          itemName={menuItems.find(i => i.id === deletingItemId)?.name || ''}
          itemType="menuItem"
          isOpen={!!deletingItemId}
          onClose={() => setDeletingItemId(null)}
          onDelete={fetchMenuItems}
        />
      )}
    </div>
  );
}
