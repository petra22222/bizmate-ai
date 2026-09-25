import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Sliders, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  Zap,
  BellRing,
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { 
  newsletterService, 
  validateNewsletterEmail, 
  DEFAULT_NEWSLETTER_PREFERENCES 
} from '../services/newsletterService';
import { NewsletterPreferences } from '../types';

export const NewsletterPreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState<NewsletterPreferences>(DEFAULT_NEWSLETTER_PREFERENCES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize email
  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) {
      setEmail(qEmail.trim());
      loadSubscriberPrefs(qEmail.trim());
    } else if (user?.email) {
      setEmail(user.email);
      loadSubscriberPrefs(user.email);
    }
  }, [user, searchParams]);

  const loadSubscriberPrefs = async (targetEmail: string) => {
    setIsLoading(true);
    try {
      const sub = await newsletterService.getSubscriber(targetEmail);
      if (sub && sub.preferences) {
        setPreferences({
          ...DEFAULT_NEWSLETTER_PREFERENCES,
          ...sub.preferences,
        });
      }
    } catch (err) {
      console.warn('Could not load subscriber preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof NewsletterPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSavedSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    const { valid, normalized, error: valErr } = validateNewsletterEmail(email);
    if (!valid) {
      setError(t('newsletter.invalidEmail') || valErr || 'Please enter a valid email address.');
      return;
    }

    setIsSaving(true);
    try {
      // First ensure the subscriber exists or update their preferences
      const existing = await newsletterService.getSubscriber(normalized);
      if (!existing) {
        // Create new subscriber with these preferences
        await newsletterService.subscribe(normalized, {
          source: 'account',
          userId: user?.uid,
          preferences,
        });
      } else {
        await newsletterService.updatePreferences(normalized, preferences);
      }
      setSavedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save newsletter preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const prefOptions: { key: keyof NewsletterPreferences; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'aiTips',
      title: t('newsletter.prefAiTips'),
      desc: 'Actionable prompts, reasoning tips, and practical LLM workflows for your business.',
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
    },
    {
      key: 'productivity',
      title: t('newsletter.prefProductivity'),
      desc: 'Time-saving administrative strategies, client management, and scheduling best practices.',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    },
    {
      key: 'automation',
      title: t('newsletter.prefAutomation'),
      desc: 'Deep-dives into n8n nodes, webhook integrations, and multi-step dispatch templates.',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
    },
    {
      key: 'productUpdates',
      title: t('newsletter.prefProductUpdates'),
      desc: 'Official platform news, performance improvements, and security enhancements.',
      icon: <BellRing className="w-5 h-5 text-blue-400" />,
    },
    {
      key: 'newFeatures',
      title: t('newsletter.prefNewFeatures'),
      desc: 'Early access announcements for new tools, sheets connectors, and mobile capabilities.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={user ? "/dashboard" : "/"}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl-mirror" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {t('newsletter.preferencesTitle')}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              BizMate AI Newsletter Content Control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="compact" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t('newsletter.preferencesSaved')}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Email Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Subscriber Email Address
              </label>
              {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />}
            </div>
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
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('newsletter.preferencesSubtitle')}
            </p>
          </div>

          {/* Topics Selection Grid */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-white pb-2 border-b border-slate-800">
              Subscription Topics
            </h3>

            <div className="space-y-3">
              {prefOptions.map((opt) => {
                const isChecked = !!preferences[opt.key];
                return (
                  <label
                    key={opt.key}
                    onClick={() => handleToggle(opt.key)}
                    className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        {opt.icon}
                      </div>
                      <div>
                        <span className="text-xs font-semibold block text-slate-200">
                          {opt.title}
                        </span>
                        <span className="text-[11px] text-slate-400 block pt-0.5 leading-relaxed">
                          {opt.desc}
                        </span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by label onClick
                      className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/unsubscribe"
              className="text-xs text-amber-400 hover:text-amber-300 underline"
            >
              Want to unsubscribe completely?
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
