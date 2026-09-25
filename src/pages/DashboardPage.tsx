import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  MessageSquare, 
  Calendar, 
  Mail, 
  Table, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Database,
  Cpu,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { n8nService } from '../services/n8nService';
import { Conversation } from '../types';
import { useI18n } from '../i18n';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const DashboardPage: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const { t, formatDate, formatNumber } = useI18n();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState({ totalConversations: 0, totalMessages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [n8nStatus, setN8nStatus] = useState<'checking' | 'connected' | 'not_connected'>('checking');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      Promise.all([
        firestoreService.getConversations(user.uid),
        firestoreService.getUserStats(user.uid),
      ]).then(([convs, userStats]) => {
        setConversations(convs);
        setStats(userStats);
        setIsLoading(false);
      });
    }
  }, [user]);

  // Test real connection to n8n Webhook endpoint
  useEffect(() => {
    let isMounted = true;
    n8nService.testConnection()
      .then((res) => {
        if (isMounted) {
          setN8nStatus(res.success ? 'connected' : 'not_connected');
        }
      })
      .catch(() => {
        if (isMounted) {
          setN8nStatus('not_connected');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickAction = async (prompt?: string) => {
    if (!user) return;
    if (!prompt) {
      // 1. Ask AI -> Open the chat
      navigate('/chat');
      return;
    }
    // 2. Create Calendar Event ("Create a Google Calendar event for me.")
    // 3. Send Email ("Help me send an email.")
    // 4. Search Google Sheets ("Search my Google Sheets.")
    try {
      const title = firestoreService.generateTitle(prompt);
      const newConv = await firestoreService.createConversation(user.uid, title);
      navigate(`/chat/${newConv.id}`, { state: { initialPrompt: prompt, autoSend: true } });
    } catch (err) {
      console.error('Error starting quick action:', err);
      navigate('/chat', { state: { initialPrompt: prompt, autoSend: true } });
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    const newConv = await firestoreService.createConversation(user.uid, 'New Conversation');
    navigate(`/chat/${newConv.id}`);
  };

  const quickActions = [
    {
      id: 'askAi',
      title: t('dashboard.askAi'),
      bengaliSubtitle: 'General intelligence & strategy',
      desc: t('dashboard.askAiDesc'),
      icon: <Bot className="w-5 h-5 text-indigo-400" />,
      prompt: '',
      badge: 'OpenAI Reasoning',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    },
    {
      id: 'calendar',
      title: t('dashboard.calendar'),
      bengaliSubtitle: 'Google Calendar booking tool',
      desc: t('dashboard.calendarDesc'),
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      prompt: 'Create a Google Calendar event for me.',
      badge: 'Google Calendar Tool',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    },
    {
      id: 'email',
      title: t('dashboard.email'),
      bengaliSubtitle: 'Gmail client notifications',
      desc: t('dashboard.emailDesc'),
      icon: <Mail className="w-5 h-5 text-red-400" />,
      prompt: 'Help me send an email.',
      badge: 'Gmail Tool',
      badgeColor: 'bg-red-500/10 text-red-300 border-red-500/20',
    },
    {
      id: 'sheets',
      title: t('dashboard.sheets'),
      bengaliSubtitle: 'Google Sheets queries',
      desc: t('dashboard.sheetsDesc'),
      icon: <Table className="w-5 h-5 text-emerald-400" />,
      prompt: 'Search my Google Sheets.',
      badge: 'Google Sheets Tool',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <header className="h-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              BizMate AI
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              {t('sidebar.dashboard')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Global Language Selector */}
          <LanguageSelector variant="compact" />

          {/* Day / Night mode toggle */}
          <ThemeToggle />

          <Link
            to="/chat"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">{t('sidebar.chat')}</span>
          </Link>
          
          <Link
            to="/settings"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={t('sidebar.settings')}
          >
            <Activity className="w-4 h-4" />
          </Link>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 overflow-hidden">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{userProfile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
              )}
            </div>
            <button
              onClick={() => logout()}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors hidden sm:block cursor-pointer"
            >
              {t('sidebar.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('tagline')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t('dashboard.welcome')} {userProfile?.name || 'Business Owner'}
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 shrink-0">
            <button
              onClick={handleNewChat}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('dashboard.startNewSession')}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('dashboard.statsConversations')}</span>
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatNumber(stats.totalConversations)}</p>
            <p className="text-[11px] text-slate-500 font-mono">Firebase Firestore</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('dashboard.statsMessages')}</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatNumber(stats.totalMessages)}</p>
            <p className="text-[11px] text-slate-500 font-mono">n8n AI Agent</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Firebase Database</span>
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-base font-bold text-white">{t('common.connected')}</p>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">Firestore Rules Active</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>n8n Webhook</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  n8nStatus === 'connected'
                    ? 'bg-emerald-400'
                    : n8nStatus === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-400'
                }`}
              />
              <p className="text-base font-bold text-white truncate">
                {n8nStatus === 'connected'
                  ? t('common.connected')
                  : n8nStatus === 'checking'
                  ? t('common.loading')
                  : t('common.notConnected')}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              {n8nStatus === 'connected' ? t('dashboard.workflowLive') : t('dashboard.workflowOffline')}
            </p>
          </div>
        </div>

        {/* Quick Action Cards Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{t('dashboard.quickActionsTitle')}</h3>
              <p className="text-xs text-slate-400">
                {t('dashboard.quickActionsSubtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((act) => (
              <div
                key={act.id}
                onClick={() => handleQuickAction(act.prompt)}
                className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-105 transition-transform">
                      {act.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {act.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {act.bengaliSubtitle}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {act.desc}
                </p>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200">
                  <span className="font-mono text-[11px] truncate max-w-[260px]">
                    {act.prompt ? `"${act.prompt}"` : t('dashboard.openConversation')}
                  </span>
                  <div className="flex items-center gap-1 text-indigo-400 text-xs font-semibold group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
                    <span>{t('dashboard.openConversation')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl-mirror" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{t('dashboard.recentConversations')}</h3>
            <Link to="/chat" className="text-xs text-indigo-400 hover:underline">
              {t('dashboard.viewAll')}
            </Link>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden divide-y divide-slate-800/60">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {t('common.loading')}
              </div>
            ) : conversations.length > 0 ? (
              conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className="p-4 hover:bg-slate-800/40 transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="truncate text-left rtl:text-right">
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {conv.lastMessageSnippet || t('sidebar.noConversations')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      {formatDate(conv.updatedAt)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 rtl-mirror" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-slate-400">{t('sidebar.noConversations')}</p>
                <button
                  onClick={handleNewChat}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium cursor-pointer"
                >
                  {t('dashboard.startNewSession')}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
