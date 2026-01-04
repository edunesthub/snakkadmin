'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, useParams } from 'next/navigation';
import { PremiumLoading } from '@/app/components/PremiumLoading';

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
  address?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isOpen: boolean;
  distance: string;
  schools?: string[];
}

interface SchoolOption {
  id: string;
  name: string;
}

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;

  const [formData, setFormData] = useState<Restaurant | null>(null);
  const [schoolsOptions, setSchoolsOptions] = useState<SchoolOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [restaurantDoc, schoolsSnapshot] = await Promise.all([
          getDoc(doc(db, 'restaurants', restaurantId)),
          getDocs(collection(db, 'universities'))
        ]);

        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data() as Restaurant;
          setFormData({
            ...data,
            addressLine1: data.addressLine1 || data.address || '',
            addressLine2: data.addressLine2 || '',
            city: data.city || '',
            state: data.state || '',
            postalCode: data.postalCode || '',
            country: data.country || '',
            schools: data.schools || []
          });
        }

        const schools = schoolsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setSchoolsOptions(schools);
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load restaurant');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId, router]);

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
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const { id: _id, ...updateData } = formData;
      const composedAddress = [updateData.addressLine1, updateData.addressLine2, updateData.city, updateData.state, updateData.postalCode, updateData.country]
        .filter(Boolean)
        .join(', ');
      await updateDoc(restaurantRef, { ...updateData, address: composedAddress });
      alert('Restaurant updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating restaurant:', error);
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
        <p>Restaurant not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a1f] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Edit Restaurant</h1>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location Details</label>
              <div className="space-y-3">
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Address line 1"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                />
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Address line 2 (optional)"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                  />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Postal Code"
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                  />
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Time</label>
                <input
                  type="text"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  placeholder="e.g. 30 min"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Fee ($)</label>
                <input
                  type="number"
                  name="deliveryFee"
                  value={formData.deliveryFee}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/10 cursor-pointer hover:bg-white/5 transition">
                <input
                  type="checkbox"
                  checked={formData.isStudent}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, isStudent: e.target.checked } : null)}
                  className="w-5 h-5 text-blue-600 bg-black/40 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-white font-medium">🎓 Student Restaurant</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Schools</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {schoolsOptions.map((school) => {
                  const selected = formData.schools?.includes(school.id);
                  return (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => prev ? {
                          ...prev,
                          schools: selected
                            ? (prev.schools || []).filter(id => id !== school.id)
                            : [...(prev.schools || []), school.id]
                        } : null);
                      }}
                      className={`px-3 py-2 rounded-lg border text-sm transition ${selected ? 'bg-blue-500/20 border-blue-500/40 text-blue-200' : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'}`}
                    >
                      {school.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/10 cursor-pointer hover:bg-white/5 transition">
                <input
                  type="checkbox"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, isOpen: e.target.checked } : null)}
                  className="w-5 h-5 text-green-600 bg-black/40 border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-white font-medium">🏪 Restaurant is Open</span>
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
