import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../../utils/api';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

const statusColors = {
  pending: 'badge-yellow', confirmed: 'badge-pink', preparing: 'badge-purple',
  shipped: 'badge-pink', delivered: 'badge-green', cancelled: 'badge-red'
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => ordersAPI.getMyOrders({ page, limit: 10 }),
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || {};

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 shimmer rounded-2xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">📦</span>
          <h3 className="font-serif text-xl text-gray-600 mb-3">No orders yet</h3>
          <p className="text-gray-400 text-sm mb-6">Your beautiful floral creations will appear here</p>
          <Link to="/products" className="btn-primary">Start Shopping 🌸</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const statusIdx = STATUS_STEPS.indexOf(order.orderStatus);
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${statusColors[order.orderStatus] || 'badge-pink'} capitalize`}>{order.orderStatus}</span>
                    <p className="font-bold text-rose-700 mt-1">₹{order.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {order.items?.slice(0, 4).map((item, j) => (
                    <div key={j} className="w-14 h-14 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>}
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-14 h-14 rounded-xl bg-pink-50 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {order.orderStatus !== 'cancelled' && (
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {STATUS_STEPS.map((step, idx) => (
                      <div key={step} className="flex items-center gap-1 flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full transition-all ${idx <= statusIdx ? 'bg-pink-400' : 'bg-gray-200'}`} />
                        <span className={`text-xs ${idx <= statusIdx ? 'text-pink-500' : 'text-gray-300'} capitalize`}>{step}</span>
                        {idx < STATUS_STEPS.length - 1 && <div className={`w-6 h-0.5 ${idx < statusIdx ? 'bg-pink-300' : 'bg-gray-100'}`} />}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-pink-50">
                  <span className="text-xs text-gray-400 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'} · {order.paymentStatus}</span>
                  {order.trackingNumber && <p className="text-xs text-pink-500">Tracking: {order.trackingNumber}</p>}
                </div>
              </motion.div>
            );
          })}

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${page === i + 1 ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white' : 'bg-white text-gray-500 hover:bg-pink-50'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}