import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', compact = false }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
        isDark
          ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-slate-700 shadow-sm'
          : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 hover:border-slate-300 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Day mode (White / Light)' : 'Switch to Night mode (Black / Dark)'}
      aria-label={isDark ? 'Switch to Day mode' : 'Switch to Night mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
      {!compact && (
        <span className="sr-only">
          {isDark ? 'Day mode' : 'Night mode'}
        </span>
      )}
    </button>
  );
};
