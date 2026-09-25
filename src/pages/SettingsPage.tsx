import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Activity, 
  Sun, 
  Moon, 
  Laptop, 
  Bell, 
  MessageSquare,
  RefreshCw,
  Lock,
  Unlock,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n, SUPPORTED_LANGUAGES } from '../i18n';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { firestoreService } from '../services/firestoreService';
import { n8nService } from '../services/n8nService';
import { UserSettings } from '../types';
import { N8N_DEFAULT_WEBHOOK_URL, getEffectiveN8nUrl } from '../config/n8nConfig';

export const SettingsPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const [settings, setSettings] = useState<UserSettings>({
    userId: '',
    theme: 'dark',
    enterToSend: true,
    showTimestamps: true,
    compactMode: false,
    emailNotifications: true,
    n8nCustomUrl: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // n8n ping test & connection status state
  const [isTestingN8n, setIsTestingN8n] = useState(false);
  const [n8nTestResult, setN8nTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; isCorsError?: boolean } | null>(null);
  const [allowCustomEndpoint, setAllowCustomEndpoint] = useState(false);

  useEffect(() => {
    if (user) {
      firestoreService.getUserSettings(user.uid).then((data) => {
        // Clear old legacy endpoint if present so it uses the new webhook URL
        if (data.n8nCustomUrl && (data.n8nCustomUrl.includes('d776cf77') || data.n8nCustomUrl === N8N_DEFAULT_WEBHOOK_URL)) {
          data.n8nCustomUrl = '';
        }
        setSettings(data);
        if (data.n8nCustomUrl && data.n8nCustomUrl !== N8N_DEFAULT_WEBHOOK_URL) {
          setAllowCustomEndpoint(true);
        }
        setIsLoading(false);
      });

      // Run initial connection test to display Connection Status
      n8nService.testConnection().then((res) => {
        setN8nTestResult(res);
      }).catch(() => {});
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setErrorNotice(null);
    setSuccessNotice(false);

    try {
      await firestoreService.saveUserSettings(user.uid, settings);
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 3000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestN8n = async () => {
    setIsTestingN8n(true);
    setN8nTestResult(null);
    try {
      const result = await n8nService.testConnection(
        settings.n8nCustomUrl,
        settings.n8nFieldMapping
      );
      setN8nTestResult(result);
    } catch (err: any) {
      setN8nTestResult({ 
        success: false, 
        message: err.message || 'Connection test failed',
        isCorsError: err.message?.includes('CORS')
      });
    } finally {
      setIsTestingN8n(false);
    }
  };

  const currentEndpoint = getEffectiveN8nUrl(settings.n8nCustomUrl) || N8N_DEFAULT_WEBHOOK_URL;
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <header className="h-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl-mirror" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {t('settings.title')}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              {t('settings.subtitle')}
            </p>
          </div>
        </div>

        {/* Right side up controls: Language Selector and Day/Night Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="compact" />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {successNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Settings saved successfully to Firestore!</span>
          </div>
        )}

        {errorNotice && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorNotice}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* n8n Integration Section */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">n8n Integration</h3>
                <p className="text-xs text-slate-400">
                  Production n8n AI Agent Chat Trigger connection
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* N8N Webhook URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    N8N Webhook URL
                  </label>
                  {!allowCustomEndpoint ? (
                    <button
                      type="button"
                      onClick={() => setAllowCustomEndpoint(true)}
                      className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                      title="Developer setting: override endpoint"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Locked (Default)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAllowCustomEndpoint(false);
                        setSettings({ ...settings, n8nCustomUrl: '' });
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>Reset to Production</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    readOnly={!allowCustomEndpoint}
                    value={allowCustomEndpoint ? (settings.n8nCustomUrl ?? '') : N8N_DEFAULT_WEBHOOK_URL}
                    onChange={(e) => setSettings({ ...settings, n8nCustomUrl: e.target.value })}
                    placeholder={N8N_DEFAULT_WEBHOOK_URL}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${
                      allowCustomEndpoint
                        ? 'bg-slate-950 border-indigo-500/50 text-slate-100 focus:border-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-indigo-300 cursor-not-allowed select-all'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Production endpoint for n8n AI Agent with Google Calendar, Gmail, and Google Sheets tools.
                </p>
              </div>

              {/* Connection Status & Test Button */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                      Connection Status
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          n8nTestResult?.success
                            ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50'
                            : n8nTestResult === null
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-rose-400'
                        }`}
                      />
                      <span className="text-sm font-bold text-white">
                        {n8nTestResult?.success
                          ? 'Connected'
                          : n8nTestResult === null
                          ? 'Checking Status...'
                          : 'Not Connected'}
                      </span>
                      {n8nTestResult?.latencyMs && (
                        <span className="text-xs text-slate-500 font-mono">
                          ({n8nTestResult.latencyMs}ms)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Test Connection Button */}
                  <button
                    type="button"
                    onClick={handleTestN8n}
                    disabled={isTestingN8n}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-center shadow-md shadow-indigo-950/40 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingN8n ? 'animate-spin' : ''}`} />
                    <span>{isTestingN8n ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>

                {n8nTestResult && (
                  <div className={`p-3 rounded-lg text-xs border ${
                    n8nTestResult.success
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  }`}>
                    <div className="flex items-start gap-2">
                      {n8nTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <p className="font-medium leading-relaxed">{n8nTestResult.message}</p>
                        {n8nTestResult.isCorsError && (
                          <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                            <strong>How to fix in n8n:</strong> Open your n8n workflow, double-click the <em>"When chat message received"</em> Chat Trigger node, find <strong>Allowed Origins (CORS)</strong>, and add: <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono">{appOrigin}</code>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CORS Notice */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">CORS Configuration:</span>
                <p className="text-[11px] leading-relaxed">
                  Your web application domain is <code className="text-indigo-300 font-mono px-1 py-0.5 rounded bg-slate-900">{appOrigin}</code>. Ensure this domain is included in the n8n Chat Trigger's <strong>Allowed Origins (CORS)</strong> setting in your n8n workflow.
                </p>
              </div>
            </div>
          </div>

          {/* Global Language Support Section */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {t('settings.language')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('settings.languageDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  {t('language.selectLanguage')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = locale === lang.code;
                    return (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => {
                          setLocale(lang.code);
                          setSettings({ ...settings, preferredLanguage: lang.code });
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 text-white font-medium ring-1 ring-indigo-500/30'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                            {lang.code.toUpperCase()}
                          </span>
                          <div>
                            <span className="text-xs font-medium block">{lang.name}</span>
                            <span className="text-[11px] text-slate-400 block font-sans">{lang.nativeName}</span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {lang.dir}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Appearance & Theme (Day / Night mode) */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {t('settings.theme')}
                </h3>
                <p className="text-xs text-slate-400">
                  Switch between Day (Light / White) and Night (Dark / Black) mode
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  setSettings({ ...settings, theme: 'dark' });
                }}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-900 text-indigo-400 border border-slate-800">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold block">{t('settings.themeDark')}</span>
                  <span className="text-[11px] text-slate-400 block">Night mode with deep slate accents</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  setSettings({ ...settings, theme: 'light' });
                }}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold block">{t('settings.themeLight')}</span>
                  <span className="text-[11px] text-slate-400 block">Day mode with crisp white backgrounds</span>
                </div>
              </button>
            </div>
          </div>

          {/* Chat Settings */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Chat Behavior</h3>
                <p className="text-xs text-slate-400">
                  Control messaging hotkeys, display density, and timestamps
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Enter to Send</span>
                  <span className="text-[11px] text-slate-500 block">
                    Pressing Enter dispatches the message; Shift + Enter creates a new line
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enterToSend}
                  onChange={(e) => setSettings({ ...settings, enterToSend: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Show Message Timestamps</span>
                  <span className="text-[11px] text-slate-500 block">
                    Display execution time next to user and assistant messages
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showTimestamps}
                  onChange={(e) => setSettings({ ...settings, showTimestamps: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Compact Chat Mode</span>
                  <span className="text-[11px] text-slate-500 block">
                    Reduces vertical padding for high information density
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <p className="text-xs text-slate-400">
                  Automated email summaries for executed workflows
                </p>
              </div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-medium text-slate-200 block">Activity Notifications</span>
                <span className="text-[11px] text-slate-500 block">
                  Receive email confirmations for automated dispatch events
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-950/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
