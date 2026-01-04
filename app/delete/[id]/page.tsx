'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { PremiumLoading } from '@/app/components/PremiumLoading';

export default function DeletePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const itemId = params.id as string;
  const itemType = searchParams.get('type') || 'item'; // 'restaurant', 'menuItem', 'order', 'ad'
  const collectionName = searchParams.get('collection') || 'restaurants';

  const [itemName, setItemName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const itemDoc = await getDoc(doc(db, collectionName, itemId));
        if (itemDoc.exists()) {
          setItemName(itemDoc.data().name || `${itemType} #${itemId.slice(0, 8)}`);
        } else {
          alert(`${itemType} not found`);
          router.back();
        }
      } catch (error) {
        console.error('Error loading item:', error);
        alert(`Failed to load ${itemType}`);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId, itemType, collectionName, router]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      if (itemType === 'ad') {
        // Soft delete for ads
        await updateDoc(doc(db, collectionName, itemId), { deleted: true });
      } else {
        // Hard delete for others
        await deleteDoc(doc(db, collectionName, itemId));
      }
      router.back();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Failed to delete ${itemType}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <PremiumLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a1f] flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl border border-white/10 w-full max-w-md p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <span className="text-5xl">🗑️</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Delete {itemType}?</h1>

        <div className="bg-white/5 rounded-xl px-6 py-4 mb-6 border border-white/10">
          <p className="text-white text-lg font-semibold">{itemName}</p>
        </div>

        <p className="text-red-400 mb-8 text-base">
          {itemType === 'ad' ? 'This will hide the ad from users.' : 'This action cannot be undone!'}
        </p>

        <div className="flex gap-3 flex-col-reverse sm:flex-row">
          <button
            onClick={() => router.back()}
            disabled={deleting}
            className="flex-1 px-6 py-3 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                🗑️ Delete {itemType}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
