import React from 'react';
import { 
  Bot, 
  Mail, 
  Calendar, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building2,
  RefreshCw,
  LogIn
} from 'lucide-react';
import { User as FirebaseUser, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { IntegrationItem } from '../types';

interface SidebarProps {
  integrations: IntegrationItem[];
  onTriggerQuickAction: (actionKey: 'draft_email' | 'schedule_meeting' | 'check_invoices' | 'add_order') => void;
  onOpenIntegrations: () => void;
  onOpenOrdersSheet: () => void;
  pendingApprovalsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  user: FirebaseUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  integrations,
  onTriggerQuickAction,
  onOpenIntegrations,
  onOpenOrdersSheet,
  pendingApprovalsCount,
  isOpenMobile,
  onCloseMobile,
  user,
}) => {
  const handleQuickSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-slate-950/95 lg:bg-slate-950/80 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out backdrop-blur-xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Brand Header */}
          <div className="pb-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 ring-1 ring-indigo-400/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                    BizMate AI
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      v2.4
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400">Autonomous Business Ops</p>
                </div>
              </div>
            </div>

            {/* Active Status Badge ("Connected to Workflow") */}
            <div className="mt-3.5 px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-300">
                  Connected to Workflow
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-900/40 px-1.5 py-0.5 rounded">
                Live
              </span>
            </div>

            {/* Business Profile selector info */}
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 px-1">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate text-slate-300 font-medium">Apex Retail & Crafts Ltd.</span>
              </div>
              <span className="text-[11px] text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-800/40">
                PRO
              </span>
            </div>
          </div>

          {/* Quick Action Shortcuts (Buttons) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              <span>Quick Action Shortcuts</span>
              <span className="text-[11px] font-normal lowercase text-slate-500">Instant AI trigger</span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {/* Draft Email */}
              <button
                type="button"
                onClick={() => onTriggerQuickAction('draft_email')}
                className="w-full group px-3.5 py-2.5 rounded-xl bg-slate-900/70 hover:bg-indigo-950/40 border border-slate-800/90 hover:border-indigo-500/40 text-left transition-all duration-150 flex items-center justify-between cursor-pointer hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white block">
                      Draft Email
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      ইমেইল ড্রাফট ও রিমাইন্ডার
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Schedule Meeting */}
              <button
                type="button"
                onClick={() => onTriggerQuickAction('schedule_meeting')}
                className="w-full group px-3.5 py-2.5 rounded-xl bg-slate-900/70 hover:bg-indigo-950/40 border border-slate-800/90 hover:border-indigo-500/40 text-left transition-all duration-150 flex items-center justify-between cursor-pointer hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white block">
                      Schedule Meeting
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      মিটিং শিডিউল (Google Meet)
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Check Invoices / Orders */}
              <button
                type="button"
                onClick={() => onTriggerQuickAction('check_invoices')}
                className="w-full group px-3.5 py-2.5 rounded-xl bg-slate-900/70 hover:bg-indigo-950/40 border border-slate-800/90 hover:border-indigo-500/40 text-left transition-all duration-150 flex items-center justify-between cursor-pointer hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white block">
                      Check Invoices / Orders
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      ইনভয়েস ও বকেয়া হিসাব
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Add New Order */}
              <button
                type="button"
                onClick={() => onTriggerQuickAction('add_order')}
                className="w-full group px-3.5 py-2.5 rounded-xl bg-slate-900/70 hover:bg-indigo-950/40 border border-slate-800/90 hover:border-indigo-500/40 text-left transition-all duration-150 flex items-center justify-between cursor-pointer hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white block">
                      Add New Order
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      নতুন অর্ডার যোগ (Auto Sheet)
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Connected Integrations Status Widget */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              <span>Connected Integrations</span>
              <button
                onClick={onOpenIntegrations}
                className="text-[11px] font-normal text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 space-y-3">
              {integrations.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {/* Small Green Indicator */}
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="font-medium text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    Connected
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  OAuth sync: Real-time
                </span>
                <button
                  onClick={onOpenOrdersSheet}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Inspect Sheet ↗
                </button>
              </div>
            </div>
          </div>

          {/* Autonomous Operations Stats */}
          <div className="bg-gradient-to-br from-slate-900/90 to-indigo-950/30 rounded-xl p-3 border border-indigo-900/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Daily Impact</span>
              <span className="text-[11px] text-indigo-300 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Today
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block">Automations</span>
                <span className="text-base font-bold text-white">28 tasks</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block">Time Saved</span>
                <span className="text-base font-bold text-emerald-400">~3.4 hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / User Controls & Firebase Auth Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2">
          {user ? (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/40 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="truncate text-left">
                  <span className="font-medium text-slate-200 block text-xs truncate">
                    {user.displayName || 'Authenticated Owner'}
                  </span>
                  <span className="text-[10px] text-emerald-400 block truncate font-mono">
                    Firebase Cloud Sync
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                Active
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickSignIn}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-950/50 cursor-pointer active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Firebase Login / Sign Up</span>
            </button>
          )}

          <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-400">Human-in-the-Loop</span>
            </div>
            {pendingApprovalsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                {pendingApprovalsCount} Pending
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
