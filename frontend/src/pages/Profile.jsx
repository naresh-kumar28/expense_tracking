import React, { useState } from 'react';
import { User, Mail, Lock, Shield, ShieldCheck, Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Password changed successfully!' });
        setFormData({ old_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Account Settings</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Manage your profile and security preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="card text-center py-8">
            <div className="relative inline-block mx-auto mb-4">
              {user?.profile_image ? (
                <img src={user.profile_image} alt={user.first_name} className="w-24 h-24 rounded-full object-cover border-4 border-primary-50 dark:border-primary-900/20" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              )}
              {user?.is_verified && (
                <div className="absolute bottom-0 right-0 bg-white dark:bg-dark-card rounded-full p-1 shadow-sm">
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold dark:text-white">{user?.first_name} {user?.last_name}</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">{user?.email}</p>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-4 ${
              user?.is_verified ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 text-red-700'
            }`}>
              {user?.is_verified ? 'Verified Member' : 'Unverified'}
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Key className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold dark:text-white">Change Password</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {status.message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
                  status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  <span>{status.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Old Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="password"
                      name="old_password"
                      required
                      value={formData.old_password}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="password"
                        name="new_password"
                        required
                        minLength="8"
                        value={formData.new_password}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Min 8 characters"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="password"
                        name="confirm_password"
                        required
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          
          <div className="card p-6 border-l-4 border-l-primary-500">
            <h4 className="font-bold mb-1 dark:text-white">Authentication Method</h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              You are currently using <strong>{user?.auth_provider === 'google' ? 'Google' : 'Email & Password'}</strong> to sign in to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
