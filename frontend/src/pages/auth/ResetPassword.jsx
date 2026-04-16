import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { authService } from '../../services/api';
import AuthLayout from '../../components/auth/AuthLayout';

export default function ResetPassword() {
  const [formData, setFormData] = useState({ password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email;
  const code = location.state?.code;

  useEffect(() => {
    if (!email || !code) {
      navigate('/login');
    }
  }, [email, code, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await authService.resetPassword({ 
        email, 
        code, 
        password: formData.password 
      });
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password Reset!" subtitle="Your security is our priority">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Your password has been changed successfully. You will be redirected to the login page in a moment.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary w-full"
          >
            Login Now
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set New Password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="password"
              name="password"
              required
              minLength="8"
              value={formData.password}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="password"
              name="confirm_password"
              required
              value={formData.confirm_password}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Reset Password</span>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
