'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { PremiumLoading } from '@/app/components/PremiumLoading';
import { db } from '@/lib/firebase';

interface OrderItemExtra {
  name: string;
  price: number;
  quantity?: number;
}

interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  price: number;
  selectedType?: string;
  quantity: number;
  extras: OrderItemExtra[];
}

interface UserInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface Courier {
  name?: string;
  phone?: string;
}

interface Order {
  id: string;
  userId: string;
  userInfo: UserInfo;
  restaurantId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  deliveryLocationHostelId?: string | null;
  deliveryLocationUniversityId?: string | null;
  deliveryLocationLabel?: string | null;
  paymentMethod: string;
  deliveryNotes?: string;
  promoCode?: string | null;
  createdAt: Timestamp;
  estimatedDelivery?: Date | Timestamp;
  courier?: Courier;
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  preparing: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
  out_for_delivery: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/20',
};

const statusEmojis: { [key: string]: string } = {
  pending: '⏳',
  confirmed: '✅',
  preparing: '👨‍🍳',
  out_for_delivery: '🚚',
  delivered: '🎉',
  cancelled: '❌',
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
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

  if (loading) {
    return <PremiumLoading />;
  }

  if (!order) {
    return null;
  }

  const statusColor = statusColors[order.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/20';
  const statusEmoji = statusEmojis[order.status] || '❓';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#0f1a12] p-4 md:p-8 print:bg-[#0a0a0f]" id="print-root">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="no-print flex justify-between items-center mb-6">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
            >
              ← Back
            </button>
            <div className="text-sm text-gray-400">Generated from Admin Portal</div>
          </div>

          <div className="glass-card rounded-2xl border border-white/10 p-6 md:p-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-emerald-600/30 to-emerald-400/10">
            <div>
              <p className="text-emerald-300 text-xs uppercase tracking-[0.2em]">Invoice</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Order #{orderId.slice(0, 8)}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full border font-semibold inline-flex items-center gap-2 ${statusColor}`}>
                  {statusEmoji} {order.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 p-6 md:p-8 mb-8 shadow-lg shadow-emerald-900/20">
          {/* Invoice meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-white/10">
            <div>
              <p className="text-emerald-300 text-xs uppercase tracking-[0.2em]">Invoice</p>
              <p className="text-white font-semibold text-lg">Order #{orderId.slice(0, 8)}</p>
              <p className="text-gray-400 text-sm">
                {order.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Payment</p>
              <p className="text-white font-medium">{order.paymentMethod || 'N/A'}</p>
              {order.promoCode && <p className="text-emerald-300 text-sm mt-1">Promo: {order.promoCode}</p>}
            </div>
            <div className="md:text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Status</p>
              <span className={`px-3 py-1 rounded-full border font-semibold inline-flex items-center gap-2 ${statusColor}`}>
                {statusEmoji} {order.status}
              </span>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-white/10">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Bill To</p>
              <div className="space-y-1 text-white font-medium">
                <p>{order.userInfo?.name || 'Customer'}</p>
                {order.userInfo?.email && <p className="text-sm text-gray-300">{order.userInfo.email}</p>}
                {order.userInfo?.phone && <p className="text-sm text-gray-300">{order.userInfo.phone}</p>}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Deliver To</p>
              <div className="space-y-1 text-white font-medium">
                <p>{order.deliveryAddress}</p>
                {order.deliveryLocationLabel && <p className="text-sm text-gray-300">{order.deliveryLocationLabel}</p>}
                {order.deliveryNotes && <p className="text-sm text-gray-300">Note: {order.deliveryNotes}</p>}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="py-6 border-b border-white/10">
            <div className="grid grid-cols-12 text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
            <div className="space-y-3">
              {order.items?.map((item, idx) => {
                const extrasTotal = item.extras?.reduce((s, e) => s + e.price * (e.quantity || 1), 0) || 0;
                const lineTotal = (item.price + extrasTotal) * item.quantity;
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 pb-3 border-b border-white/5 last:border-b-0 last:pb-0">
                    <div className="col-span-6">
                      <p className="text-white font-medium">{item.menuItemName}</p>
                      <p className="text-xs text-gray-400">{item.selectedType || 'Standard'}</p>
                      {item.extras?.length > 0 && (
                        <div className="mt-1 space-y-1 text-xs text-gray-400">
                          {item.extras.map((extra, exIdx) => (
                            <div key={exIdx} className="flex justify-between">
                              <span>• {extra.name} {extra.quantity && `(x${extra.quantity})`}</span>
                              <span>${(extra.price * (extra.quantity || 1)).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-center text-white">{item.quantity}</div>
                    <div className="col-span-2 text-right text-white">${item.price.toFixed(2)}</div>
                    <div className="col-span-2 text-right text-white font-semibold">${lineTotal.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm text-gray-300">
              <p>Restaurant: <span className="text-white font-medium">{order.restaurantId}</span></p>
              {order.estimatedDelivery && (
                <p>ETA: <span className="text-white font-medium">{typeof order.estimatedDelivery === 'object' && 'toDate' in order.estimatedDelivery ? order.estimatedDelivery.toDate?.().toLocaleString() : order.estimatedDelivery?.toLocaleString?.() || 'N/A'}</span></p>
              )}
              {order.courier && (order.courier.name || order.courier.phone) && (
                <p>Courier: <span className="text-white font-medium">{order.courier.name || ''} {order.courier.phone || ''}</span></p>
              )}
            </div>

            <div className="md:ml-auto md:w-80 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex justify-between text-gray-300 text-sm pb-2">
                <span>Subtotal</span>
                <span className="text-white">${order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              {order.serviceFee > 0 && (
                <div className="flex justify-between text-gray-300 text-sm pb-2">
                  <span>Service Fee</span>
                  <span className="text-white">${order.serviceFee?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-300 text-sm pb-2">
                <span>Delivery Fee</span>
                <span className="text-white">${order.deliveryFee?.toFixed(2) || '0.00'}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gray-300 text-sm pb-2">
                  <span>Discount</span>
                  <span className="text-emerald-300">-${order.discount?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-white/10">
                <span className="text-white font-semibold">Total</span>
                <span className="text-2xl font-bold text-emerald-300">${order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3 flex-col-reverse sm:flex-row no-print">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-medium transition border border-white/10"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-xl font-medium transition"
          >
            Print Invoice
          </button>
          <button
            onClick={() => router.push(`/orders/update-status/${orderId}`)}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
          >
            Update Status
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          :root {
            color-scheme: dark;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #0a0a0f;
          }
          #print-root {
            background: #0a0a0f !important;
            color: #e5e7eb;
          }
          .glass-card {
            background: rgba(10, 18, 14, 0.95) !important;
            border-color: rgba(16, 185, 129, 0.25) !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          button {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
