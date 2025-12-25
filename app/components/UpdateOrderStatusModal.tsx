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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="glass-card rounded-2xl shadow-2xl max-w-sm w-full border border-white/10 animate-scale-in">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold font-display text-white">Update Status</h2>
          <p className="text-sm text-gray-400 mt-1">Order #{orderId.slice(0, 8)}</p>
        </div>

        <div className="p-6">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">New Status</label>
          <div className="relative">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all appearance-none cursor-pointer"
            >
              {statusOptions.map(status => (
                <option key={status} value={status} className="bg-gray-900">
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={updating}
            className="px-6 py-2.5 text-gray-300 hover:text-white glass-button rounded-xl transition hover:bg-white/10 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating || newStatus === currentStatus}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:bg-gray-700 disabled:shadow-none transition active:scale-95 font-medium flex items-center gap-2"
          >
            {updating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
