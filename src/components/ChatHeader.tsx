import React from 'react';
import { 
  Bot, 
  Menu, 
  Sparkles, 
  Languages, 
  RefreshCw, 
  Table, 
  Radio, 
  SlidersHorizontal,
  Volume2,
  VolumeX
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { FirebaseAuthButton } from './FirebaseAuthButton';
import { LanguageSelector } from './common/LanguageSelector';
import { ThemeToggle } from './common/ThemeToggle';
import { useI18n } from '../i18n';

interface ChatHeaderProps {
  onToggleMobileSidebar: () => void;
  language?: string;
  onChangeLanguage?: (lang: any) => void;
  onResetChat: () => void;
  onOpenOrdersSheet: () => void;
  isAudioFeedbackEnabled: boolean;
  onToggleAudio: () => void;
  activeActionsCount: number;
  user: FirebaseUser | null;
  isLoadingAuth: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleMobileSidebar,
  language,
  onChangeLanguage,
  onResetChat,
  onOpenOrdersSheet,
  isAudioFeedbackEnabled,
  onToggleAudio,
  activeActionsCount,
  user,
  isLoadingAuth,
}) => {
  const { t } = useI18n();

  return (
    <header className="h-16 px-4 lg:px-6 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Mobile Toggle & Session Info */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white tracking-tight">
              BizMate Ops Assistant
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('common.active')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="truncate max-w-[150px] sm:max-w-xs">
              Session #BM-408 • Workflow Dispatcher
            </span>
            {activeActionsCount > 0 && (
              <span className="text-amber-400 text-[11px] font-medium">
                ({activeActionsCount} {t('sidebar.approvalsRequired')})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Controls, Language Selector & Auth */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Orders Sheet Viewer Shortcut */}
        <button
          type="button"
          onClick={onOpenOrdersSheet}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          title={t('sidebar.viewSheet')}
        >
          <Table className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('sidebar.viewSheet')}</span>
        </button>

        {/* Audio speech synthesis toggle */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={`hidden sm:flex p-2 rounded-lg text-xs border transition-colors cursor-pointer ${
            isAudioFeedbackEnabled
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title={isAudioFeedbackEnabled ? 'Voice reads output (Active)' : 'Voice audio muted'}
        >
          {isAudioFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Global Language Selector Dropdown */}
        <LanguageSelector variant="compact" />

        {/* Day / Night mode toggle */}
        <ThemeToggle />

        {/* Reset Chat */}
        <button
          type="button"
          onClick={onResetChat}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Reset sample conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Firebase Login / Signup Button */}
        <FirebaseAuthButton
          user={user}
          isLoadingAuth={isLoadingAuth}
        />
      </div>
    </header>
  );
};
