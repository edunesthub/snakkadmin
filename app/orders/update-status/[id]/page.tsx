'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, useParams } from 'next/navigation';
import { PremiumLoading } from '@/app/components/PremiumLoading';

interface OrderStatus {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

const statusOptions: OrderStatus[] = [
  { value: 'pending', label: 'Pending', emoji: '⏳', color: 'bg-yellow-600' },
  { value: 'confirmed', label: 'Confirmed', emoji: '✅', color: 'bg-blue-600' },
  { value: 'preparing', label: 'Preparing', emoji: '👨‍🍳', color: 'bg-orange-600' },
  { value: 'ready', label: 'Ready', emoji: '📦', color: 'bg-green-600' },
  { value: 'out_for_delivery', label: 'Out for Delivery', emoji: '🚚', color: 'bg-purple-600' },
  { value: 'delivered', label: 'Delivered', emoji: '🎉', color: 'bg-green-700' },
  { value: 'cancelled', label: 'Cancelled', emoji: '❌', color: 'bg-red-600' },
];

export default function UpdateOrderStatusPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [currentStatus, setCurrentStatus] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          const status = orderDoc.data().status || 'pending';
          setCurrentStatus(status);
          setNewStatus(status);
        } else {
          alert('Order not found');
          router.back();
        }
      } catch (error) {
        console.error('Error loading order:', error);
        alert('Failed to load order');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, router]);

  const handleUpdate = async () => {
    if (newStatus === currentStatus) {
      alert('Please select a different status');
      return;
    }

    try {
      setUpdating(true);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      router.back();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <PremiumLoading />;
  }

  const currentStatusLabel = statusOptions.find(s => s.value === currentStatus)?.label || 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a1f] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all mb-6"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Update Order Status</h1>
            <p className="text-gray-400 mt-2">Order #{orderId.slice(0, 8)}</p>
            <p className="text-gray-500 mt-1">Current Status: <span className="text-white font-semibold">{currentStatusLabel}</span></p>
          </div>
        </div>

        {/* Status Grid */}
        <div className="glass-card rounded-2xl border border-white/10 p-6 md:p-8 mb-6">
          <h2 className="text-lg font-semibold text-white mb-6">Select New Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-12 h-12 rounded-full ${status.color} flex items-center justify-center text-white text-xl`}>
                    {status.emoji}
                  </div>
                  <span className="text-white font-medium text-sm">{status.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 flex-col-reverse sm:flex-row">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating || newStatus === currentStatus}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:bg-gray-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
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
