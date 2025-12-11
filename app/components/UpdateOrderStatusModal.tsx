'use client';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';

interface Props {
  orderId: string;
  currentStatus: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions = ['pending', 'confirmed', 'preparing', 'on-the-way', 'delivered', 'cancelled'];

export function UpdateOrderStatusModal({ orderId, currentStatus, isOpen, onClose, onUpdate }: Props) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-lg max-w-sm w-full border border-gray-800">
        <div className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">Update Order Status</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-800 border-t border-gray-700 p-4 md:p-6 flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={updating}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating || newStatus === currentStatus}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-500 transition"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
