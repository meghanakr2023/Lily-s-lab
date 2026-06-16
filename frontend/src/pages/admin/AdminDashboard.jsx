import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiShoppingBag, FiPackage, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { adminAPI, ordersAPI } from '../../utils/api';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-pink', preparing: 'badge-purple',
  shipped: 'badge-pink', delivered: 'badge-green', cancelled: 'badge-red'
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminAPI.getDashboard,
    refetchInterval: 30000,
  });

  const stats = data?.data?.stats;

  const STAT_CARDS = stats ? [
    { label: 'Total Customers', value: stats.totalUsers, icon: FiUsers, color: 'from-pink-400 to-rose-400', change: '+12%' },
    { label: 'Total Products', value: stats.totalProducts, icon: FiShoppingBag, color: 'from-purple-400 to-pink-400', change: '' },
    { label: 'Total Orders', value: stats.totalOrders, icon: FiPackage, color: 'from-orange-300 to-pink-300', change: '+8%' },
    { label: 'Monthly Revenue', value: `₹${stats.currentMonthRevenue?.toLocaleString()}`, icon: FiTrendingUp, color: 'from-green-400 to-teal-400', change: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%` },
  ] : [];

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
      </div>
      <div className="h-64 shimmer rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-rose-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening at Lily's Lab 🌸</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div key={card.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} className="text-white" />
            </div>
            <p className="font-display text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
            {card.change && <p className="text-xs text-green-500 font-medium mt-1">{card.change} this month</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-semibold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-pink-500 hover:text-pink-600">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between py-3 border-b border-pink-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{order.user?.name} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-pink'} text-xs capitalize`}>
                    {order.orderStatus}
                  </span>
                  <p className="text-sm font-bold text-rose-700 mt-0.5">₹{order.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
            )) : <p className="text-gray-400 text-sm text-center py-6">No orders yet</p>}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Pending Actions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-serif font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Pending Orders', value: stats?.pendingOrders || 0, to: '/admin/orders?status=pending', color: 'text-yellow-500' },
                
              ].map(item => (
                <Link key={item.label} to={item.to}
                  className="flex items-center justify-between p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                </Link>
              ))}
              <Link to="/admin/products/add"
                className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl hover:from-pink-200 hover:to-purple-200 transition-all text-sm font-medium text-pink-700">
                + Add New Product
              </Link>
            </div>
          </div>

          {/* Low Stock Alert */}
          {stats?.lowStockProducts?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-orange-500">
                <FiAlertTriangle size={16} />
                <h2 className="font-serif font-semibold text-gray-800">Low Stock Alert</h2>
              </div>
              <div className="space-y-2">
                {stats.lowStockProducts.slice(0, 4).map(p => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <p className="text-gray-600 line-clamp-1 flex-1">{p.title}</p>
                    <span className={`ml-2 font-bold ${p.stock === 0 ? 'text-red-500' : 'text-orange-400'}`}>
                      {p.stock === 0 ? 'Out!' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/admin/inventory" className="text-xs text-pink-400 mt-3 block hover:text-pink-600">
                Manage inventory →
              </Link>
            </div>
          )}

          {/* Top Products */}
          {stats?.topProducts?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-serif font-semibold text-gray-800 mb-4">Top Selling</h2>
              <div className="space-y-3">
                {stats.topProducts.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-600 flex-1 line-clamp-1">{item.product?.title}</p>
                    <span className="text-xs text-gray-400">{item.totalSold} sold</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}