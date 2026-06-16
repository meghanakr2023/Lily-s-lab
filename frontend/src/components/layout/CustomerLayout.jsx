import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiSearch, FiLogOut } from 'react-icons/fi';
import { useAuthStore,  useWishlistStore } from '../../store';
import logo from "../../assets/logo.jpeg";

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/products?category=bouquets', label: 'Bouquets' },
 
  { to: '/contact', label: 'Contact' },
];

export default function CustomerLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuthStore();
  const wishlistCount = useWishlistStore(s => s.items.length);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Top Banner */}
      

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-petal' : 'bg-cream/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img
  src={logo}
  alt="Lily's Lab"
  className="h-14 w-auto"
/>
              <div>
                <span className="font-display text-2xl font-bold text-rose-800 tracking-wide">Lily's Lab</span>
                <p className="font-script text-xs text-pink-400 -mt-1 hidden sm:block">Handmade with Love</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-pink-500 relative group ${
                    location.pathname === link.to ? 'text-pink-500' : 'text-gray-600'
                  }`}
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 group-hover:w-full transition-all duration-300 rounded-full" />
                </Link>
              ))}
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
              >
                <FiSearch size={20} />
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 text-gray-500 hover:text-pink-500 transition-colors">
                <FiHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>

            

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group hidden md:block">
                  <button className="flex items-center gap-2 p-2 text-gray-500 hover:text-pink-500">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                      <span className="text-sm font-semibold text-pink-700">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-petal border border-pink-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-600">
                      <FiUser size={14} /> My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-600">
                      📦 My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50">
                        ⚙️ Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-pink-100" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-50 w-full text-left"
                    >
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hidden md:block btn-primary text-sm py-2 px-5">
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-pink-500"
              >
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pb-4"
              >
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search for bouquets, keychains, home decor..."
                    className="input-field flex-1"
                  />
                  <button type="submit" className="btn-primary py-2 px-5">
                    <FiSearch size={16} />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-pink-100"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block py-3 px-4 text-gray-600 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="border-pink-100 my-2" />
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="block py-3 px-4 text-gray-600 hover:bg-pink-50 rounded-xl">My Profile</Link>
                    <Link to="/orders" className="block py-3 px-4 text-gray-600 hover:bg-pink-50 rounded-xl">My Orders</Link>
                    <button onClick={logout} className="block w-full text-left py-3 px-4 text-red-400 hover:bg-red-50 rounded-xl">Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="block btn-primary text-center my-2">Sign In</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-pink-50 to-rose-50 border-t border-pink-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🌸</span>
                <span className="font-display text-2xl font-bold text-rose-800">Lily's Lab</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Handmade floral creations crafted with love and care for every special occasion.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-200 transition-colors">📷</a>
                <a href="#" className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-500 hover:bg-green-200 transition-colors">💬</a>
                <a href="#" className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-200 transition-colors">🐦</a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-rose-800 mb-4 font-serif">Quick Links</h4>
              <ul className="space-y-2">
                {[['/', 'Home'], ['/products', 'Shop All'], ['/custom-order', 'Custom Orders'], ['/contact', 'Contact Us']].map(([to, label]) => (
                  <li key={to}><Link to={to} className="text-gray-500 hover:text-pink-500 text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            
            {/* Categories */}
            <div>
              <h4 className="font-semibold text-rose-800 mb-4 font-serif">Categories</h4>
              <ul className="space-y-2">
                {['Bouquets', 'Keychains', 'Floral Baskets', 'Home Decor'].map(cat => (
                  <li key={cat}><Link to={`/products?category=${cat.toLowerCase().replace(' ', '-')}`} className="text-gray-500 hover:text-pink-500 text-sm transition-colors">{cat}</Link></li>
                ))}
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold text-rose-800 mb-4 font-serif">Get in Touch</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <p>🤳 @lilys_lab</p>
                <p>📧 hello@lilyslab.com</p>
                <p>📱 7483890720</p>
                <p>📍 Mysuru, Karnataka</p>
                <p className="text-xs mt-3 text-pink-400">Mon–Sun</p>
              </div>
            </div>
          </div>
          
          <hr className="border-pink-200 my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2026 Lily's Lab. All rights reserved. Made with 🌸 and love.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-pink-400">Privacy Policy</a>
              <a href="#" className="hover:text-pink-400">Terms of Service</a>
              <a href="#" className="hover:text-pink-400">Shipping Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}