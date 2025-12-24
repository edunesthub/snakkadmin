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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-[#121215] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-scale-in border border-white/10 relative">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold font-display text-white mb-2">Delete Item?</h2>
          <p className="text-gray-400">
            Are you sure you want to delete <span className="text-white font-medium">&quot;{itemName}&quot;</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 justify-center p-6 border-t border-white/10">
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
  );
}
