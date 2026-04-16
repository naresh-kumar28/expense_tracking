import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-dark-bg overflow-hidden transition-colors">
      {/* Desktop Sidebar (hmesha dikhega bade screen pe) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer (chote screen pe menu button se khulega) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-64 h-full bg-white dark:bg-dark-card flex-shrink-0 z-50">
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-4 top-4 p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-dark-card border-b border-neutral-200 dark:border-dark-border">
          <h1 className="text-xl font-bold text-primary-600">TrackExpenses</h1>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
