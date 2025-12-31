'use client';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

interface Props {
  orderId: string;
  currentStatus: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500', emoji: '⏳' },
    { value: 'preparing', label: 'Preparing', color: 'bg-orange-500', emoji: '👨‍🍳' },
  { value: 'ready', label: 'Picked Up', color: 'bg-blue-500', emoji: '🛍️' },
  { value: 'on-the-way', label: 'On the Way', color: 'bg-purple-500', emoji: '🚴' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500', emoji: '📦' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', emoji: '❌' },
];

export function UpdateOrderStatusModal({ orderId, currentStatus, isOpen, onClose, onUpdate }: Props) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 animate-fade-in" role="dialog" aria-modal="true">
      {/* Mobile Full Screen */}
      <div className="md:hidden h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display text-white">Update Order</h1>
                <p className="text-sm text-gray-400 mt-1">Order #{orderId.slice(0, 8)}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Select New Status</h2>
              <div className="grid grid-cols-2 gap-3">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setNewStatus(status.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      newStatus === status.value
                        ? 'border-white/50 bg-white/10 scale-105'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full ${status.color} flex items-center justify-center text-white text-xl mb-2`}>
                        {status.emoji}
                      </div>
                      <span className="text-white font-medium text-sm">{status.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating || newStatus === currentStatus}
                className="flex-1 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Modal */}
      <div className="hidden md:flex items-center justify-center p-4 min-h-screen">
        <div className="bg-[#121215] rounded-2xl shadow-2xl max-w-md w-full border border-white/10 animate-scale-in">
          <div className="p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold font-display text-white">Update Status</h2>
            <p className="text-sm text-gray-400 mt-1">Order #{orderId.slice(0, 8)}</p>
          </div>

          <div className="p-6">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">New Status</label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setNewStatus(status.value)}
                  className={`p-3 rounded-xl border transition-all ${
                    newStatus === status.value
                      ? 'border-white/50 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${status.color} flex items-center justify-center text-white`}>
                      {status.emoji}
                    </div>
                    <span className="text-white font-medium">{status.label}</span>
                  </div>
                </button>
              ))}
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
    </div>
  );
}
