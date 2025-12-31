'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PremiumLoading } from '../components/PremiumLoading';
import { EditAdModal } from '../components/EditAdModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { getAds, updateAd, Ad } from '@/services/firebase';

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [creatingAd, setCreatingAd] = useState(false);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const data = await getAds();
      setAds(data);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateAd(id, { active: !currentStatus });
      fetchAds();
    } catch (error) {
      console.error('Error updating ad:', error);
    }
  };

  if (loading) {
    return <PremiumLoading />;
  }

  return (
    <div className="p-4 md:p-8 min-h-full animate-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Ads Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your app advertisements and their status.</p>
        </div>
        <button
          onClick={() => setCreatingAd(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 font-medium flex items-center justify-center gap-2"
        >
          <span>＋</span> Add Ad
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Ad</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Image</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Link</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ads.map((ad) => (
              <tr key={ad.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-white">{ad.title}</div>
                    <div className="text-xs text-gray-400">{ad.subtitle}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative h-10 w-16 shrink-0">
                    <Image
                      src={ad.image}
                      alt={ad.title}
                      fill
                      className="rounded-lg object-cover ring-2 ring-white/10"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 truncate max-w-xs">{ad.link}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleAdStatus(ad.id!, ad.active)}
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-all ${ad.active
                      ? 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 my-auto ${ad.active ? 'bg-green-400' : 'bg-red-400'}`} />
                    {ad.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingAd(ad)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingAdId(ad.id!)}
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
        {ads.map((ad) => (
          <div key={ad.id} className="glass-card rounded-2xl p-4">
            <div className="flex gap-4 mb-4">
              <div className="relative h-20 w-20 shrink-0">
                <Image
                  src={ad.image}
                  alt={ad.title}
                  fill
                  className="rounded-xl object-cover ring-2 ring-white/10"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-white mb-1 truncate">{ad.title}</h3>
                <p className="text-sm text-gray-400 mb-2 truncate">{ad.subtitle}</p>
                <div className="text-xs text-gray-300 truncate mb-2">{ad.link}</div>
              </div>
            </div>

            <div className="mb-4">
              <button
                onClick={() => toggleAdStatus(ad.id!, ad.active)}
                className={`w-full rounded-xl p-3 flex flex-col items-center justify-center border transition-colors ${ad.active
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
              >
                <span className="text-xs uppercase tracking-wider mb-1">Status</span>
                <span className="font-medium">{ad.active ? 'Active' : 'Inactive'}</span>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingAd(ad)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 px-4 rounded-xl font-medium transition-colors border border-white/10"
              >
                Edit
              </button>
              <button
                onClick={() => setDeletingAdId(ad.id!)}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 px-4 rounded-xl font-medium transition-colors border border-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingAd && (
        <EditAdModal
          ad={editingAd}
          isOpen={!!editingAd}
          onClose={() => setEditingAd(null)}
          onSave={fetchAds}
        />
      )}

      {/* Create Modal */}
      {creatingAd && (
        <EditAdModal
          ad={null}
          isOpen={creatingAd}
          onClose={() => setCreatingAd(false)}
          onSave={fetchAds}
        />
      )}

      {/* Delete Modal */}
      {deletingAdId && (
        <DeleteConfirmModal
          itemId={deletingAdId}
          itemName={ads.find(a => a.id === deletingAdId)?.title || ''}
          itemType="ad"
          isOpen={!!deletingAdId}
          onClose={() => setDeletingAdId(null)}
          onDelete={fetchAds}
        />
      )}
    </div>
  );
}