// ===================== LoginPage.jsx =====================
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../utils/api';
import { useAuthStore } from '../../store';

export function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 🌸`);
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen petal-bg flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-petal-lg p-8 md:p-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🌸</span>
          <h1 className="font-display text-3xl font-bold text-rose-900">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to your Lily's Lab account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
              <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                type="email" placeholder="your@email.com"
                className="input-field pl-10" />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
              <input {...register('password', { required: 'Password is required' })}
                type={showPass ? 'text' : 'password'} placeholder="••••••••"
                className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-500">
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-pink-400 hover:text-pink-600">Forgot password?</Link>
          </div>

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In 🌸'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account? <Link to="/register" className="text-pink-500 font-medium hover:text-pink-600">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;