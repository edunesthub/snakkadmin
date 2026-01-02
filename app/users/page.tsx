'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  isActive: boolean;
  role: 'customer' | 'admin';
  ordersCount?: number;
  totalSpent?: number;
  lastOrder?: Date;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown User',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive !== false,
          role: data.role || 'customer',
          ordersCount: data.ordersCount || 0,
          totalSpent: data.totalSpent || 0,
          lastOrder: data.lastOrder?.toDate() || null,
        } as User;
      });
      
      setUsers(usersData);
      
      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        activeUsers: usersData.filter(u => u.isActive).length,
        adminUsers: usersData.filter(u => u.role === 'admin').length,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isActive: !currentStatus });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-white">Users</h1>
          <p className="text-gray-400 mt-1">Manage your app users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <h3 className="text-gray-400 font-medium mb-2">Total Users</h3>
          <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500 mt-2">All registered users</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <h3 className="text-gray-400 font-medium mb-2">Active Users</h3>
          <p className="text-4xl font-bold text-green-400">{stats.activeUsers}</p>
          <p className="text-sm text-gray-500 mt-2">{((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(0)}% active</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <h3 className="text-gray-400 font-medium mb-2">Admin Users</h3>
          <p className="text-4xl font-bold text-purple-400">{stats.adminUsers}</p>
          <p className="text-sm text-gray-500 mt-2">Admin accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Users Table/Card View */}
      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden md:block bg-[#121215] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Spent</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">{user.email}</div>
                      {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                          user.isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {user.ordersCount || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      ${(user.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-[#121215] rounded-2xl border border-white/10 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {user.role}
                  </span>
                  <button
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                      user.isActive
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <span>Orders: {user.ordersCount || 0}</span>
                <span>Spent: ${(user.totalSpent || 0).toFixed(2)}</span>
              </div>

              <div className="mt-2 text-sm text-gray-500">
                Joined: {user.createdAt.toLocaleDateString()}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setUserToDelete(user);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        itemId={userToDelete?.id || ''}
        itemName={userToDelete?.name || ''}
        itemType="user"
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}