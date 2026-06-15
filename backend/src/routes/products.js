const express = require('express');
console.log("PRODUCT ROUTES LOADED");
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage, getCategoryStats } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadProductImages } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/categories/stats', getCategoryStats);
router.get('/:id', getProduct);

// Admin routes
router.post(
  '/',
  protect,
  adminOnly,
  (req, res, next) => {
    console.log("STEP 1 - Route hit");
    uploadProductImages.array('images', 5)(req, res, (err) => {
      if (err) {
        console.log("UPLOAD ERROR:");
        console.log(err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      console.log("STEP 2 - Upload successful");
      next();
    });
  },
  createProduct
);
router.put('/:id', protect, adminOnly, uploadProductImages.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/images/:imageId', protect, adminOnly, deleteProductImage);

module.exports = router;