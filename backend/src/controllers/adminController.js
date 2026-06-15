const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const Review = require('../models/Review');

// @route GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const [
      totalUsers, totalProducts, totalOrders, totalCustomOrders,
      pendingOrders, monthlyRevenue, lastMonthRevenue,
      lowStockProducts, recentOrders, topProducts
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      CustomOrder.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Product.find({ stock: { $lte: 5, $gt: 0 } }).select('title stock category'),
      Order.find().sort('-createdAt').limit(10).populate('user', 'name email'),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' }
      ])
    ]);
    
    // Monthly revenue chart (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyChart = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const currentMonthRevenue = monthlyRevenue[0]?.total || 0;
    const prevMonthRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = prevMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : 100;
    
    res.json({
      success: true,
      stats: {
        totalUsers, totalProducts, totalOrders, totalCustomOrders,
        pendingOrders, currentMonthRevenue, revenueGrowth,
        lowStockProducts, recentOrders, topProducts, monthlyChart
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/customers
exports.getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'customer' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)).select('-password'),
      User.countDocuments(query)
    ]);
    
    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/admin/customers/:id/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/inventory
exports.getInventory = async (req, res) => {
  try {
    const [products, outOfStock, lowStock] = await Promise.all([
      Product.find({ isActive: true }).select('title category stock images price').sort('stock'),
      Product.countDocuments({ stock: 0, isActive: true }),
      Product.countDocuments({ stock: { $lte: 5, $gt: 0 }, isActive: true })
    ]);
    
    res.json({ success: true, products, summary: { total: products.length, outOfStock, lowStock } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/admin/inventory/:id
exports.updateStock = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: req.body.stock },
      { new: true }
    );
    res.json({ success: true, message: 'Stock updated', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};