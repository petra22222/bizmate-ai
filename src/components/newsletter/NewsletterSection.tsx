import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  Check,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { newsletterService, validateNewsletterEmail } from '../../services/newsletterService';
import { NewsletterSubscriber } from '../../types';

interface NewsletterSectionProps {
  source?: 'landing_page' | 'dashboard' | 'footer';
  variant?: 'card' | 'inline' | 'minimal';
  className?: string;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  source = 'landing_page',
  variant = 'card',
  className = '',
}) => {
  const { user } = useAuth();
  const { t, locale, isRtl } = useI18n();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ isNew: boolean; resubscribed?: boolean } | null>(null);
  const [alreadySubscribedNotice, setAlreadySubscribedNotice] = useState(false);
  
  // Status check for logged-in user
  const [userSubscription, setUserSubscription] = useState<NewsletterSubscriber | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setIsCheckingStatus(true);
      newsletterService.getSubscriber(user.email).then((sub) => {
        setUserSubscription(sub);
        setIsCheckingStatus(false);
      });
    } else {
      setUserSubscription(null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAlreadySubscribedNotice(false);
    setSuccessInfo(null);

    const { valid, normalized, error: valErr } = validateNewsletterEmail(email);
    if (!valid) {
      setError(t('newsletter.invalidEmail'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await newsletterService.subscribe(normalized, {
        source,
        language: locale,
        userId: user ? user.uid : null,
      });

      if (!res.success) {
        if (res.alreadySubscribed) {
          setAlreadySubscribedNotice(true);
          if (res.subscriber) setUserSubscription(res.subscriber);
        } else {
          setError(res.error || t('newsletter.invalidEmail'));
        }
      } else {
        setSuccessInfo({ isNew: !res.resubscribed, resubscribed: res.resubscribed });
        if (res.subscriber) setUserSubscription(res.subscriber);
        // Clear input for visitors or non-account users
        if (!user) {
          setEmail('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Subscription failed. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className={`rounded-3xl border transition-all ${
        variant === 'card' 
          ? 'p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/40 border-slate-800 shadow-2xl'
          : 'p-4 sm:p-6 bg-slate-900/70 border-slate-800/80 shadow-md'
      }`}>
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">
            <Mail className="w-3.5 h-3.5" />
            <span>BizMate AI Newsletter</span>
          </div>

          {/* Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {t('newsletter.title')}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {t('newsletter.description')}
          </p>

          {/* Status info if user is logged in */}
          {user && (
            <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
              <span>Account Email: <strong className="text-slate-200 font-mono">{user.email}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {t('newsletter.statusLabel')}:
                {isCheckingStatus ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                ) : userSubscription?.status === 'subscribed' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {t('newsletter.statusSubscribed')}
                  </span>
                ) : userSubscription?.status === 'unsubscribed' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {t('newsletter.statusUnsubscribed')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                    {t('newsletter.statusNotSubscribed')}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Success Banner */}
          {successInfo && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-left sm:text-center animate-fade-in space-y-1">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-sm text-white">
                  {t('newsletter.success')}
                </span>
              </div>
              <p className="text-slate-300">
                {t('newsletter.thankYou')}
              </p>
            </div>
          )}

          {/* Already Subscribed Notice */}
          {alreadySubscribedNotice && (
            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 text-indigo-200 text-xs flex flex-col sm:flex-row items-center justify-center gap-2">
              <Check className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{t('newsletter.alreadySubscribed')}</span>
              <Link 
                to="/newsletter-preferences" 
                className="underline font-medium hover:text-white"
              >
                {t('newsletter.managePreferences')}
              </Link>
            </div>
          )}

          {/* Validation Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="pt-2 max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                    if (alreadySubscribedNotice) setAlreadySubscribedNotice(false);
                  }}
                  placeholder={t('newsletter.emailPlaceholder')}
                  required
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('newsletter.subscribing')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('newsletter.subscribe')}</span>
                    <Send className="w-3.5 h-3.5 rtl-mirror" />
                  </>
                )}
              </button>
            </div>

            {/* Privacy Guarantee Message */}
            <p className="text-[11px] text-slate-400 pt-3 leading-relaxed">
              <span className="inline-flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                {t('newsletter.privacy')}
              </span>
            </p>

            {/* Logged in action shortcuts */}
            <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-slate-400">
              <Link 
                to="/newsletter-preferences" 
                className="hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>{t('newsletter.managePreferences')}</span>
              </Link>
              <span>•</span>
              <Link 
                to="/unsubscribe" 
                className="hover:text-slate-200 transition-colors"
              >
                {t('newsletter.unsubscribe')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
