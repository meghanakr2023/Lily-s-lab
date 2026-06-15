// ResetPasswordPage
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '../../utils/api';
import { useAuthStore } from '../../store';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, password);
      login(res.data.user, res.data.token);
      toast.success('Password reset successfully! 🌸');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen petal-bg flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-petal-lg p-8 md:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🔑</span>
          <h1 className="font-display text-3xl font-bold text-rose-900">Set New Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="Min. 6 characters" className="input-field" />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              placeholder="Re-enter password" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}