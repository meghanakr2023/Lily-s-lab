import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiAlertTriangle, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';

export default function AdminInventory() {
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: adminAPI.getInventory,
  });

  const inventory = data?.data?.products || [];
  const summary = data?.data?.summary || {};

  const handleSaveStock = async (id) => {
    setSaving(true);
    try {
      await adminAPI.updateStock(id, Number(editStock));
      toast.success('Stock updated! 🌸');
      queryClient.invalidateQueries(['admin-inventory']);
      setEditingId(null);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-500' };
    if (stock <= 5) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-500' };
    return { label: 'In Stock', color: 'badge-green' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-rose-900">Inventory</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your product stock levels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Products', value: summary.total || 0, color: 'from-pink-400 to-rose-400', icon: '🌸' },
          { label: 'Low Stock', value: summary.lowStock || 0, color: 'from-orange-300 to-yellow-300', icon: '⚠️' },
          { label: 'Out of Stock', value: summary.outOfStock || 0, color: 'from-red-400 to-rose-400', icon: '❌' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <span className="text-2xl block mb-2">{item.icon}</span>
            <p className={`font-display text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📦</span>
            <p className="text-gray-400">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-pink-50 border-b border-pink-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {inventory.map((product, i) => {
                  const { label, color } = getStockStatus(product.stock);
                  return (
                    <motion.tr key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className={`hover:bg-pink-50/30 transition-colors ${product.stock === 0 ? 'bg-red-50/20' : product.stock <= 5 ? 'bg-orange-50/20' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                            {product.images?.[0]?.url
                              ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-xl">🌸</div>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-800 line-clamp-1">{product.title}</p>
                            {product.stock <= 5 && product.stock > 0 && (
                              <div className="flex items-center gap-1 text-orange-400 text-xs">
                                <FiAlertTriangle size={10} /> Low stock
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-sm text-gray-500 capitalize">{product.category?.replace('-', ' ')}</span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-sm font-medium text-gray-700">₹{product.price?.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        {editingId === product._id ? (
                          <div className="flex items-center gap-2">
                            <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} min="0"
                              className="w-20 px-2 py-1.5 border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
                            <button onClick={() => handleSaveStock(product._id)} disabled={saving}
                              className="p-1.5 bg-green-50 text-green-500 rounded-lg hover:bg-green-100 transition-colors">
                              <FiCheck size={14} />
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors">
                              <FiX size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className={`font-bold text-sm ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                            {product.stock}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge text-xs ${color}`}>{label}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {editingId !== product._id && (
                          <button onClick={() => { setEditingId(product._id); setEditStock(String(product.stock)); }}
                            className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors">
                            <FiEdit2 size={15} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}