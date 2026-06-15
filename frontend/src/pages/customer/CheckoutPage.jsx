import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiCreditCard, FiTruck, FiCheck, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ordersAPI, paymentsAPI } from '../../utils/api';
import { useCartStore, useAuthStore } from '../../store';

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getSubtotal, getShipping, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);

  const { couponCode, discount = 0 } = location.state || {};
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = subtotal + shipping - discount;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      city: '', state: '', pincode: '', addressLine1: '', addressLine2: ''
    }
  });

  const handleRazorpayPayment = async (order) => {
    const keyRes = await paymentsAPI.getKey();
    const razorpayRes = await paymentsAPI.createRazorpayOrder(order._id);

    const options = {
      key: keyRes.data.key,
      amount: razorpayRes.data.amount,
      currency: 'INR',
      name: "Lily's Lab",
      description: `Order #${order.orderNumber}`,
      image: '/flower-icon.svg',
      order_id: razorpayRes.data.razorpayOrderId,
      handler: async (response) => {
        try {
          await paymentsAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: order._id
          });
          clearCart();
          navigate(`/order-success/${order._id}`);
        } catch {
          toast.error('Payment verification failed. Please contact support.');
        }
      },
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone
      },
      theme: { color: '#f9a8d4' },
      modal: {
        ondismiss: () => {
          setLoading(false);
          toast('Payment cancelled', { icon: '⚠️' });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmit = async (formData) => {
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    setLoading(true);

    try {
      const orderData = {
        items: items.map(item => ({ productId: item._id, quantity: item.quantity })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        paymentMethod,
        couponCode: couponCode || ''
      };

      const res = await ordersAPI.create(orderData);
      const order = res.data.order;

      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(order);
      } else {
        clearCart();
        navigate(`/order-success/${order._id}`);
        toast.success('Order placed successfully! 🌸');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left — Shipping + Payment */}
          <div className="lg:col-span-2 space-y-6">

            {/* Shipping Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <FiTruck className="text-pink-400" /> Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="label">Full Name *</label>
                  <input {...register('fullName', { required: 'Full name is required' })} placeholder="Your full name" className="input-field" />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="label">Phone Number *</label>
                  <input {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit mobile number' } })} placeholder="10-digit mobile" className="input-field" />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Address Line 1 *</label>
                  <input {...register('addressLine1', { required: 'Address is required' })} placeholder="House no., Street, Area" className="input-field" />
                  {errors.addressLine1 && <p className="text-red-400 text-xs mt-1">{errors.addressLine1.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Address Line 2</label>
                  <input {...register('addressLine2')} placeholder="Landmark (optional)" className="input-field" />
                </div>

                <div>
                  <label className="label">City *</label>
                  <input {...register('city', { required: 'City is required' })} placeholder="City" className="input-field" />
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="label">State *</label>
                  <select {...register('state', { required: 'State is required' })} className="input-field">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>}
                </div>

                <div>
                  <label className="label">Pincode *</label>
                  <input {...register('pincode', { required: 'Pincode is required', pattern: { value: /^\d{6}$/, message: 'Enter valid 6-digit pincode' } })} placeholder="6-digit pincode" className="input-field" />
                  {errors.pincode && <p className="text-red-400 text-xs mt-1">{errors.pincode.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <FiCreditCard className="text-pink-400" /> Payment Method
              </h2>

              <div className="space-y-3">
                {/* Razorpay */}
                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-pink-400 bg-pink-50' : 'border-gray-100 hover:border-pink-200'}`}>
                  <input type="radio" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="text-pink-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">Pay Online</span>
                      <span className="badge-pink text-xs">Recommended</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">UPI, Cards, Net Banking, Wallets via Razorpay</p>
                  </div>
                  <div className="flex gap-1">
                    {['💳', '📱', '🏦'].map(e => <span key={e} className="text-lg">{e}</span>)}
                  </div>
                </label>

                {/* COD */}
                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-pink-400 bg-pink-50' : 'border-gray-100 hover:border-pink-200'}`}>
                  <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-pink-400" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">Cash on Delivery</span>
                    <p className="text-xs text-gray-400 mt-0.5">Pay when your order arrives at your door</p>
                  </div>
                  <span className="text-2xl">💵</span>
                </label>
              </div>

              {paymentMethod === 'razorpay' && (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                  <FiLock size={12} className="text-green-500" />
                  Secured by Razorpay. Your payment info is never stored on our servers.
                </div>
              )}
            </div>
          </div>

          {/* Right — Summary */}
          <div>
            <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24">
              <h2 className="font-serif text-xl font-semibold text-gray-800 mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                {items.map(item => {
                  const price = item.discountPrice || item.price;
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                        {item.images?.[0]?.url
                          ? <img src={item.images[0].url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xl">🌸</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-rose-700">₹{(price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <hr className="border-pink-100 mb-4" />

              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({couponCode})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <hr className="border-pink-100" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-rose-700">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full justify-center py-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : paymentMethod === 'razorpay' ? (
                  <><FiLock size={14} /> Pay ₹{total.toLocaleString()}</>
                ) : (
                  <>Place Order 🌸</>
                )}
              </motion.button>

              <p className="text-center text-xs text-gray-300 mt-3">
                By placing order you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}