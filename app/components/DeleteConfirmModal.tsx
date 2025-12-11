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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-lg max-w-sm w-full border border-gray-800">
        <div className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-2">Delete {displayType}?</h2>
          <p className="text-gray-400 text-sm md:text-base mb-4">
            Are you sure you want to delete <strong className="text-gray-200">{itemName}</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="bg-gray-800 border-t border-gray-700 p-4 md:p-6 flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
