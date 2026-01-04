'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PremiumLoading } from '../components/PremiumLoading';
import { UpdateOrderStatusModal } from '../components/UpdateOrderStatusModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

import { Timestamp } from 'firebase/firestore';

interface Order {
  id: string;
  userId: string;
  userInfo?: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  restaurantId: string;
  status: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  createdAt: Timestamp;
  items: Array<{
    menuItemId: string;
    menuItemName: string;
    price: number;
    selectedType?: string;
    quantity: number;
    extras: Array<{ name: string; price: number; quantity?: number }>;
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'preparing': return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
      case 'on-the-way': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return <PremiumLoading />;
  }

  return (
    <div className="p-4 md:p-8 min-h-full animate-enter">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-white">Orders</h1>
        <p className="text-gray-400 text-sm mt-1">Track and manage customer orders in real-time.</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-white/10">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            Waiting for the first order to come in. Try running the seed script if you are in development.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-300">#{order.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-medium">{order.userInfo?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{order.userInfo?.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-medium">{order.restaurantId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">${order.total?.toFixed(2) || '0.00'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/orders/view/${order.id}`)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/orders/update-status/${order.id}`)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10 p-2 rounded-lg transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => router.push(`/delete/${order.id}?type=order&collection=orders`)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="glass-card rounded-2xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-gray-500 font-mono mb-1 block">#{order.id.slice(0, 8)}</span>
                    <h3 className="font-semibold text-white">{order.restaurantId}</h3>
                    {order.userInfo?.name && <p className="text-xs text-gray-400 mt-1">{order.userInfo.name}</p>}
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                    <p className="font-bold text-white text-lg">${order.total?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-gray-500 text-xs mb-1">Date</p>
                    <p className="font-medium text-white text-sm mt-1">{order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/orders/view/${order.id}`)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-blue-300 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/10"
                  >
                    View
                  </button>
                  <button
                    onClick={() => router.push(`/orders/update-status/${order.id}`)}
                    className="flex-1 bg-white/5 hover:bg-green-500/20 text-green-400 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/10 hover:border-green-500/20"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => router.push(`/delete/${order.id}?type=order&collection=orders`)}
                    className="flex-1 bg-white/5 hover:bg-red-500/20 text-red-400 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/10 hover:border-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Update Status Modal */}
          <UpdateOrderStatusModal
            orderId={updatingOrderId || ''}
            currentStatus={orders.find(o => o.id === updatingOrderId)?.status || 'pending'}
            isOpen={!!updatingOrderId}
            onClose={() => setUpdatingOrderId(null)}
            onUpdate={() => {}}
          />

          {/* Delete Order Modal */}
          <DeleteConfirmModal
            itemId={deletingOrderId || ''}
            itemName={`Order #${deletingOrderId?.slice(0, 8) || ''}`}
            itemType="order"
            isOpen={!!deletingOrderId}
            onClose={() => setDeletingOrderId(null)}
            onDelete={() => {}}
          />
        </>
      )}
    </div>
  );
}
