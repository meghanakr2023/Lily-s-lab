import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '../../utils/api';

const CATEGORIES = ['bouquets', 'crochet-flowers', 'keychains', 'floral-baskets', 'home-decor', 'custom'];

export default function AdminAddProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: productData } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => productsAPI.getOne(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (productData?.data?.product) {
      const p = productData.data.product;
      reset({
        title: p.title, description: p.description, price: p.price,
        discountPrice: p.discountPrice || '', category: p.category,
        stock: p.stock, featured: p.featured, newArrival: p.newArrival,
        bestSeller: p.bestSeller, tags: p.tags?.join(', ') || '',
        colors: p.colors?.join(', ') || '', careInstructions: p.careInstructions || '',
      });
      setExistingImages(p.images || []);
    }
  }, [productData, reset]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const total = files.length + images.length + existingImages.length;
    if (total > 5) { toast.error('Maximum 5 images allowed'); return; }
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    try {
      await productsAPI.deleteImage(id, imageId);
      setExistingImages(prev => prev.filter(img => img._id !== imageId));
      toast.success('Image removed');
    } catch { toast.error('Failed to remove image'); }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== '' && value !== undefined) formData.append(key, value);
      });
      images.forEach(img => formData.append('images', img));

      if (isEdit) {
        await productsAPI.update(id, formData);
        toast.success('Product updated! 🌸');
      } else {
        await productsAPI.create(formData);
        toast.success('Product created! 🌸');
      }
      queryClient.invalidateQueries(['admin-products']);
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-pink-50 rounded-xl transition-colors text-gray-400 hover:text-pink-500">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-3xl font-semibold text-rose-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{isEdit ? 'Update product details' : 'Add a new product to your store'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif font-semibold text-gray-800">Basic Information</h2>
          <div>
            <label className="label">Product Title *</label>
            <input {...register('title', { required: 'Title is required' })}
              placeholder="e.g. Romantic Rose Bouquet" className="input-field" />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea {...register('description', { required: 'Description is required' })} rows={4}
              placeholder="Describe your beautiful creation in detail..." className="input-field resize-none" />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="label">Category *</label>
            <select {...register('category', { required: 'Category is required' })} className="input-field">
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif font-semibold text-gray-800 mb-4">Pricing & Stock</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Original Price (₹) *</label>
              <input type="number" {...register('price', { required: 'Price is required', min: 0 })}
                placeholder="0" className="input-field" />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Discount Price (₹)</label>
              <input type="number" {...register('discountPrice', { min: 0 })}
                placeholder="0 (optional)" className="input-field" />
            </div>
            <div>
              <label className="label">Stock Quantity *</label>
              <input type="number" {...register('stock', { required: 'Stock is required', min: 0 })}
                placeholder="0" className="input-field" />
              {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif font-semibold text-gray-800">Additional Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tags (comma separated)</label>
              <input {...register('tags')} placeholder="roses, bouquet, gift" className="input-field" />
            </div>
            <div>
              <label className="label">Available Colors (comma separated)</label>
              <input {...register('colors')} placeholder="Red, Pink, White" className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Care Instructions</label>
            <textarea {...register('careInstructions')} rows={2}
              placeholder="e.g. Keep in cool place, away from direct sunlight..." className="input-field resize-none" />
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              { name: 'featured', label: '⭐ Featured Product' },
              { name: 'newArrival', label: '✨ New Arrival' },
              { name: 'bestSeller', label: '🔥 Best Seller' },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register(name)}
                  className="rounded border-pink-200 text-pink-500 focus:ring-pink-200 w-4 h-4" />
                <span className="text-sm text-gray-600">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif font-semibold text-gray-800 mb-4">Product Images</h2>
          <p className="text-xs text-gray-400 mb-4">Upload up to 5 images. First image will be the main display image.</p>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {existingImages.map(img => (
                <div key={img._id} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(img._id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiX size={10} />
                  </button>
                  <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-0.5">Saved</span>
                </div>
              ))}
            </div>
          )}

          {/* New image previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiX size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          {images.length + existingImages.length < 5 && (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-pink-200 rounded-2xl cursor-pointer hover:bg-pink-50 transition-colors">
              <FiUpload className="text-pink-300 mb-2" size={24} />
              <p className="text-sm text-gray-400">Click to upload images</p>
              <p className="text-xs text-gray-300">JPG, PNG, WEBP (max 5MB each)</p>
              <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary flex-1 justify-center py-3.5">
            Cancel
          </button>
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="btn-primary flex-1 justify-center py-3.5 disabled:opacity-60">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              <><FiSave size={16} /> {isEdit ? 'Update Product' : 'Create Product'}</>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}