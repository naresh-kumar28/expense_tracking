import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, Moon, Sun, UserCircle, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <aside className="h-full w-64 bg-white dark:bg-dark-card border-r border-neutral-200 dark:border-dark-border flex flex-col transition-colors">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-900 dark:from-primary-400 dark:to-primary-600">
          TrackExpenses
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {/* Dashboard Link */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </NavLink>

        {/* Expenses Link */}
        <NavLink
          to="/expenses"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`
          }
        >
          <Receipt className="h-5 w-5" />
          Expenses
        </NavLink>

        {/* Profile Link */}
        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`
            }
          >
            <UserCircle className="h-5 w-5" />
            Profile
          </NavLink>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 border-t border-neutral-200 dark:border-dark-border">
        {user ? (
          <>
            {/* User Badge */}
            <div className="flex items-center gap-3 py-3 px-4 mb-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl overflow-hidden">
              {user?.profile_image ? (
                <img src={user.profile_image} className="h-8 w-8 rounded-full" alt="avatar" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-bold ring-2 ring-white dark:ring-neutral-800">
                  {user?.first_name?.[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all font-medium text-sm"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold text-sm"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all font-medium text-sm"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <NavLink to="/login" className="flex items-center justify-center py-2 px-3 rounded-xl bg-primary-50 text-primary-600 font-bold text-xs hover:bg-primary-100 transition-all">
                Login
              </NavLink>
              <NavLink to="/signup" className="flex items-center justify-center py-2 px-3 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 transition-all">
                Sign Up
              </NavLink>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
