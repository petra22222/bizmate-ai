import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2, 
  Edit3, 
  LayoutDashboard, 
  History, 
  Settings, 
  HelpCircle, 
  Activity, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Check, 
  X,
  Bot
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Conversation, UserProfile } from '../../types';
import { useI18n } from '../../i18n';
import { LanguageSelector } from '../common/LanguageSelector';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  userProfile,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const location = useLocation();
  const { t } = useI18n();

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const startEditing = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
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
        {/* Top Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-base tracking-tight block">
                  BizMate AI
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {t('tagline')}
                </span>
              </div>
            </Link>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-md shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('sidebar.newChat')}</span>
          </button>

          {/* Search Conversations Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('sidebar.searchConversations')}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Recent Conversations List */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 py-1">
              <span>{t('dashboard.recentConversations')}</span>
              <span className="text-[10px] font-mono text-slate-500">
                {conversations.length}
              </span>
            </div>

            <div className="space-y-1 max-h-[38vh] overflow-y-auto pr-1">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((c) => {
                  const isActive = c.id === activeConversationId;
                  const isEditing = editingId === c.id;
                  const isConfirmingDelete = confirmDeleteId === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectConversation(c.id);
                        onCloseMobile();
                      }}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/20 text-white font-medium border border-indigo-500/40 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate">{c.title}</span>
                        )}
                      </div>

                      {/* Action buttons (Rename, Delete) */}
                      {isEditing ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => saveEditing(c.id, e)}
                            className="p-1 hover:text-emerald-400 text-slate-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 hover:text-red-400 text-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : isConfirmingDelete ? (
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] text-red-400 font-semibold">Delete?</span>
                          <button
                            onClick={() => {
                              onDeleteConversation(c.id);
                              setConfirmDeleteId(null);
                            }}
                            className="p-1 text-red-400 hover:text-red-300 font-bold"
                            title="Confirm delete"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => startEditing(c, e)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Rename"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(c.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-slate-500 text-xs">
                  {searchTerm ? 'No matching chats' : 'No previous conversations'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Links & User Profile */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2">
          {/* Global Language Selector in Sidebar */}
          <div className="pb-1">
            <LanguageSelector variant="settings" />
          </div>

          {/* Quick Page Links */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors ${
                location.pathname === '/dashboard' ? 'bg-slate-900 text-white font-medium' : ''
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('sidebar.dashboard')}</span>
            </Link>
            <Link
              to="/history"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors ${
                location.pathname === '/history' ? 'bg-slate-900 text-white font-medium' : ''
              }`}
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('sidebar.history')}</span>
            </Link>
            <Link
              to="/usage"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors ${
                location.pathname === '/usage' ? 'bg-slate-900 text-white font-medium' : ''
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('sidebar.usage')}</span>
            </Link>
            <Link
              to="/settings"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors ${
                location.pathname === '/settings' ? 'bg-slate-900 text-white font-medium' : ''
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('sidebar.settings')}</span>
            </Link>
          </div>

          {/* Admin link if role is admin */}
          {userProfile?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('sidebar.admin')}</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-1.5 rounded bg-indigo-500/20">
                Staff
              </span>
            </Link>
          )}

          {/* User Profile & Logout */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <Link
              to="/profile"
              className="flex items-center gap-2 text-xs truncate hover:text-white group flex-1 mr-2 rtl:mr-0 rtl:ml-2"
            >
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/40 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                  {userProfile?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="truncate text-left rtl:text-right">
                <p className="font-medium text-slate-200 group-hover:text-white truncate">
                  {userProfile?.name || 'Business Owner'}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-mono">
                  {userProfile?.email || ''}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
              title={t('sidebar.logout')}
            >
              <LogOut className="w-4 h-4 rtl-mirror" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
