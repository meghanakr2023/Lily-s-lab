import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiStar, FiHeart, FiPackage, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { productsAPI } from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';

const CATEGORIES = [
  { id: 'bouquets', label: 'Bouquets', emoji: '💐', desc: 'Fresh & Dried', color: 'from-pink-100 to-rose-100' },
  { id: 'crochet-flowers', label: 'Crochet Flowers', emoji: '🧶', desc: 'Handknitted', color: 'from-purple-100 to-pink-100' },
  { id: 'keychains', label: 'Keychains', emoji: '🌸', desc: 'Carry Love', color: 'from-peach to-pink-100' },
  { id: 'floral-baskets', label: 'Floral Baskets', emoji: '🧺', desc: 'Gift Ready', color: 'from-green-50 to-emerald-100' },
  { id: 'home-decor', label: 'Home Decor', emoji: '🏡', desc: 'Bloom at Home', color: 'from-lavender to-purple-100' },
  { id: 'custom', label: 'Custom Order', emoji: '✨', desc: 'Your Vision', color: 'from-yellow-50 to-peach' },
];

const TESTIMONIALS = [
  { name: 'Kshamya KR.', city: 'Bengaluru', rating: 5, text: "Ordered a custom bouquet for my anniversary and it was absolutely stunning! Lily put so much love into every petal. Will definitely order again!" },
  { name: 'Meghana KR.', city: 'Mysuru', rating: 5, text: "The crochet flowers are SO beautiful and last forever! Such a unique gift idea. My mom absolutely loved them 💕" },
  { name: 'Harshitha S.', city: 'Mysuru', rating: 5, text: "Best floral shop I've found online. The packaging was gorgeous and the bouquet arrived perfectly fresh. Highly recommend!" },
  { name: 'Sneha KA.', city: 'Bengaluru', rating: 5, text: "Ordered keychains for all my bridesmaids — everyone was obsessed! Quality is amazing and delivery was super fast 🌸" },
];

const FEATURES = [
  { icon: FiHeart, title: 'Handmade with Love', desc: 'Every creation crafted personally with care and attention to detail' },
  { icon: FiPackage, title: 'Beautiful Packaging', desc: 'Gift-ready packaging that makes every order feel special' },
  { icon: FiRefreshCw, title: 'Custom Creations', desc: 'Tell us your vision and we bring it to life just for you' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const { data: featuredData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.getAll({ featured: true, limit: 8 }),
  });

  const { data: newArrivalsData } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productsAPI.getAll({ newArrival: true, limit: 4 }),
  });

  const featuredProducts = featuredData?.data?.products || [];
  const newArrivals = newArrivalsData?.data?.products || [];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center petal-bg overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-peach/30 rounded-full blur-3xl" />

        {/* Floating petals */}
        {['🌸', '🌺', '🌷', '💮', '🏵️'].map((petal, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl select-none pointer-events-none"
            style={{ left: `${15 + i * 18}%`, top: `${10 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
          >
            {petal}
          </motion.span>
        ))}

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-script text-2xl text-pink-400 mb-3"
          >
            Welcome to
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-6xl md:text-8xl font-bold text-rose-900 leading-tight mb-4"
          >
            Lily's Lab
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-serif text-xl md:text-3xl text-rose-700/80 italic mb-8"
          >
            "Handmade Floral Creations Made With Love"
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Discover beautiful bouquets, crochet flowers, floral keychains and home decor — each piece lovingly handcrafted for your special moments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/products')}
              className="btn-primary text-base px-10 py-4"
            >
              Shop Now <FiArrowRight />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              
              className="btn-secondary text-base px-10 py-4"
            >
              Create Magic ✨
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-8 mt-14"
          >
            {[['50+', 'Happy Customers'], ['100+', 'Orders Delivered'], ['100%', 'Handmade']].map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl font-bold text-rose-800">{num}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-pink-300"
        >
          ↓
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={itemVariants} className="text-center p-6 rounded-3xl hover:bg-pink-50 transition-colors group">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={22} className="text-pink-500" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 petal-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="section-subtitle">Explore</p>
            <h2 className="section-title">Our Collections</h2>
            <p className="text-gray-400 mt-3 max-w-md mx-auto">From fresh bouquets to lasting crochet creations — find something beautiful for every occasion</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.id} variants={itemVariants}>
                <Link
                  to={cat.id === 'custom' ? '/custom-order' : `/products?category=${cat.id}`}
                  className={`block p-6 md:p-8 rounded-3xl bg-gradient-to-br ${cat.color} hover:shadow-petal transition-all duration-300 group`}
                >
                  <motion.span
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="text-4xl md:text-5xl block mb-3"
                  >
                    {cat.emoji}
                  </motion.span>
                  <h3 className="font-serif font-semibold text-gray-800 text-base md:text-lg">{cat.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
                  <div className="mt-3 text-pink-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Shop now <FiArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
          >
            <div>
              <p className="section-subtitle">Handpicked for You</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products?featured=true" className="btn-outline self-start md:self-auto">
              View All <FiArrowRight size={14} />
            </Link>
          </motion.div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 8).map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
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
          )}
        </div>
      </section>

      

      {/* ── NEW ARRIVALS ── */}
      {newArrivals.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
            >
              <div>
                <p className="section-subtitle">Just In</p>
                <h2 className="section-title">New Arrivals</h2>
              </div>
              <Link to="/products?newArrival=true" className="btn-outline self-start">
                See All <FiArrowRight size={14} />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 petal-bg">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="section-subtitle">Kind Words</p>
            <h2 className="section-title">What Our Customers Say</h2>
          </motion.div>

          <div className="relative">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-petal"
            >
              <div className="flex justify-center mb-4">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="text-amber-400 text-xl">★</span>
                ))}
              </div>
              <p className="font-serif text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-6">
                "{TESTIMONIALS[activeTestimonial].text}"
              </p>
              <div>
                <p className="font-semibold text-rose-800">{TESTIMONIALS[activeTestimonial].name}</p>
                <p className="text-sm text-gray-400">{TESTIMONIALS[activeTestimonial].city}</p>
              </div>
            </motion.div>

            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeTestimonial ? 'w-8 h-2.5 bg-pink-400' : 'w-2.5 h-2.5 bg-pink-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-4xl mb-4 block">💌</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-rose-900 mb-3">Stay in the Loop</h2>
            <p className="text-gray-400 mb-6">Get early access to new arrivals, exclusive offers, and floral inspiration straight to your inbox.</p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={e => { e.preventDefault(); }}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe 🌸
              </button>
            </form>
            <p className="text-xs text-gray-300 mt-3">No spam, unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}