import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag, FiTag } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const COUPONS = { FIRSTORDER: 10, LILY20: 20 };

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getShipping, getTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const subtotal = getSubtotal();
  const shipping = getShipping();

  const discountAmount = appliedCoupon
    ? Math.round(subtotal * (COUPONS[appliedCoupon] / 100))
    : 0;

  const total = subtotal + shipping - discountAmount;

  const applyCoupon = () => {
    if (COUPONS[coupon.toUpperCase()]) {
      setAppliedCoupon(coupon.toUpperCase());
      toast.success(`Coupon applied! ${COUPONS[coupon.toUpperCase()]}% off 🎉`);
    } else {
      toast.error('Invalid coupon code');
    }
    setCoupon('');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast('Please login to checkout', { icon: '🔐' });
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout', { state: { couponCode: appliedCoupon, discount: discountAmount } });
  };

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <span className="text-7xl block mb-6">🛒</span>
        <h2 className="font-display text-3xl text-rose-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-400 mb-8">Discover our beautiful handmade floral creations and find something you love!</p>
        <Link to="/products" className="btn-primary">
          Start Shopping <FiArrowRight />
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">
          <FiTrash2 size={14} /> Clear All
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map(item => {
              const price = item.discountPrice || item.price;
              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm items-start"
                >
                  <Link to={`/products/${item._id}`} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-pink-50">
                    {item.images?.[0]?.url ? (
                      <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🌸</div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item._id}`}>
                      <h3 className="font-serif font-semibold text-gray-800 hover:text-pink-600 transition-colors line-clamp-1">{item.title}</h3>
                    </Link>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{item.category?.replace('-', ' ')}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-pink-50 rounded-full px-2 py-1">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-500 hover:bg-pink-100 text-xs shadow-sm">
                          <FiMinus size={10} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-500 hover:bg-pink-100 text-xs shadow-sm">
                          <FiPlus size={10} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-rose-700">₹{(price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => { removeItem(item._id); toast('Item removed', { icon: '🗑️' }); }} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-serif font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiTag className="text-pink-400" /> Have a Coupon?
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={e => setCoupon(e.target.value.toUpperCase())}
                placeholder="FIRSTORDER or LILY20"
                className="input-field flex-1 text-sm py-2.5"
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
              />
              <button onClick={applyCoupon} className="px-4 py-2.5 bg-pink-100 text-pink-600 rounded-xl text-sm font-medium hover:bg-pink-200 transition-colors">
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-green-600 font-medium">✅ {appliedCoupon} applied!</span>
                <button onClick={() => setAppliedCoupon(null)} className="text-gray-400 hover:text-red-400 text-xs">Remove</button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-serif font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <FiShoppingBag className="text-pink-400" /> Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>
                  {shipping === 0 ? 'FREE 🎉' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-pink-400">Add ₹{(999 - subtotal).toLocaleString()} more for free shipping!</p>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({COUPONS[appliedCoupon]}%)</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <hr className="border-pink-100" />
              <div className="flex justify-between font-bold text-gray-800 text-base">
                <span>Total</span>
                <span className="text-rose-700">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCheckout}
              className="btn-primary w-full justify-center mt-6 py-4"
            >
              Proceed to Checkout <FiArrowRight />
            </motion.button>

            <Link to="/products" className="flex items-center justify-center gap-1 mt-3 text-sm text-gray-400 hover:text-pink-400 transition-colors">
              ← Continue Shopping
            </Link>
          </div>

          {/* Trust badges */}
          <div className="bg-pink-50 rounded-2xl p-4 space-y-2">
            {['🔒 Secure Checkout', '🚚 Fast Delivery', '↩️ Easy Returns', '🌸 Handmade Quality'].map(t => (
              <p key={t} className="text-xs text-gray-500">{t}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}