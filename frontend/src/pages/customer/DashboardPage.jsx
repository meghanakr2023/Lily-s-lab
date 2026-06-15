// DashboardPage
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiUser, FiPackage, FiHeart, FiEdit2, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usersAPI, ordersAPI } from '../../utils/api';
import { useAuthStore } from '../../store';

export default function DashboardPage() {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const { data: ordersData } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersAPI.getMyOrders({ limit: 5 }),
  });

  const orders = ordersData?.data?.orders || [];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile({ name, phone });
      updateUser(res.data.user);
      toast.success('Profile updated! 🌸');
      setEditing(false);
    } catch (err) {
      toast.error('Update failed');
    } finally { setSaving(false); }
  };

  const statusColors = {
    pending: 'badge-yellow', confirmed: 'badge-pink', preparing: 'badge-purple',
    shipped: 'badge-pink', delivered: 'badge-green', cancelled: 'badge-red'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="section-title mb-8">My Account</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Stats */}
        {[
          { label: 'Total Orders', value: ordersData?.data?.pagination?.total || 0, icon: '📦' },
          { label: 'Wishlist Items', value: 0, icon: '💕' },
          { label: 'Reviews Given', value: 0, icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <span className="text-3xl block mb-2">{stat.icon}</span>
            <p className="font-display text-2xl font-bold text-rose-800">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FiUser className="text-pink-400" /> Profile Info
          </h2>
          <button onClick={() => editing ? handleSave() : setEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-pink-500 hover:bg-pink-50 rounded-xl transition-colors">
            {editing ? <><FiSave size={14} /> {saving ? 'Saving...' : 'Save'}</> : <><FiEdit2 size={14} /> Edit</>}
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            {editing ? <input value={name} onChange={e => setName(e.target.value)} className="input-field" />
              : <p className="text-gray-700 py-2 px-4 bg-pink-50 rounded-xl">{user?.name}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <p className="text-gray-700 py-2 px-4 bg-pink-50 rounded-xl">{user?.email}</p>
          </div>
          <div>
            <label className="label">Phone</label>
            {editing ? <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" />
              : <p className="text-gray-700 py-2 px-4 bg-pink-50 rounded-xl">{user?.phone || 'Not set'}</p>}
          </div>
          <div>
            <label className="label">Account Type</label>
            <p className="text-gray-700 py-2 px-4 bg-pink-50 rounded-xl capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mt-6">
        <h2 className="font-serif text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <FiPackage className="text-pink-400" /> Recent Orders
        </h2>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm">No orders yet. Start shopping!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-800">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${statusColors[order.orderStatus] || 'badge-pink'} text-xs capitalize mb-1`}>
                    {order.orderStatus}
                  </span>
                  <p className="text-sm font-bold text-rose-700">₹{order.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}