'use client';

import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useState } from 'react';

interface Props {
  itemId: string;
  itemName: string;
  itemType: 'restaurant' | 'menuItem' | 'order';
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteConfirmModal({ itemId, itemName, itemType, isOpen, onClose, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      let collection: string;
      if (itemType === 'restaurant') {
        collection = 'restaurants';
      } else if (itemType === 'menuItem') {
        collection = 'menuItems';
      } else {
        collection = 'orders';
      }
      const itemRef = doc(db, collection, itemId);
      await deleteDoc(itemRef);
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

  const displayType = itemType === 'restaurant' ? 'Restaurant' : itemType === 'menuItem' ? 'Menu Item' : 'Order';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="glass-card rounded-2xl shadow-2xl max-w-md w-full border border-white/10 animate-scale-in">
        <div className="p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <h2 className="text-xl md:text-2xl font-bold font-display text-white mb-2">Delete {displayType}?</h2>
          <p className="text-gray-400 text-sm md:text-base mb-8">
            Are you sure you want to delete <strong className="text-white">{itemName}</strong>? This action cannot be undone.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-6 py-2.5 text-gray-300 hover:text-white glass-button rounded-xl transition hover:bg-white/5 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/20 disabled:opacity-50 transition active:scale-95 font-medium flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
