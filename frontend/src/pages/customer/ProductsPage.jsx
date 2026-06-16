import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import { productsAPI } from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';

const CATEGORIES = [
  { value: 'all', label: 'All Products', emoji: '🌸' },
  { value: 'bouquets', label: 'Bouquets', emoji: '💐' },
  
  { value: 'keychains', label: 'Keychains', emoji: '🔑' },
  { value: 'floral-baskets', label: 'Floral Baskets', emoji: '🧺' },
  { value: 'home-decor', label: 'Home Decor', emoji: '🏡' },
  
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const featured = searchParams.get('featured') || '';
  const newArrival = searchParams.get('newArrival') || '';

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { category, search, sort, featured, newArrival, priceRange, page }],
    queryFn: () => productsAPI.getAll({
      category: category === 'all' ? '' : category,
      search, sort, featured, newArrival,
      minPrice: priceRange[0] || '',
      maxPrice: priceRange[1] < 5000 ? priceRange[1] : '',
      page, limit: 12,
    }),
    keepPreviousData: true,
  });

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination || {};

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
    setPage(1);
  };

  const getPageTitle = () => {
    if (search) return `Search: "${search}"`;
    if (featured) return 'Featured Products';
    if (newArrival) return 'New Arrivals';
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? `${cat.emoji} ${cat.label}` : 'All Products';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">{getPageTitle()}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {pagination.total ? `${pagination.total} products` : 'Loading...'}
        </p>
      </div>

      <div className="flex gap-8">

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24 space-y-8">

            {/* Category Filter */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 font-serif">Category</h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => updateParam('category', cat.value === 'all' ? '' : cat.value)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 ${
                      category === cat.value || (cat.value === 'all' && !category)
                        ? 'bg-pink-100 text-pink-700 font-medium'
                        : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <span>{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 font-serif">Price Range</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0" max="5000" step="100"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1] >= 5000 ? '5000+' : priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 font-serif">Quick Filters</h3>
              <div className="space-y-2">
                {[['featured', 'Featured', '⭐'], ['newArrival', 'New Arrivals', '✨'], ['bestSeller', 'Best Sellers', '🔥']].map(([key, label, emoji]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={searchParams.get(key) === 'true'}
                      onChange={e => updateParam(key, e.target.checked ? 'true' : '')}
                      className="rounded border-pink-200 text-pink-500 focus:ring-pink-200"
                    />
                    <span className="text-sm text-gray-500 group-hover:text-pink-500 transition-colors">
                      {emoji} {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear */}
            <button
              onClick={() => { setSearchParams({}); setPriceRange([0, 5000]); }}
              className="w-full text-sm text-pink-400 hover:text-pink-600 transition-colors py-2"
            >
              Clear all filters
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0">

          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm text-gray-600 hover:bg-pink-50"
            >
              <FiFilter size={16} /> Filters
            </button>

            {/* Category chips (mobile) */}
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden flex-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => updateParam('category', cat.value === 'all' ? '' : cat.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === cat.value || (cat.value === 'all' && !category)
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-gray-500 hover:bg-pink-50'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative flex-shrink-0">
              <select
                value={sort}
                onChange={e => updateParam('sort', e.target.value)}
                className="appearance-none bg-white border border-pink-100 rounded-xl px-4 py-2 pr-8 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-200 cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card">
                  <div className="aspect-square shimmer rounded-t-3xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 shimmer rounded-full w-1/3" />
                    <div className="h-4 shimmer rounded-full w-3/4" />
                    <div className="h-4 shimmer rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🌸</span>
              <h3 className="font-serif text-xl text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search term</p>
              <button onClick={() => { setSearchParams({}); setPriceRange([0, 5000]); }} className="btn-primary">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                    page === i + 1
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-petal'
                      : 'bg-white text-gray-500 hover:bg-pink-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-50 lg:hidden overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg font-semibold text-rose-800">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-pink-50 rounded-xl">
                  <FiX size={20} />
                </button>
              </div>
              <div className="space-y-1 mb-6">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => { updateParam('category', cat.value === 'all' ? '' : cat.value); setFiltersOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 ${
                      category === cat.value ? 'bg-pink-100 text-pink-700 font-medium' : 'text-gray-500 hover:bg-pink-50'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}