'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { UpdateOrderStatusModal } from '../components/UpdateOrderStatusModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface Order {
  id: string;
  userId?: string;
  restaurantId: string;
  status: string;
  total: number;
  deliveryFee: number;
  createdAt: any;
  items: any[];
}

export default function OrdersPage() {
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'on-the-way': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg md:text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-white">Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-gray-900 rounded-lg shadow p-6 md:p-8 text-center border border-gray-800">
          <p className="text-gray-400 text-sm md:text-base">No orders yet. Run the seed script to add sample data.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-800">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800 border-b border-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">#{order.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-100">{order.restaurantId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-100">${order.total?.toFixed(2) || '0.00'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => alert('View order details coming soon')} className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                      <button 
                        onClick={() => setUpdatingOrderId(order.id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Update Status
                      </button>
                      <button 
                        onClick={() => setDeletingOrderId(order.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-900 rounded-lg shadow p-4 border border-gray-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="font-semibold text-sm text-gray-100">#{order.id.slice(0, 8)}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Restaurant</p>
                    <p className="font-semibold text-gray-100">{order.restaurantId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Total</p>
                    <p className="font-semibold text-gray-100">${order.total?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                <div className="mb-3 text-sm">
                  <p className="text-gray-400 text-xs">Date</p>
                  <p className="font-semibold text-gray-100">{order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => alert('View order details coming soon')}
                    className="flex-1 bg-blue-900 text-blue-300 py-2 px-3 rounded text-xs font-semibold hover:bg-blue-800 active:bg-blue-700 transition"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => setUpdatingOrderId(order.id)}
                    className="flex-1 bg-green-900 text-green-300 py-2 px-3 rounded text-xs font-semibold hover:bg-green-800 active:bg-green-700 transition"
                  >
                    Update Status
                  </button>
                  <button 
                    onClick={() => setDeletingOrderId(order.id)}
                    className="flex-1 bg-red-900 text-red-300 py-2 px-3 rounded text-xs font-semibold hover:bg-red-800 active:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Update Status Modal */}
          {updatingOrderId && (
            <UpdateOrderStatusModal
              orderId={updatingOrderId}
              currentStatus={orders.find(o => o.id === updatingOrderId)?.status || 'pending'}
              isOpen={!!updatingOrderId}
              onClose={() => setUpdatingOrderId(null)}
              onUpdate={fetchOrders}
            />
          )}

          {/* Delete Order Modal */}
          {deletingOrderId && (
            <DeleteConfirmModal
              itemId={deletingOrderId}
              itemName={`Order #${deletingOrderId.slice(0, 8)}`}
              itemType="order"
              isOpen={!!deletingOrderId}
              onClose={() => setDeletingOrderId(null)}
              onDelete={fetchOrders}
            />
          )}
        </>
      )}
    </div>
  );
}
