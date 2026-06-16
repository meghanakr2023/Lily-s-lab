import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiEye, FiStar } from 'react-icons/fi';
import { useWishlistStore } from '../../store';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    if (inWishlist) {
      removeItem(product._id);
      toast('Removed from wishlist', { icon: '💔' });
    } else {
      addItem(product);
      toast.success('Added to wishlist! 💕');
    }
  };

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="product-card card group relative"
    >
      <Link to={`/products/${product._id}`}>
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-3xl aspect-square bg-pink-50">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="product-card-img w-full h-full object-cover transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🌸</div>
          )}

          {/* Overlay — view only */}
          <div className="product-card-overlay absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <FiEye size={18} />
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.newArrival && <span className="badge-pink text-xs">✨ New</span>}
            {product.bestSeller && <span className="badge bg-yellow-100 text-yellow-700 text-xs">🌟 Best Seller</span>}
            {hasDiscount && (
              <span className="badge bg-red-100 text-red-600 text-xs">
                -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
              </span>
            )}
            {product.stock === 0 && <span className="badge bg-gray-100 text-gray-500 text-xs">Out of Stock</span>}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              inWishlist
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white/80 text-gray-400 hover:bg-pink-50 hover:text-pink-500'
            }`}
          >
            <FiHeart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-pink-400 font-medium uppercase tracking-wider mb-1 capitalize">
            {product.category?.replace('-', ' ')}
          </p>
          <h3 className="font-serif text-base font-semibold text-gray-800 line-clamp-1 mb-2 group-hover:text-pink-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1,2,3,4,5].map(star => (
                  <FiStar key={star} size={12}
                    fill={star <= Math.round(product.averageRating) ? '#f59e0b' : 'none'}
                    className={star <= Math.round(product.averageRating) ? 'text-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-rose-700 text-lg">₹{effectivePrice.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}