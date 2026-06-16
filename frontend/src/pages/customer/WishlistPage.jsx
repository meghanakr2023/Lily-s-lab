import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useWishlistStore } from '../../store';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <FiHeart className="text-pink-400" size={28} />
        <h1 className="section-title">My Wishlist</h1>
        {items.length > 0 && <span className="badge-pink">{items.length} items</span>}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <span className="text-7xl block mb-6">💕</span>
            <h2 className="font-display text-3xl text-rose-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-8">Save your favourite floral creations here!</p>
            <Link to="/products" className="btn-primary">Explore Products</Link>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {items.map((product, i) => {
              const price = product.discountPrice || product.price;
              return (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl shadow-sm overflow-hidden group"
                >
                  <Link to={`/products/${product._id}`} className="block aspect-square overflow-hidden bg-pink-50 relative">
                    {product.images?.[0]?.url
                      ? <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl">🌸</div>
                    }
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="badge bg-gray-200 text-gray-500">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-pink-400 capitalize mb-1">{product.category?.replace('-', ' ')}</p>
                    <h3 className="font-serif font-semibold text-gray-800 text-sm line-clamp-1 mb-2">{product.title}</h3>
                    <p className="font-bold text-rose-700 mb-3">₹{price?.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${product._id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-pink-100 text-pink-600 rounded-xl hover:bg-pink-500 hover:text-white transition-all"
                      >
                        <FiEye size={12} /> View Product
                      </Link>
                      <button
                        onClick={() => { removeItem(product._id); toast('Removed', { icon: '💔' }); }}
                        className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}