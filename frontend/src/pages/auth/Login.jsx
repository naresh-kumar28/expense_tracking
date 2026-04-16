import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Globe, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, handleGoogleAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const res = await login(formData);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.message);
      setIsSubmitting(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      const res = await handleGoogleAuth(tokenResponse.access_token);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message);
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setError('Google Sign-In was unsuccessful. Try again later.');
    },
  });

  return (
    <AuthLayout title="Welcome back" subtitle="Login to manage your expenses">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ... (email/password fields are the same) ... */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
            <Link to="/forgot-password" name="forgot-password-link" className="text-sm text-primary-600 hover:text-primary-500 font-medium">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>Login</span>
            </>
          )}
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-dark-border"></div>
          </div>
          <span className="relative px-2 bg-white dark:bg-dark-card text-neutral-500 text-xs uppercase tracking-wider font-semibold">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={isSubmitting}
          className="btn-outline w-full flex items-center justify-center gap-2 py-2.5 group hover:border-primary-500/50 transition-all"
        >
          <Globe className="h-5 w-5 group-hover:text-primary-600" />
          <span>Google</span>
        </button>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          New here?{' '}
          <Link to="/signup" name="signup-link" className="text-primary-600 hover:text-primary-500 font-bold">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
