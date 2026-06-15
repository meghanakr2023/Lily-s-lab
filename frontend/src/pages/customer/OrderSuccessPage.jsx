import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiArrowRight } from 'react-icons/fi';
import { ordersAPI } from '../../utils/api';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersAPI.getOne(orderId),
  });
  const order = data?.data?.order;

  const statusIndex = order ? STATUS_STEPS.indexOf(order.orderStatus) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
        className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-petal-lg">
        <span className="text-4xl">🌸</span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="font-display text-4xl font-bold text-rose-900 mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Thank you for your order. We're so excited to create something beautiful for you! 💕</p>
        {order && <p className="text-pink-500 font-medium">Order #{order.orderNumber}</p>}
      </motion.div>

      {order && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 shadow-petal my-8 text-left">
          <h3 className="font-serif font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiPackage className="text-pink-400" /> Order Details
          </h3>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between"><span>Order Number</span><span className="font-medium">#{order.orderNumber}</span></div>
            <div className="flex justify-between"><span>Payment</span>
              <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
              </span>
            </div>
            <div className="flex justify-between"><span>Total Amount</span><span className="font-bold text-rose-700">₹{order.totalAmount?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Payment Method</span><span className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span></div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Order Progress</p>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-pink-100 z-0" />
              <div className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 z-0 transition-all duration-500"
                style={{ width: `${(statusIndex / (STATUS_STEPS.length - 1)) * 100}%` }} />
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i <= statusIndex ? 'bg-gradient-to-br from-pink-400 to-purple-400 text-white' : 'bg-pink-50 text-gray-300'
                  }`}>
                    {i < statusIndex ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-gray-400 capitalize hidden sm:block">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders" className="btn-primary">View My Orders <FiArrowRight /></Link>
        <Link to="/products" className="btn-secondary">Continue Shopping</Link>
      </motion.div>
    </div>
  );
}