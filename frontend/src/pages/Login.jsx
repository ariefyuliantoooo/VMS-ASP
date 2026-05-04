import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login(email, password);
      
      if (user.role === 'ADMIN') {
          navigate('/admin');
      } else if (user.role === 'SECURITY') {
          navigate('/security');
      } else {
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-2xl mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <img src={logo} alt="ASP Logo" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
            PT Asia Surya Persada
          </h2>
          <p className="mt-2 text-blue-100 text-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
            Visitor Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-3xl animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.4s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <LogIn className="h-24 w-24 text-gray-900" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-6 relative">Sign in as Visitor</h3>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-500/10 text-red-700 border border-red-200/50 rounded-xl text-sm font-medium animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Lupa Password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Sign In</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:underline">
                Register now
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-white/50">
          &copy; 2026 Visitor Management System. Secure & Efficient.
        </p>
      </div>
    </div>
  );
};

export default Login;
