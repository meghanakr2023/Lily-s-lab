const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail } = require('../utils/email');

// @route POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;
    
    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.title}` });
      }
      
      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;
      
      orderItems.push({
        product: product._id,
        title: product.title,
        image: product.images[0]?.url,
        price,
        quantity: item.quantity,
        total: price * item.quantity
      });
    }
    
    // Shipping cost (free above ₹999)
    const shippingCost = subtotal >= 999 ? 0 : 99;
    let discount = 0;
    
    // Apply coupon (basic implementation)
    if (couponCode === 'FIRSTORDER') discount = Math.round(subtotal * 0.1);
    if (couponCode === 'LILY20') discount = Math.round(subtotal * 0.2);
    
    const totalAmount = subtotal + shippingCost - discount;
    
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      discount,
      couponCode,
      totalAmount,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'pending'
    });
    
    // Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }
    
    // Add to status history
    order.statusHistory.push({ status: 'pending', note: 'Order placed' });
    await order.save();
    
    await order.populate('items.product', 'title images');
    
    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    console.log("LOGGED IN USER:", req.user);
console.log("USER ID:", req.user.id);

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id }).sort('-createdAt').skip(skip).limit(Number(limit)),
      Order.countDocuments({ user: req.user.id })
    ]);
    
    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    // Check ownership or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const query = {};
    
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email phone').sort('-createdAt').skip(skip).limit(Number(limit)),
      Order.countDocuments(query)
    ]);
    
    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/orders/:id/status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || `Order ${status}` });
    
    if (status === 'delivered') order.deliveredAt = new Date();
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    await order.save();
    
    // Send status update email
    try {
      await sendEmail({
        to: order.user.email,
        subject: `🌸 Order Update - ${order.orderNumber}`,
        template: 'orderStatus',
        data: { name: order.user.name, orderNumber: order.orderNumber, status, note }
      });
    } catch (e) { console.error('Email error:', e); }
    
    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/admin/stats (Admin)
exports.getOrderStats = async (req, res) => {
  try {
    const [totalOrders, statusStats, revenueStats, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, avg: { $avg: '$totalAmount' } } }
      ]),
      Order.find().sort('-createdAt').limit(5).populate('user', 'name email')
    ]);
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        statusBreakdown: statusStats,
        totalRevenue: revenueStats[0]?.total || 0,
        avgOrderValue: revenueStats[0]?.avg || 0,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};