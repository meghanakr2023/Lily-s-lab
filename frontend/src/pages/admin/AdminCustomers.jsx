import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiUserX, FiUserCheck, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', { search, page }],
    queryFn: () => adminAPI.getCustomers({ search, page, limit: 20 }),
  });

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

  const handleToggle = async (id, name) => {
    try {
      await adminAPI.toggleUserStatus(id);
      toast.success(`User status updated`);
      queryClient.invalidateQueries(['admin-customers']);
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-rose-900">Customers</h1>
        <p className="text-gray-400 text-sm mt-1">{pagination.total || 0} registered customers</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..." className="input-field pl-9 py-2.5 text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">👥</span>
            <p className="text-gray-400">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-pink-50 border-b border-pink-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {users.map((user, i) => (
                  <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-pink-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-pink-700">{user.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400 md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500"><FiMail size={11} />{user.email}</div>
                        {user.phone && <div className="flex items-center gap-1.5 text-xs text-gray-400"><FiPhone size={11} />{user.phone}</div>}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${user.isActive ? 'badge-green' : 'bg-red-100 text-red-500'}`}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleToggle(user._id, user.name)}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ml-auto ${user.isActive ? 'bg-red-50 text-red-400 hover:bg-red-100' : 'bg-green-50 text-green-500 hover:bg-green-100'}`}>
                        {user.isActive ? <><FiUserX size={12} /> Block</> : <><FiUserCheck size={12} /> Activate</>}
                      </button>
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
                className={`w-9 h-9 rounded-full text-sm font-medium ${page === i + 1 ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white' : 'bg-pink-50 text-gray-500'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}