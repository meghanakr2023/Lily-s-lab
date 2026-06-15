const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/stats', protect, adminOnly, getOrderStats);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;