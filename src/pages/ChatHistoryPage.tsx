import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Clock, 
  Plus, 
  ArrowLeft, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { Conversation } from '../types';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const ChatHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      firestoreService.getConversations(user.uid).then((convs) => {
        setConversations(convs);
        setIsLoading(false);
      });
    }
  }, [user]);

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.lastMessageSnippet && c.lastMessageSnippet.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNewChat = async () => {
    if (!user) return;
    const newConv = await firestoreService.createConversation(user.uid, 'New Conversation');
    navigate(`/chat/${newConv.id}`);
  };

  const handleSaveRename = async (id: string) => {
    if (!user || !editTitle.trim()) return;
    await firestoreService.updateConversation(user.uid, id, { title: editTitle.trim() });
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: editTitle.trim() } : c))
    );
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await firestoreService.deleteConversation(user.uid, id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      {/* Header */}
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
              Conversation History
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Search & manage previous chats
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="compact" />
          <ThemeToggle />

          <button
            onClick={handleNewChat}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950/40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations by title or message preview..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Conversation List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading chat archives...
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    {editingId === c.id ? (
                      <div className="flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-slate-950 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(c.id)}
                          className="p-1 hover:text-emerald-400 text-slate-400"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 hover:text-red-400 text-slate-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3
                        onClick={() => navigate(`/chat/${c.id}`)}
                        className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer truncate"
                      >
                        {c.title}
                      </h3>
                    )}

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {c.lastMessageSnippet || 'No preview available'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(c.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>{c.messageCount || 0} messages</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => navigate(`/chat/${c.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Open Chat
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditTitle(c.title);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Rename conversation"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {deleteConfirmId === c.id ? (
                    <div className="flex items-center gap-1 p-1 bg-red-950/80 rounded-lg border border-red-500/40 text-xs">
                      <span className="text-[10px] text-red-300 px-1">Delete?</span>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-red-400 hover:text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No conversations found</p>
              <p className="text-xs text-slate-500">
                {searchTerm ? 'Try a different search keyword.' : 'Start your first chat with the n8n assistant.'}
              </p>
              <button
                onClick={handleNewChat}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
              >
                Create New Chat
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
