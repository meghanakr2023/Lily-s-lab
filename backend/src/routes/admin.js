const express = require('express');
const router = express.Router();
const { getDashboardStats, getCustomers, toggleUserStatus, getInventory, updateStock } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomers);
router.patch('/customers/:id/toggle', toggleUserStatus);
router.get('/inventory', getInventory);
router.patch('/inventory/:id', updateStock);

module.exports = router;