import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bot,
  Menu, 
  Sparkles, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Cpu, 
  CheckCircle2, 
  RefreshCw,
  Share2,
  Table,
  Calendar,
  Mail,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { n8nService } from '../services/n8nService';
import { Conversation, ConversationMessage, UserSettings } from '../types';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessageItem } from '../components/chat/ChatMessageItem';
import { ChatInput } from '../components/chat/ChatInput';
import { getEffectiveN8nUrl } from '../config/n8nConfig';
import { useI18n } from '../i18n';
import { LanguageSelector } from '../components/common/LanguageSelector';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user, userProfile, logout } = useAuth();
  const { t, locale, detectInputLanguage } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(t('chat.thinking'));
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [initialPromptToLoad, setInitialPromptToLoad] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasAutoSentRef = useRef<string | null>(null);

  // Check if incoming from dashboard with an initialPrompt state
  useEffect(() => {
    const state = location.state as { initialPrompt?: string; autoSend?: boolean } | undefined;
    if (state?.initialPrompt) {
      if (
        state.autoSend && 
        hasAutoSentRef.current !== state.initialPrompt && 
        currentConversation && 
        user && 
        !isLoading
      ) {
        hasAutoSentRef.current = state.initialPrompt;
        const promptToSend = state.initialPrompt;
        window.history.replaceState({}, document.title);
        handleSendMessage(promptToSend);
      } else if (!state.autoSend) {
        setInitialPromptToLoad(state.initialPrompt);
      }
    }
  }, [location.state, currentConversation, user, isLoading]);

  // Load conversations list and settings
  useEffect(() => {
    if (user) {
      firestoreService.getConversations(user.uid).then(setConversations);
      firestoreService.getUserSettings(user.uid).then(setUserSettings);
    }
  }, [user]);

  // Handle conversation selection or creation
  useEffect(() => {
    if (!user) return;

    if (conversationId) {
      // Load specific conversation
      firestoreService.getConversation(user.uid, conversationId).then(async (conv) => {
        if (conv) {
          setCurrentConversation(conv);
          const msgs = await firestoreService.getMessages(user.uid, conv.id);
          setMessages(msgs);
        } else {
          // If ID not found, create new
          handleNewChat();
        }
      });
    } else {
      // If no ID in URL, either pick the newest or create a new one
      firestoreService.getConversations(user.uid).then(async (convs) => {
        if (convs.length > 0) {
          navigate(`/chat/${convs[0].id}`, { replace: true });
        } else {
          handleNewChat();
        }
      });
    }
  }, [user, conversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isLoading]);

  // Create new chat session (Start New Session)
  const handleNewChat = async () => {
    if (!user) return;
    try {
      const newConv = await firestoreService.createConversation(user.uid, 'New Conversation');
      setConversations((prev) => [newConv, ...prev]);
      navigate(`/chat/${newConv.id}`);
      setMessages([]);
      setErrorNotice(null);
      setStreamingText(null);
      setLastFailedMessage(null);
    } catch (err) {
      console.error('Error creating new conversation:', err);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    if (!user) return;
    try {
      await firestoreService.deleteConversation(user.uid, id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversation?.id === id) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // Rename conversation
  const handleRenameConversation = async (id: string, newTitle: string) => {
    if (!user) return;
    try {
      await firestoreService.updateConversation(user.uid, id, { title: newTitle });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
      if (currentConversation?.id === id) {
        setCurrentConversation((prev: Conversation | null) => (prev ? { ...prev, title: newTitle } : null));
      }
    } catch (err) {
      console.error('Error renaming conversation:', err);
    }
  };

  // Send message to n8n AI Agent Chat Trigger
  const handleSendMessage = async (text: string) => {
    if (!user || !currentConversation || !text.trim() || isLoading) return;

    setErrorNotice(null);
    setLastFailedMessage(null);
    setInitialPromptToLoad('');
    setStreamingText(null);
    setLoadingText(t('chat.thinking'));

    const detectedLang = detectInputLanguage(text.trim());

    // 1. Add user message to UI & Firestore
    const userMsg = await firestoreService.addMessage(user.uid, currentConversation.id, {
      role: 'user',
      content: text.trim(),
      status: 'sent',
      language: detectedLang,
    });

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Dispatch to n8n AI Agent service with streaming support
      const n8nResult = await n8nService.sendMessage(
        {
          chatInput: text.trim(),
          sessionId: currentConversation.id,
          userId: user.uid,
          userEmail: user.email || '',
          userName: userProfile?.name || user.displayName || 'Owner',
          language: detectedLang,
          userLocale: locale,
        },
        userSettings?.n8nCustomUrl,
        userSettings?.n8nFieldMapping,
        (chunk, accumulated) => {
          setStreamingText(accumulated);
        }
      );

      // 3. Clear streaming temporary text and save assistant message to Firestore
      setStreamingText(null);
      const assistantMsg = await firestoreService.addMessage(user.uid, currentConversation.id, {
        role: 'assistant',
        content: n8nResult.text,
        status: 'delivered',
        language: detectedLang,
        ...(n8nResult.structuredData !== undefined ? { structuredData: n8nResult.structuredData } : {}),
      });

      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh conversations list to update title and snippet
      firestoreService.getConversations(user.uid).then(setConversations);
    } catch (err: any) {
      console.error('n8n dispatch error:', err);
      setStreamingText(null);
      const friendlyError = err.message || t('chat.errorConnection');
      setErrorNotice(friendlyError);
      setLastFailedMessage(text.trim());

      // Add friendly error message to chat
      const errorMsg = await firestoreService.addMessage(user.uid, currentConversation.id, {
        role: 'assistant',
        content: `⚠️ ${friendlyError}`,
        status: 'error',
        language: detectedLang,
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setStreamingText(null);
    }
  };

  // Retry sending last failed message
  const handleRetry = () => {
    if (lastFailedMessage) {
      const msg = lastFailedMessage;
      setLastFailedMessage(null);
      setErrorNotice(null);
      handleSendMessage(msg);
    }
  };

  // Stop generating
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setStreamingText(null);
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!user || !currentConversation) return;
    await firestoreService.deleteMessage(user.uid, currentConversation.id, messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // Clear entire conversation
  const handleClearConversation = async () => {
    if (!user || !currentConversation) return;
    if (window.confirm('Are you sure you want to clear all messages in this conversation?')) {
      await firestoreService.clearMessages(user.uid, currentConversation.id);
      setMessages([]);
    }
  };

  // Export conversations
  const handleExportText = () => {
    if (!messages.length) return;
    const transcript = messages
      .map((m) => `[${m.role.toUpperCase()} - ${new Date(m.createdAt).toLocaleString()}]:\n${m.content}\n`)
      .join('\n---\n\n');

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BizMate_Chat_${currentConversation?.title?.replace(/\s+/g, '_') || 'Session'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = () => {
    if (!messages.length) return;
    const transcript = messages.map((m) => `${m.role === 'user' ? 'You' : 'BizMate AI'}: ${m.content}`).join('\n\n');
    navigator.clipboard.writeText(transcript);
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#0a0e17] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar for Desktop & Mobile */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={currentConversation?.id}
        onSelectConversation={(id) => navigate(`/chat/${id}`)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        userProfile={userProfile}
        onLogout={logout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0e17] relative">
        {/* Header */}
        <header className="h-16 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between gap-4 z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white truncate">
                  {currentConversation?.title || 'BizMate AI Assistant'}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Session: {currentConversation?.id || 'Initializing...'}
              </p>
            </div>
          </div>

          {/* Action Tools & Language Selector in Header */}
          <div className="flex items-center gap-2">
            <LanguageSelector variant="compact" />

            <button
              onClick={handleCopyAll}
              disabled={!messages.length}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-40"
              title={t('common.copy')}
            >
              {isCopiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleExportText}
              disabled={!messages.length}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-40"
              title={t('chat.exportChat')}
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleClearConversation}
              disabled={!messages.length}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors disabled:opacity-40"
              title={t('chat.clearChat')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Error Notice with Retry */}
        {errorNotice && (
          <div className="px-4 py-2.5 bg-rose-950/40 border-b border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="truncate">{errorNotice}</span>
            </div>
            {lastFailedMessage && (
              <button
                onClick={handleRetry}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-white font-medium text-[11px] flex items-center gap-1 border border-rose-700/50 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3 rtl-mirror" />
                <span>{t('common.retry')}</span>
              </button>
            )}
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              /* Empty state / Welcome prompt cards */
              <div className="py-12 sm:py-16 text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-950/60 border border-indigo-400/20">
                  <Bot className="w-8 h-8" />
                </div>
                
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {t('chat.emptyTitle')}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t('chat.emptySubtitle')}
                  </p>
                </div>

                {/* Example Quick Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto pt-4 text-left rtl:text-right">
                  <button
                    onClick={() => handleSendMessage(t('chat.prompt1'))}
                    className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left rtl:text-right transition-all group"
                  >
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Google Calendar</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      "{t('chat.prompt1')}"
                    </p>
                  </button>

                  <button
                    onClick={() => handleSendMessage(t('chat.prompt2'))}
                    className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left rtl:text-right transition-all group"
                  >
                    <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Gmail Dispatch</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      "{t('chat.prompt2')}"
                    </p>
                  </button>

                  <button
                    onClick={() => handleSendMessage(t('chat.prompt3'))}
                    className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left rtl:text-right transition-all group"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                      <Table className="w-3.5 h-3.5" />
                      <span>Google Sheets</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      "{t('chat.prompt3')}"
                    </p>
                  </button>

                  <button
                    onClick={() => handleSendMessage(t('chat.prompt4'))}
                    className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left rtl:text-right transition-all group"
                  >
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Business Priorities</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      "{t('chat.prompt4')}"
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              /* Message list */
              messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  onRetry={() => handleSendMessage(lastFailedMessage || msg.content)}
                  onDelete={handleDeleteMessage}
                  showTimestamps={userSettings?.showTimestamps ?? true}
                />
              ))
            )}

            {/* Live Streamed Progress Output */}
            {streamingText && (
              <div className="flex gap-3 my-4 justify-start">
                <div className="shrink-0 pt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-950/40 text-white">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="max-w-[88%] sm:max-w-[78%] space-y-1.5">
                  <div className="text-[11px] text-slate-400 px-1 font-semibold text-slate-300">
                    BizMate AI (Streaming)
                  </div>
                  <div className="p-4 rounded-2xl text-sm leading-relaxed bg-slate-900/90 text-slate-100 border border-slate-800/80 rounded-tl-sm backdrop-blur-sm whitespace-pre-wrap">
                    {streamingText}
                    <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && !streamingText && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 max-w-xs animate-pulse">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-200">
                    {loadingText}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    n8n AI Agent Workflow
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopGenerating={handleStopGenerating}
          initialPrompt={initialPromptToLoad}
        />
      </div>
    </div>
  );
};
