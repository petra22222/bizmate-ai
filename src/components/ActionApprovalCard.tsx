import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Mail, 
  Calendar, 
  Table, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { ActionApprovalPayload } from '../types';

interface ActionApprovalCardProps {
  action: ActionApprovalPayload;
  onConfirm: (actionId: string) => void;
  onCancel: (actionId: string) => void;
  language?: 'bn' | 'en' | 'bilingual';
}

export const ActionApprovalCard: React.FC<ActionApprovalCardProps> = ({
  action,
  onConfirm,
  onCancel,
  language = 'bilingual',
}) => {
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(action.details.bodyPreview || '');

  const getServiceBadge = () => {
    switch (action.service) {
      case 'Gmail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <Mail className="w-3.5 h-3.5 text-red-400" />
            Gmail Integration
          </span>
        );
      case 'Google Calendar':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Google Calendar
          </span>
        );
      case 'Google Sheets':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            Google Sheets
          </span>
        );
      default:
        return null;
    }
  };

  const isPending = action.status === 'pending';
  const isExecuting = action.status === 'executing';
  const isConfirmed = action.status === 'confirmed';
  const isCancelled = action.status === 'cancelled';

  return (
    <div className={`mt-3 rounded-xl border transition-all duration-200 overflow-hidden shadow-lg ${
      isPending
        ? 'border-indigo-500/40 bg-gradient-to-b from-slate-900/95 to-slate-950/95 ring-1 ring-indigo-500/30 shadow-indigo-950/40'
        : isConfirmed
        ? 'border-emerald-500/40 bg-slate-900/90 ring-1 ring-emerald-500/20'
        : 'border-slate-800 bg-slate-900/60 opacity-85'
    }`}>
      {/* Top Banner / Question */}
      <div className="px-4 py-3 bg-indigo-950/40 border-b border-indigo-500/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Action Approval Required
              </span>
              <span className="text-[11px] text-slate-400">• Human-in-the-Loop</span>
            </div>
            <p className="text-sm font-medium text-white flex items-center gap-1.5 mt-0.5">
              <span>{action.bengaliPrompt}</span>
              <span className="text-slate-400 text-xs font-normal">({action.title})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getServiceBadge()}
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-slate-800/80 rounded text-slate-400 hover:text-white transition-colors"
            title={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Details Container */}
      {expanded && (
        <div className="p-4 space-y-3.5 text-xs text-slate-300">
          {/* Email Type Preview */}
          {action.actionType === 'SEND_EMAIL' && action.details.recipient && (
            <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">To / প্রাপক:</span>
                  <span className="font-mono text-slate-200">{action.details.recipient}</span>
                </div>
                {action.details.amount && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Invoice Amount / টাকার পরিমাণ:</span>
                    <span className="font-semibold text-emerald-400">{action.details.amount}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Subject / বিষয়:</span>
                <span className="font-medium text-slate-100">{action.details.subject}</span>
              </div>

              {action.details.bodyPreview && (
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-[11px] font-medium">Message Body Preview / ইমেইল বার্তা:</span>
                    {isPending && (
                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        {isEditing ? 'Preview' : 'Edit Draft'}
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      className="w-full bg-slate-900 border border-indigo-500/40 rounded p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[90px]"
                    />
                  ) : (
                    <pre className="font-sans text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800/60 whitespace-pre-wrap leading-relaxed text-xs">
                      {editedBody}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Calendar Type Preview */}
          {action.actionType === 'SCHEDULE_EVENT' && (
            <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{action.details.subject || 'Client Discussion Meeting'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[11px]">Scheduled Time:</span>
                  <span className="font-medium text-white">{action.details.dateTime || 'Tomorrow, 4:00 PM - 4:45 PM (BST)'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Invited Attendees:</span>
                  <span className="font-mono text-slate-300">{action.details.attendees?.join(', ') || 'client@example.com'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sheets Type Preview */}
          {action.actionType === 'UPDATE_SHEET' && (
            <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Target Sheet: <span className="text-emerald-400 font-mono">Q3_Customer_Orders_2026</span></span>
                <span className="text-[11px] text-slate-500">Append Row #142</span>
              </div>
              {action.details.rowValues && (
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(action.details.rowValues).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-[10px] text-slate-500 uppercase">{key}</span>
                      <p className="font-medium text-slate-200 truncate">{String(val)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Live Action Status Alerts */}
          {isConfirmed && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Action Successfully Executed / সম্পন্ন হয়েছে!</p>
                <p className="text-emerald-400/80 text-[11px] mt-0.5">
                  Dispatched via {action.service} at {action.executedAt || '10:16 AM'}. Workflow log reference #ACT-{action.actionId.slice(-3)}.
                </p>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-2 text-slate-400 text-xs">
              <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-300">Action Cancelled / বাতিল করা হয়েছে</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  No automated changes or emails were triggered. You remain in complete control.
                </p>
              </div>
            </div>
          )}

          {isExecuting && (
            <div className="p-3 rounded-lg bg-indigo-950/50 border border-indigo-500/30 flex items-center gap-2 text-indigo-300 text-xs">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Communicating with {action.service} API... Executing securely...</span>
            </div>
          )}

          {/* Interactive Approval Buttons (Crucial Requirement) */}
          {isPending && (
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-slate-800">
              <span className="text-xs text-slate-400 sm:mr-auto flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>অ্যাকশন চালানোর পূর্বে আপনার অনুমোদন প্রয়োজন</span>
              </span>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => onCancel(action.actionId)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Cancel / বাতিল করো</span>
              </button>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={() => onConfirm(action.actionId)}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-emerald-500/20 active:scale-95"
              >
                <Check className="w-4 h-4 text-emerald-100" />
                <span>Confirm / হ্যাঁ, পাঠাও</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
