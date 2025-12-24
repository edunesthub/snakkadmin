'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PremiumLoading } from '../components/PremiumLoading';
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
    return <PremiumLoading />;
  }

  return (
    <>
      <div className="p-4 md:p-8 min-h-full animate-enter">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Menu Items</h1>
            <p className="text-gray-400 text-sm mt-1">Curate your menu and manage availability.</p>
          </div>
          <button
            onClick={() => alert('Add item feature coming soon')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 font-medium flex items-center justify-center gap-2"
          >
            <span>＋</span> Add Item
          </button>
        </div>

        <div className="mb-8">
          <div className="relative w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value="all" className="bg-gray-900">All Categories</option>
              <option value="Pizza" className="bg-gray-900">Pizza</option>
              <option value="Burgers" className="bg-gray-900">Burgers</option>
              <option value="Sushi" className="bg-gray-900">Sushi</option>
              <option value="Healthy" className="bg-gray-900">Healthy</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl overflow-hidden group hover:bg-white/5 transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-medium text-white border border-white/20">
                    {item.category}
                  </span>
                  <span className="text-xl font-bold text-white drop-shadow-lg">${item.price}</span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{item.name}</h3>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5em]">{item.description}</p>

                <div className="flex gap-2 flex-wrap mb-4">
                  {item.isPopular && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-lg border border-yellow-500/20 flex items-center gap-1">
                      ⭐ Popular
                    </span>
                  )}
                  {item.isVegetarian && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg border border-green-500/20 flex items-center gap-1">
                      🌱 Vegetarian
                    </span>
                  )}
                </div>

                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-blue-300 py-2 rounded-xl text-sm font-semibold transition-colors border border-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingItemId(item.id)}
                    className="flex-1 bg-white/5 hover:bg-red-500/20 text-red-300 py-2 rounded-xl text-sm font-semibold transition-colors border border-white/10 hover:border-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
    </>
  );
}
