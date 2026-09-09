import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../components/Common';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setFormData({
      email: 'user@example.com',
      password: 'User@123'
    });
  };

  const fillAdminUser = () => {
    setFormData({
      email: 'admin@example.com',
      password: 'Admin@123'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Demo User */}
          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/40 rounded-lg border border-primary-200 dark:border-primary-800 space-y-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              📝 Demo User: <span className="font-mono text-primary-600 dark:text-primary-400">user@example.com / User@123</span>
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={fillDemoUser}
            >
              Fill Demo Traveler
            </Button>
          </div>

          {/* Admin User */}
          <div className="mt-3 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800 space-y-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              👑 Admin User: <span className="font-mono text-orange-600 dark:text-orange-400">admin@example.com / Admin@123</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold border-orange-300 dark:border-orange-700"
              onClick={fillAdminUser}
            >
              Fill Admin Credentials
            </Button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
