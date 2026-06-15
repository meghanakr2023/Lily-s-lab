const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: 1000
  },
  images: [{
    url: String,
    publicId: String
  }],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product average rating after review save/delete
reviewSchema.statics.updateProductRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.updateProductRating(this.product);
});

reviewSchema.post('remove', function() {
  this.constructor.updateProductRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);