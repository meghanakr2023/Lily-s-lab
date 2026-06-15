const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadProductImages } = require('../config/cloudinary');

router.post('/product-images', protect, adminOnly, uploadProductImages.array('images', 5), (req, res) => {
  const images = req.files.map(file => ({
    url: file.path,
    publicId: file.filename
  }));
  res.json({ success: true, images });
});

module.exports = router;