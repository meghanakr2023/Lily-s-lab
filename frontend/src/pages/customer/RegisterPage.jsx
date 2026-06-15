import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../utils/api';
import { useAuthStore } from '../../store';

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register({
  name: data.name,
  email: data.email,
  password: data.password,
  phone: data.phone
});

console.log("REGISTER RESPONSE:", res.data);

toast.success("Registration API reached!");
      //login(res.data.user, res.data.token);
      toast.success(`Welcome to Lily's Lab, ${res.data.user.name}! 🌸`);
      //navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <span className="text-4xl block mb-3">🌷</span>
          <h1 className="font-display text-3xl font-bold text-rose-900">Join Lily's Lab</h1>
          <p className="text-gray-400 text-sm mt-2">Create your account and start shopping</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
              <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                placeholder="Your full name" className="input-field pl-10" />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
              <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                type="email" placeholder="your@email.com" className="input-field pl-10" />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
              <input {...register('phone', { pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' } })}
                placeholder="10-digit mobile (optional)" className="input-field pl-10" />
            </div>
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
              <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300">
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
              <input {...register('confirmPassword', { required: 'Please confirm password', validate: val => val === password || 'Passwords do not match' })}
                type="password" placeholder="Re-enter password" className="input-field pl-10" />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
            {loading ? 'Creating Account...' : 'Create Account 🌸'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account? <Link to="/login" className="text-pink-500 font-medium hover:text-pink-600">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}