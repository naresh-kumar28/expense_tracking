import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtpLogin } = useAuth();
  const inputRefs = useRef([]);

  const email = location.state?.email;
  const purpose = location.state?.purpose || 'signup'; // 'signup' or 'reset_password'

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer, email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (purpose === 'signup') {
        const response = await verifyOtpLogin({ email, code });
        if (response.success) {
          setSuccess(response.message || 'Account verified successfully.');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setError(response.message || 'Verification failed');
          setIsSubmitting(false);
        }
      } else {
        const response = await authService.forgotPasswordVerifyOtp({ email, code });
        if (response.data.success) {
          setSuccess(response.data.message);
          setTimeout(() => {
            // For password reset, go to reset-password page with email and code
            navigate('/reset-password', { state: { email, code } });
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    try {
      const response = await authService.resendOtp({ email });
      if (response.data.success) {
        setSuccess('OTP resent successfully!');
        setResendTimer(60);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <AuthLayout 
      title="Verify Account" 
      subtitle={`We've sent a 6-digit code to ${email}`}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-neutral-200 dark:border-dark-border bg-white dark:bg-neutral-800 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || otp.join('').length < 6}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              <span>Verify OTP</span>
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`mt-2 flex items-center justify-center gap-2 mx-auto text-sm font-bold ${
              resendTimer > 0 ? 'text-neutral-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-500'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${resendTimer > 0 ? '' : 'animate-hover'}`} />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
