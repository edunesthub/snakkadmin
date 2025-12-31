'use client';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  cuisine: string[];
  categories: string[];
  isStudent: boolean;
  description: string;
  address: string;
  isOpen: boolean;
  distance: string;
}

interface Props {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditRestaurantModal({ restaurant, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    ...restaurant,
    isStudent: restaurant.isStudent || false
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const restaurantRef = doc(db, 'restaurants', restaurant.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...updateData } = formData;
      await updateDoc(restaurantRef, updateData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-[#121215] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-white/10 relative">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold font-display text-white">Edit Restaurant</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all resize-none placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Rating</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">⭐</span>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full pl-10 pr-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Delivery Fee ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={formData.deliveryFee}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Delivery Time</label>
                <input
                  type="text"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  placeholder="e.g., 30-45 mins"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Distance</label>
                <input
                  type="text"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/5 cursor-pointer hover:bg-white/10 transition w-full sm:w-auto">
                <input
                  type="checkbox"
                  name="isStudent"
                  checked={formData.isStudent}
                  onChange={(e) => setFormData(prev => ({ ...prev, isStudent: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 bg-black/40 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-white">🎓 Student Restaurant</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/5 cursor-pointer hover:bg-white/10 transition w-full sm:w-auto">
                <input
                  type="checkbox"
                  name="isOpen"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData(prev => ({ ...prev, isOpen: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 bg-black/40 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-white">🏪 Restaurant is Open</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-300 hover:text-white glass-button rounded-xl transition hover:bg-white/10 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 transition active:scale-95 font-medium flex items-center gap-2"
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
  );
}
