const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'title images price discountPrice stock averageRating');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const productId = req.params.productId;
    
    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
      await user.save();
      return res.json({ success: true, message: 'Removed from wishlist', inWishlist: false });
    }
    
    user.wishlist.push(productId);
    await user.save();
    res.json({ success: true, message: 'Added to wishlist', inWishlist: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;