import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../utils/api';

const STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-pink', preparing: 'badge-purple',
  shipped: 'bg-blue-100 text-blue-600', delivered: 'badge-green', cancelled: 'badge-red'
};

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { statusFilter, page }],
    queryFn: () => ordersAPI.getAll({ status: statusFilter, page, limit: 15 }),
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || {};

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await ordersAPI.updateStatus(selectedOrder._id, {
        status: newStatus,
        note: statusNote,
        trackingNumber
      });
      toast.success('Order status updated! 🌸');
      queryClient.invalidateQueries(['admin-orders']);
      setSelectedOrder(null);
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setUpdating(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-rose-900">Orders</h1>
        <p className="text-gray-400 text-sm mt-1">{pagination.total || 0} total orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number..." className="input-field pl-9 py-2.5 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!statusFilter ? 'bg-pink-500 text-white' : 'bg-pink-50 text-gray-500 hover:bg-pink-100'}`}>
            All
          </button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${statusFilter === s ? 'bg-pink-500 text-white' : 'bg-pink-50 text-gray-500 hover:bg-pink-100'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📦</span>
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-pink-50 border-b border-pink-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Order</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Payment</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-gray-800">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <p className="text-sm text-gray-700">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-rose-700">₹{order.totalAmount?.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-pink'} text-xs capitalize`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`badge text-xs capitalize ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => { setSelectedOrder(order); setNewStatus(order.orderStatus); setStatusNote(''); setTrackingNumber(order.trackingNumber || ''); }}
                        className="text-xs px-3 py-1.5 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors font-medium">
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-pink-50">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-full text-sm font-medium ${page === i + 1 ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white' : 'bg-pink-50 text-gray-500'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/40 z-50" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
             className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-lg font-semibold text-gray-800">Update Order #{selectedOrder.orderNumber}</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-pink-50 rounded-xl text-gray-400">
                  <FiX size={18} />
                </button>
              </div>

              {/* Order details */}
              <div className="bg-pink-50 rounded-xl p-4 mb-4 text-sm space-y-1">
                <p><span className="text-gray-400">Customer:</span> <strong>{selectedOrder.user?.name}</strong></p>
                <p><span className="text-gray-400">Amount:</span> <strong className="text-rose-700">₹{selectedOrder.totalAmount?.toLocaleString()}</strong></p>
                <p><span className="text-gray-400">Payment:</span> <span className="capitalize">{selectedOrder.paymentStatus}</span></p>
                <p><span className="text-gray-400">Method:</span> <span className="capitalize">{selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span></p>
                {selectedOrder.shippingAddress && (
                  <p><span className="text-gray-400">Deliver to:</span> {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">New Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field">
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tracking Number (optional)</label>
                  <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DELHIVERY1234" className="input-field" />
                </div>
                <div>
                  <label className="label">Note to Customer (optional)</label>
                  <textarea value={statusNote} onChange={e => setStatusNote(e.target.value)} rows={2}
                    placeholder="e.g. Your order is being prepared with love!" className="input-field resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedOrder(null)} className="flex-1 btn-secondary py-3 justify-center">Cancel</button>
                  <button onClick={handleUpdateStatus} disabled={updating}
                    className="flex-1 btn-primary py-3 justify-center disabled:opacity-60">
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}