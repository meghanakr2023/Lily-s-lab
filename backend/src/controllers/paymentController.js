const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/email');

let razorpay = null;

if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @route POST /api/payments/create-order
exports.createRazorpayOrder = async (req, res) => {
    if (!razorpay) {
  return res.status(500).json({
    success: false,
    message: 'Razorpay is disabled'
  });
}
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // in paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        customerName: order.user.name,
        customerEmail: order.user.email
      }
    });
    
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    
    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
    
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.statusHistory.push({ status: 'confirmed', note: 'Payment received via Razorpay' });
    await order.save();
    
    // Send confirmation email
    try {
      await sendEmail({
        to: order.user.email,
        subject: `🌸 Order Confirmed - ${order.orderNumber}`,
        template: 'orderConfirmation',
        data: { name: order.user.name, orderNumber: order.orderNumber, totalAmount: order.totalAmount }
      });
    } catch (e) { console.error('Email error:', e); }
    
    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/payments/razorpay-key
exports.getRazorpayKey = async (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
};