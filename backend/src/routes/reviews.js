const express = require('express');
const router = express.Router();
const { createReview, getProductReviews, deleteReview } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/:productId', protect, createReview);
router.get('/:productId', getProductReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;