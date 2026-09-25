import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw, 
  HeartCrack,
  Check,
  RotateCcw
} from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { newsletterService, validateNewsletterEmail } from '../services/newsletterService';

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resubscribed, setResubscribed] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) {
      setEmail(qEmail.trim());
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { valid, normalized, error: valErr } = validateNewsletterEmail(email);
    if (!valid) {
      setError(t('newsletter.invalidEmail') || valErr || 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await newsletterService.unsubscribe(normalized);
      if (!res.success) {
        setError(res.error || 'Failed to unsubscribe.');
      } else {
        setIsDone(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to unsubscribe.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubscribe = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await newsletterService.subscribe(email, { source: 'landing_page' });
      if (res.success) {
        setResubscribed(true);
        setIsDone(false);
      } else {
        setError(res.error || 'Resubscription failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Resubscription failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl-mirror" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {t('newsletter.unsubscribeTitle')}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              BizMate AI Newsletter Opt-out
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="compact" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t('newsletter.unsubscribeTitle')}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('newsletter.unsubscribeSubtitle')}
            </p>
          </div>

          {/* Success Unsubscribed State */}
          {isDone ? (
            <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{t('newsletter.unsubscribed')}</span>
              </div>
              <p className="text-xs text-slate-300">
                <strong className="text-white font-mono">{email}</strong> has been unsubscribed from all marketing and update emails.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResubscribe}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('newsletter.resubscribe')}</span>
                </button>
                <Link
                  to="/"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUnsubscribe} className="space-y-4 text-left">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {resubscribed && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('newsletter.success')}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{t('newsletter.unsubscribeButton')}</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/newsletter-preferences"
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Rather customize topics instead? Manage Preferences
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
