'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, useParams } from 'next/navigation';
import { PremiumLoading } from '@/app/components/PremiumLoading';

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

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [formData, setFormData] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const itemDoc = await getDoc(doc(db, 'menuItems', itemId));
        if (itemDoc.exists()) {
          setFormData(itemDoc.data() as MenuItem);
        } else {
          alert('Menu item not found');
          router.back();
        }
      } catch (error) {
        console.error('Error loading item:', error);
        alert('Failed to load menu item');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    setFormData(prev => prev ? {
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    } : null);
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      setSaving(true);
      const itemRef = doc(db, 'menuItems', itemId);
      const { id: _id, ...updateData } = formData;
      await updateDoc(itemRef, updateData);
      alert('Menu item updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PremiumLoading />;
  }

  if (!formData) {
    return (
      <div className="p-8 text-center text-white">
        <p>Menu item not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a1f] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Edit Menu Item</h1>
            <p className="text-gray-400 mt-2">{formData.name}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
          >
            ← Back
          </button>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl border border-white/10 p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Item Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                placeholder="e.g. Margherita Pizza"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white resize-none"
                placeholder="Describe the item..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Pizza, Pasta"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <label className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/10 cursor-pointer hover:bg-white/5 transition">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, isPopular: e.target.checked } : null)}
                  className="w-5 h-5 text-blue-600 bg-black/40 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-white font-medium">⭐ Popular</span>
              </label>

              <label className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/10 cursor-pointer hover:bg-white/5 transition">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, isVegetarian: e.target.checked } : null)}
                  className="w-5 h-5 text-green-600 bg-black/40 border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-white font-medium">🥗 Vegetarian</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
