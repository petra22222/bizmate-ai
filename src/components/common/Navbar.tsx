import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowRight, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <nav className="h-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-base tracking-tight block">
            BizMate AI
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            {t('tagline')}
          </span>
        </div>
      </Link>

      {/* Center Links (Desktop) */}
      <div className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
        <a href="#features" className="hover:text-white transition-colors">
          {t('navbar.capabilities')}
        </a>
        <a href="#workflow" className="hover:text-white transition-colors">
          {t('navbar.workflow')}
        </a>
        <a href="#tools" className="hover:text-white transition-colors">
          {t('navbar.tools')}
        </a>
        <Link to="/help" className="hover:text-white transition-colors">
          {t('navbar.docs')}
        </Link>
      </div>

      {/* Right Action & Language Selector */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <LanguageSelector variant="compact" />
        <ThemeToggle />

        {user ? (
          <Link
            to="/chat"
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-md shadow-indigo-950/40 flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('navbar.openChat')}</span>
            <span className="sm:hidden">{t('sidebar.chat')}</span>
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              {t('navbar.login')}
            </Link>
            <Link
              to="/signup"
              className="hidden sm:flex px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-950/50 items-center gap-1.5 transition-all active:scale-95"
            >
              <span>{t('navbar.signup')}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl-mirror" />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
