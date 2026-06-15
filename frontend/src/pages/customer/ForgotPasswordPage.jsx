// ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../utils/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen petal-bg flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-petal-lg p-8 md:p-10 w-full max-w-md text-center">
        {sent ? (
          <>
            <span className="text-5xl block mb-4">💌</span>
            <h2 className="font-display text-2xl text-rose-900 font-bold mb-3">Check Your Email</h2>
            <p className="text-gray-400 text-sm mb-6">We've sent a password reset link to <strong className="text-gray-600">{email}</strong></p>
            <Link to="/login" className="btn-primary inline-flex">Back to Login</Link>
          </>
        ) : (
          <>
            <span className="text-4xl block mb-3">🔐</span>
            <h1 className="font-display text-3xl font-bold text-rose-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-400 text-sm mb-8">Enter your email and we'll send you a reset link</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="your@email.com" className="input-field pl-10" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/login" className="block mt-4 text-sm text-gray-400 hover:text-pink-400">← Back to Login</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;