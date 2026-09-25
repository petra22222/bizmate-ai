import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Mail, ShieldCheck, Heart, ExternalLink, Globe } from 'lucide-react';
import { useI18n } from '../../i18n';
import { NewsletterSection } from '../newsletter/NewsletterSection';

interface FooterProps {
  showNewsletterForm?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showNewsletterForm = true }) => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Optional Newsletter Embed in Footer */}
        {showNewsletterForm && (
          <div className="pb-6">
            <NewsletterSection source="footer" variant="card" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                BizMate AI
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous operations assistant connecting n8n workflows with Google Calendar, Gmail, and Google Sheets for growing businesses.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Product
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/chat" className="hover:text-white transition-colors">
                  {t('navbar.openChat')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  {t('sidebar.dashboard')}
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition-colors">
                  {t('sidebar.history')}
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-white transition-colors">
                  {t('sidebar.settings')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Resources */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Newsletter & Updates
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/newsletter-preferences" className="hover:text-white transition-colors">
                  {t('newsletter.managePreferences')}
                </Link>
              </li>
              <li>
                <Link to="/unsubscribe" className="hover:text-white transition-colors">
                  {t('newsletter.unsubscribe')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  {t('navbar.docs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Privacy & Trust
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Strict GDPR compliance. No email sharing or selling. Real-time Firebase cloud encryption with human-in-the-loop safeguards.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safe-by-Default Architecture</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BizMate AI. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/unsubscribe" className="hover:text-slate-300 transition-colors">
              {t('newsletter.unsubscribe')}
            </Link>
            <span>•</span>
            <Link to="/newsletter-preferences" className="hover:text-slate-300 transition-colors">
              {t('newsletter.managePreferences')}
            </Link>
            <span>•</span>
            <Link to="/help" className="hover:text-slate-300 transition-colors">
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
