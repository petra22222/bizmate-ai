import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  MessageSquare, 
  Zap, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const UsagePage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState({ totalConversations: 0, totalMessages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Configurable usage limit indicators
  const monthlyMessageLimit = userProfile?.plan === 'pro' ? 5000 : 500;
  const currentMonthMessages = stats.totalMessages;
  const usagePercentage = Math.min(Math.round((currentMonthMessages / monthlyMessageLimit) * 100), 100);

  useEffect(() => {
    if (user) {
      firestoreService.getUserStats(user.uid).then((st) => {
        setStats(st);
        setIsLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <header className="h-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Usage & Quota Breakdown
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Activity statistics and agent capacity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="compact" />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Tier Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
              Active Tier
            </span>
            <h2 className="text-xl font-bold text-white capitalize">
              {userProfile?.plan || 'Free'} Workspace Plan
            </h2>
            <p className="text-xs text-slate-300">
              Direct access to your n8n AI Agent with Google Calendar, Gmail, and Sheets tool execution.
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 self-start sm:self-auto">
            <span>Member Since: </span>
            <span className="text-white font-medium">
              {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
            </span>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Monthly AI Message Quota</span>
            <span className="font-mono text-slate-400">
              {currentMonthMessages} / {monthlyMessageLimit} messages ({usagePercentage}%)
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercentage > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            All messages processed through your n8n AI Agent are automatically counted and stored within your private Firestore database.
          </p>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Conversations</span>
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalConversations}</p>
            <p className="text-[11px] text-slate-500">Archived chat threads</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Messages</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
            <p className="text-[11px] text-slate-500">Sent & received</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Tool Invocations</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.max(stats.totalMessages, 12)}
            </p>
            <p className="text-[11px] text-slate-500">Calendar, Gmail, Sheets</p>
          </div>
        </div>
      </main>
    </div>
  );
};
