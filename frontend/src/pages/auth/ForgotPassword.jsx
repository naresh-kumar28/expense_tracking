import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { authService } from '../../services/api';
import AuthLayout from '../../components/auth/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await authService.forgotPassword({ email });
      if (response.data.success) {
        // Redirect to OTP verification for password reset
        navigate('/verify-otp', { state: { email, purpose: 'reset_password' } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Forgot Password?" 
      subtitle="Enter your email to receive a password reset OTP"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Send OTP</span>
            </>
          )}
        </button>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
