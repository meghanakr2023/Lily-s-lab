import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiHeart, FiShoppingCart, FiStar, FiMinus, FiPlus, FiShare2, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsAPI, reviewsAPI } from '../../utils/api';
import { useCartStore, useWishlistStore, useAuthStore } from '../../store';
import ProductCard from '../../components/product/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getOne(id),
  });

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsAPI.getProductReviews(id),
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related', data?.data?.product?.category],
    queryFn: () => productsAPI.getAll({ category: data?.data?.product?.category, limit: 4 }),
    enabled: !!data?.data?.product?.category,
  });

  const product = data?.data?.product;
  const reviews = reviewsData?.data?.reviews || [];
  const relatedProducts = relatedData?.data?.products?.filter(p => p._id !== id) || [];
  const inWishlist = product ? isInWishlist(product._id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) { toast.error('Out of stock'); return; }
    addToCart(product, quantity);
    setAddedToCart(true);
    toast.success(`Added to cart! 🛒`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeItem(product._id);
      toast('Removed from wishlist', { icon: '💔' });
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist! 💕');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to leave a review'); return; }
    setSubmittingReview(true);
    try {
      await reviewsAPI.create(id, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted! 🌸');
      setReviewText('');
      setReviewRating(5);
      refetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square shimmer rounded-3xl" />
        <div className="space-y-4">
          <div className="h-6 shimmer rounded-full w-1/3" />
          <div className="h-10 shimmer rounded-xl w-3/4" />
          <div className="h-8 shimmer rounded-xl w-1/3" />
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Product not found</p>
      <Link to="/products" className="btn-primary mt-4 inline-block">Back to Shop</Link>
    </div>
  );

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-pink-400">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-pink-400">Shop</Link>
        <span>/</span>
        <span className="text-gray-600 capitalize">{product.category?.replace('-', ' ')}</span>
        <span>/</span>
        <span className="text-pink-500 line-clamp-1">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 mb-16">

        {/* Images */}
        <div className="space-y-4">
          <motion.div
            className="aspect-square rounded-3xl overflow-hidden bg-pink-50"
            layoutId={`product-img-${id}`}
          >
            {product.images?.[selectedImage]?.url ? (
              <img
                src={product.images[selectedImage].url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🌸</div>
            )}
          </motion.div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden transition-all ${
                    selectedImage === i ? 'ring-2 ring-pink-400 ring-offset-2' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-pink capitalize">{product.category?.replace('-', ' ')}</span>
              {product.newArrival && <span className="badge bg-purple-100 text-purple-600">✨ New</span>}
              {product.bestSeller && <span className="badge bg-yellow-100 text-yellow-600">⭐ Best Seller</span>}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-rose-900 leading-tight">{product.title}</h1>
          </div>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={16} fill={s <= Math.round(product.averageRating) ? '#f59e0b' : 'none'} className={s <= Math.round(product.averageRating) ? 'text-amber-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.averageRating} ({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-rose-700">₹{effectivePrice.toLocaleString()}</span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="badge bg-red-100 text-red-600">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Available Colors:</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <span key={color} className="px-3 py-1 bg-pink-50 border border-pink-100 rounded-full text-sm text-gray-600">{color}</span>
                ))}
              </div>
            </div>
          )}

          {/* Care */}
          {product.careInstructions && (
            <div className="bg-pink-50 rounded-2xl p-4 text-sm">
              <p className="font-medium text-pink-700 mb-1">💧 Care Instructions</p>
              <p className="text-gray-500">{product.careInstructions}</p>
            </div>
          )}

          {/* Quantity + Actions */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Quantity:</span>
                <div className="flex items-center gap-3 bg-pink-50 rounded-full px-3 py-2">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-pink-100 transition-colors shadow-sm">
                    <FiMinus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-800">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-pink-100 transition-colors shadow-sm">
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold transition-all ${
                    addedToCart
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-petal hover:shadow-petal-lg'
                  }`}
                >
                  {addedToCart ? <><FiCheck /> Added!</> : <><FiShoppingCart /> Add to Cart</>}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleWishlist}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    inWishlist ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-400 hover:bg-pink-100'
                  }`}
                >
                  <FiHeart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                </motion.button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-4 border-2 border-pink-300 text-pink-600 font-semibold rounded-2xl hover:bg-pink-50 transition-colors"
              >
                Buy Now
              </button>
            </div>
          )}

          {/* Shipping info */}
          <div className="flex flex-col gap-2 pt-2 border-t border-pink-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>🚚</span> Free shipping on orders above ₹999
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>🔄</span> Easy returns within 7 days
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>🌸</span> Handcrafted with love & care
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-16">
        <h2 className="font-display text-2xl font-semibold text-rose-900 mb-8">Customer Reviews</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length > 0 ? reviews.map(review => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-pink-700">{review.user?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{review.user?.name}</p>
                      {review.isVerifiedPurchase && <span className="text-xs text-green-500 flex items-center gap-1"><FiCheck size={10} /> Verified Purchase</span>}
                    </div>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <FiStar key={s} size={12} fill={s <= review.rating ? '#f59e0b' : 'none'} className={s <= review.rating ? 'text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                <p className="text-xs text-gray-300 mt-2">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-3">🌸</p>
                <p>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>

          {/* Leave Review */}
          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
            <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">Leave a Review</h3>
            {!isAuthenticated ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">Login to leave a review</p>
                <Link to="/login" className="btn-primary text-sm py-2 px-5">Login</Link>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="label">Your Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewRating(s)} className="text-2xl transition-transform hover:scale-110">
                        <span className={s <= reviewRating ? 'text-amber-400' : 'text-gray-200'}>★</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    required
                    className="input-field resize-none"
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary w-full justify-center">
                  {submittingReview ? 'Submitting...' : 'Submit Review 🌸'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-semibold text-rose-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.slice(0, 4).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}