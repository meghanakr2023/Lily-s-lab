import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiShoppingBag, FiUsers, FiPackage, FiBox, FiLogOut, FiMenu, FiX, FiHome, FiLayers } from 'react-icons/fi';
import { useAuthStore } from '../../store';

const ADMIN_NAV = [
  { to: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/products', icon: FiShoppingBag, label: 'Products' },
  { to: '/admin/orders', icon: FiPackage, label: 'Orders' },
  { to: '/admin/custom-orders', icon: FiLayers, label: 'Custom Orders' },
  { to: '/admin/customers', icon: FiUsers, label: 'Customers' },
  { to: '/admin/inventory', icon: FiBox, label: 'Inventory' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-pink-50/30">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 h-full w-64 bg-white border-r border-pink-100 shadow-petal z-40 flex flex-col admin-scrollbar overflow-y-auto"
          >
            {/* Logo */}
            <div className="p-6 border-b border-pink-100">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-2xl">🌸</span>
                <div>
                  <span className="font-display text-xl font-bold text-rose-800">Lily's Lab</span>
                  <p className="text-xs text-pink-400">Admin Panel</p>
                </div>
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
              {ADMIN_NAV.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === to
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 shadow-sm'
                      : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>

            {/* User + Logout */}
            <div className="p-4 border-t border-pink-100">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                  <span className="text-sm font-semibold text-pink-700">{user?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-400">Admin</p>
                </div>
              </div>
              <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:bg-pink-50 rounded-xl transition-colors mb-1">
                <FiHome size={14} /> View Store
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-50 rounded-xl transition-colors w-full"
              >
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-pink-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-pink-500 transition-colors rounded-xl hover:bg-pink-50"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Content */}
        <main className="p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}