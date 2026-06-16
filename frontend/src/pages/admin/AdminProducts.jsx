import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsAPI } from '../../utils/api';

const CATEGORIES = ['all', 'bouquets', 'keychains', 'floral-baskets', 'home-decor'];

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { search, category, page }],
    queryFn: () => productsAPI.getAll({ search, category, page, limit: 15, isActive: '' }),
  });

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination || {};

  const handleDelete = async (id) => {
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      queryClient.invalidateQueries(['admin-products']);
      setDeleteId(null);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-rose-900">Products</h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total || 0} total products</p>
        </div>
        <Link to="/admin/products/add" className="btn-primary self-start">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..." className="input-field pl-9 py-2.5 text-sm" />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="input-field py-2.5 text-sm w-full sm:w-48">
          {CATEGORIES.map(c => <option key={c} value={c === 'all' ? '' : c}>{c === 'all' ? 'All Categories' : c.replace('-', ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🌸</span>
            <p className="text-gray-400">No products found</p>
            <Link to="/admin/products/add" className="btn-primary mt-4 inline-flex">Add First Product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-pink-50 border-b border-pink-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {products.map(product => (
                  <motion.tr key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-pink-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                          {product.images?.[0]?.url
                            ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xl">🌸</div>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-800 line-clamp-1">{product.title}</p>
                          <div className="flex gap-1 mt-0.5">
                            {product.featured && <span className="badge-pink text-xs py-0">Featured</span>}
                            {product.newArrival && <span className="badge-purple text-xs py-0">New</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500 capitalize">{product.category?.replace('-', ' ')}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">₹{(product.discountPrice || product.price)?.toLocaleString()}</p>
                        {product.discountPrice && <p className="text-xs text-gray-400 line-through">₹{product.price?.toLocaleString()}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className={`badge text-xs ${product.stock === 0 ? 'bg-red-100 text-red-500' : product.stock <= 5 ? 'bg-orange-100 text-orange-500' : 'badge-green'}`}>
                        {product.stock === 0 ? 'Out' : `${product.stock}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className={`badge ${product.isActive ? 'badge-green' : 'bg-gray-100 text-gray-400'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/products/${product._id}`} target="_blank" rel="noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                          <FiEye size={15} />
                        </a>
                        <button onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteId(product._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-pink-50">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${page === i + 1 ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white' : 'bg-pink-50 text-gray-500 hover:bg-pink-100'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl text-center">
              <span className="text-4xl block mb-4">🗑️</span>
              <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">Delete Product?</h3>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone. All associated images will also be deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary py-3">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}