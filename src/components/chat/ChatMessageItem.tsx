import React, { useState } from 'react';
import { Bot, User, Copy, Check, RotateCcw, Trash2, Clock, CheckCheck, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ConversationMessage } from '../../types';
import { CalendarEventCard } from './CalendarEventCard';
import { GmailSentCard } from './GmailSentCard';
import { GoogleSheetsCard } from './GoogleSheetsCard';
import { useI18n } from '../../i18n';

interface ChatMessageItemProps {
  message: ConversationMessage;
  onRetry?: (message: ConversationMessage) => void;
  onDelete?: (messageId: string) => void;
  showTimestamps?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRetry,
  onDelete,
  showTimestamps = true,
}) => {
  const { t, formatDate } = useI18n();
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = formatDate(message.createdAt, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex gap-3 my-4 group transition-opacity duration-200 ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="shrink-0 pt-0.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-950/40 text-white ring-1 ring-indigo-400/30">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Message Bubble Container */}
      <div className="max-w-[88%] sm:max-w-[78%] space-y-1.5">
        {/* Header / Timestamp */}
        <div
          className={`flex items-center gap-2 text-[11px] text-slate-400 px-1 ${
            isAssistant ? 'justify-start' : 'justify-end'
          }`}
        >
          <span className="font-semibold text-slate-300">
            {isAssistant ? 'BizMate AI' : 'You'}
          </span>
          {showTimestamps && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3" />
                {formattedTime}
              </span>
            </>
          )}
          {!isAssistant && (
            <span title="Delivered">
              <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
            </span>
          )}
        </div>

        {/* Message Content */}
        <div
          dir="auto"
          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all relative unicode-isolate ${
            isAssistant
              ? 'bg-slate-900/90 text-slate-100 border border-slate-800/80 rounded-tl-sm backdrop-blur-sm'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-indigo-950/50'
          }`}
        >
          {/* Markdown Content */}
          <div className="prose prose-invert prose-sm max-w-none break-words">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                code: ({ children }) => (
                  <code className="bg-slate-950/80 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto my-2 text-xs font-mono text-slate-200">
                    {children}
                  </pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Structured Cards from n8n tools */}
          {message.structuredData?.type === 'calendar' && message.structuredData.calendarEvent && (
            <CalendarEventCard data={message.structuredData.calendarEvent} />
          )}

          {message.structuredData?.type === 'gmail' && message.structuredData.gmailSent && (
            <GmailSentCard data={message.structuredData.gmailSent} />
          )}

          {message.structuredData?.type === 'sheets' && message.structuredData.googleSheets && (
            <GoogleSheetsCard data={message.structuredData.googleSheets} />
          )}
        </div>

        {/* Message Actions */}
        <div
          className={`flex items-center gap-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isAssistant ? 'justify-start' : 'justify-end'
          }`}
        >
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy message"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {isAssistant && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(message)}
              className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Regenerate response from n8n"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[10px]">Retry</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(message.id)}
              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 text-[11px] transition-colors cursor-pointer"
              title="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="shrink-0 pt-0.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
