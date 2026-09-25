import React from 'react';
import { Bot, User, Sparkles, Clock, CheckCheck, FileText } from 'lucide-react';
import { ChatMessageItem } from '../types';
import { ActionApprovalCard } from './ActionApprovalCard';

interface ChatMessageProps {
  message: ChatMessageItem;
  onConfirmAction: (actionId: string) => void;
  onCancelAction: (actionId: string) => void;
  language: 'bn' | 'en' | 'bilingual';
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onConfirmAction,
  onCancelAction,
  language,
}) => {
  const isAssistant = message.sender === 'assistant';

  return (
    <div
      className={`flex gap-3 my-4 group transition-opacity duration-200 ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="shrink-0 pt-0.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-900/30 text-white ring-2 ring-indigo-400/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Message Content Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
        {/* Sender Name & Timestamp */}
        <div
          className={`flex items-center gap-2 text-[11px] text-slate-400 px-1 ${
            isAssistant ? 'justify-start' : 'justify-end'
          }`}
        >
          <span className="font-semibold text-slate-300">
            {isAssistant ? 'BizMate AI' : 'Business Owner (You)'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {message.timestamp}
          </span>
          {!isAssistant && (
            <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
          )}
        </div>

        {/* Message Bubble */}
        <div
          dir="auto"
          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all unicode-isolate ${
            isAssistant
              ? 'bg-slate-900/90 text-slate-100 border border-slate-800/80 rounded-tl-sm backdrop-blur-sm'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-indigo-950/50'
          }`}
        >
          {/* Main English / Primary Text */}
          {message.text && (
            <div className="font-normal whitespace-pre-wrap">
              {message.text}
            </div>
          )}

          {/* Bengali text translation/native note if available */}
          {message.bengaliText && (
            <div
              className={`mt-2 pt-2 border-t text-sm leading-relaxed font-normal ${
                isAssistant
                  ? 'border-slate-800/80 text-indigo-200/90'
                  : 'border-white/20 text-indigo-100'
              }`}
            >
              {message.bengaliText}
            </div>
          )}

          {/* Key-Value Summary Grid */}
          {message.keyValues && message.keyValues.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/70 text-xs">
              {message.keyValues.map((kv: { label: string; value: string; highlight?: boolean }, idx: number) => (
                <div
                  key={idx}
                  className="p-1.5 rounded bg-slate-900/40 border border-slate-800/50"
                >
                  <span className="text-slate-400 text-[11px] block">{kv.label}</span>
                  <span
                    className={`font-semibold ${
                      kv.highlight ? 'text-amber-400 text-sm' : 'text-slate-200'
                    }`}
                  >
                    {kv.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Structured Table if present */}
          {message.summaryTable && (
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                  <tr>
                    {message.summaryTable.headers.map((h: string, i: number) => (
                      <th key={i} className="px-3 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {message.summaryTable.rows.map((row: (string | number)[], rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-900/40">
                      {row.map((cell: string | number, cIdx: number) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-200">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Optional Tags */}
          {message.tags && message.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 pt-1">
              {message.tags.map((t: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Approval Card (Directly in chat stream) */}
        {message.actionApproval && (
          <ActionApprovalCard
            action={message.actionApproval}
            onConfirm={onConfirmAction}
            onCancel={onCancelAction}
            language={language}
          />
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="shrink-0 pt-0.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs shadow-sm">
            <span>ME</span>
          </div>
        </div>
      )}
    </div>
  );
};
