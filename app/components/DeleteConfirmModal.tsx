'use client';

import { db } from '@/lib/firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

interface Props {
  itemId: string;
  itemName: string;
  itemType: 'restaurant' | 'menuItem' | 'order' | 'ad' | 'user';
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteConfirmModal({ itemId, itemName, itemType, isOpen, onClose, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      if (itemType === 'ad') {
        // Soft delete for ads
        const itemRef = doc(db, 'ads', itemId);
        await updateDoc(itemRef, { deleted: true });
      } else {
        // Hard delete for others
        let collection: string;
        if (itemType === 'restaurant') {
          collection = 'restaurants';
        } else if (itemType === 'menuItem') {
          collection = 'menuItems';
        } else if (itemType === 'user') {
          collection = 'users';
        } else {
          collection = 'orders';
        }
        const itemRef = doc(db, collection, itemId);
        await deleteDoc(itemRef);
      }
      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 animate-fade-in" role="dialog" aria-modal="true">
      {/* Mobile Modal - AT THE TOP */}
      <div className="md:hidden w-full bg-black rounded-b-3xl shadow-2xl border-b border-white/10">
        {/* Close button */}
        <div className="flex justify-end p-6">
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center px-6 pb-12">
          {/* MASSIVE TRASH ICON */}
          <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mb-8 border-4 border-red-500/40">
            <span className="text-6xl">🗑️</span>
          </div>

          {/* BIG TITLE */}
          <h1 className="text-4xl font-bold text-white text-center mb-6 uppercase">
            Delete {itemType}?
          </h1>

          {/* ITEM NAME BOX */}
          <div className="bg-white/10 rounded-2xl px-6 py-4 mb-6 max-w-sm border border-white/20">
            <p className="text-2xl text-white text-center font-semibold">
              &quot;{itemName}&quot;
            </p>
          </div>

          {/* WARNING */}
          <p className="text-xl text-red-400 text-center mb-8 max-w-sm font-medium">
            {itemType === 'ad' ? 'This will hide the ad from users.' : 'CANNOT BE UNDONE!'}
          </p>

          {/* HUGE BUTTONS */}
          <div className="w-full max-w-sm space-y-6">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-6 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white rounded-2xl font-bold text-2xl transition-all flex items-center justify-center gap-4 shadow-2xl"
            >
              {deleting ? (
                <>
                  <div className="w-8 h-8 border-4 border-white/40 border-t-white rounded-full animate-spin" />
                  DELETING...
                </>
              ) : (
                <>
                  🗑️ YES, DELETE
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={deleting}
              className="w-full py-6 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-2xl transition-all"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Modal - keep simple */}
      <div className="hidden md:flex items-center justify-center p-4 min-h-screen">
        <div className="bg-[#121215] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scale-in border border-white/10">
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <span className="text-4xl">🗑️</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete {itemType}?</h2>
            <p className="text-gray-400 mb-4">
              <span className="text-white font-semibold">&quot;{itemName}&quot;</span>
            </p>
            <p className="text-red-400 text-sm">
              {itemType === 'ad' ? 'This will hide the ad from users.' : 'This action cannot be undone.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center p-6 border-t border-white/10">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-6 py-3 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  🗑️ Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
