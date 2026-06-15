const Product = require('../models/Product');
const { deleteImage } = require('../config/cloudinary');

// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, category, search, minPrice, maxPrice,
      sort = '-createdAt', featured, newArrival, bestSeller
    } = req.query;
    
    const query = { isActive: true };
    
    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.featured = true;
    if (newArrival === 'true') query.newArrival = true;
    if (bestSeller === 'true') query.bestSeller = true;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    let sortObj = {};
    switch (sort) {
      case 'price-asc': sortObj = { price: 1 }; break;
      case 'price-desc': sortObj = { price: -1 }; break;
      case 'rating': sortObj = { averageRating: -1 }; break;
      case 'newest': sortObj = { createdAt: -1 }; break;
      case 'popular': sortObj = { numReviews: -1 }; break;
      default: sortObj = { createdAt: -1 };
    }
    
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/products (Admin)
exports.createProduct = async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT ===");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    const { title, description, price, discountPrice, category, stock, featured, newArrival, bestSeller, tags, colors, sizes, careInstructions } = req.body;
    
    const images = req.files ? req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      alt: title
    })) : [];
    
    const product = await Product.create({
      title, description, price, discountPrice, category, stock, featured, newArrival, bestSeller, tags, colors, sizes, careInstructions, images
    });
    
    res.status(201).json({ success: true, message: 'Product created successfully', product });
  }catch (error) {
  console.error("PRODUCT CREATE ERROR:");
  console.error(error);

  res.status(500).json({
    success: false,
    message: error.message
  });
}
};

// @route PUT /api/products/:id (Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const updates = { ...req.body };
    
    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        alt: product.title
      }));
      updates.images = [...(product.images || []), ...newImages];
    }
    
    product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    
    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/products/:id (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) await deleteImage(image.publicId);
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/products/:id/images/:imageId (Admin)
exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    const image = product.images.id(req.params.imageId);
    if (image && image.publicId) await deleteImage(image.publicId);
    
    product.images = product.images.filter(img => img._id.toString() !== req.params.imageId);
    await product.save();
    
    res.json({ success: true, message: 'Image deleted', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/products/categories/stats
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};