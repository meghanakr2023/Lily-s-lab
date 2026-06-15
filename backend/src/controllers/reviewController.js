const Review = require('../models/Review');
const Order = require('../models/Order');

// @route POST /api/reviews/:productId
exports.createReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;
    
    // Check if already reviewed
    const existing = await Review.findOne({ user: req.user.id, product: productId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    
    // Check if verified purchase
    const order = await Order.findOne({
      user: req.user.id,
      'items.product': productId,
      orderStatus: 'delivered'
    });
    
    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating, title, comment,
      isVerifiedPurchase: !!order
    });
    
    await review.populate('user', 'name avatar');
    
    res.status(201).json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/reviews/:productId
exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId, isApproved: true })
        .populate('user', 'name avatar')
        .sort(sort).skip(skip).limit(Number(limit)),
      Review.countDocuments({ product: req.params.productId, isApproved: true })
    ]);
    
    // Rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId), isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({ success: true, reviews, ratingBreakdown, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};