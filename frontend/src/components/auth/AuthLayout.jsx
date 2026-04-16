import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-neutral-100 dark:from-neutral-900 dark:to-dark-bg transition-colors duration-500">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
            <ShieldCheck className="text-white h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">TrackExpenses</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Smart wealth management</p>
        </div>

        {/* Card Section */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl shadow-neutral-200/50 dark:shadow-black/20 border border-white/20 dark:border-dark-border p-8 backdrop-blur-sm animate-in zoom-in-95 duration-500">
          {title && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{title}</h2>
              {subtitle && <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
