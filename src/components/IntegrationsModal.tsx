import React from 'react';
import { X, Calendar, Mail, Table, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { IntegrationItem } from '../types';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: IntegrationItem[];
  onSyncAll: () => void;
  isSyncing: boolean;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onClose,
  integrations,
  onSyncAll,
  isSyncing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Connected Business Integrations
              </h3>
              <p className="text-xs text-slate-400">
                BizMate AI interacts with these services under Human-in-the-Loop supervision
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration List */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl ${
                  item.category === 'email'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : item.category === 'calendar'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {item.category === 'email' && <Mail className="w-5 h-5" />}
                  {item.category === 'calendar' && <Calendar className="w-5 h-5" />}
                  {item.category === 'sheets' && <Table className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{item.details}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Last synced: {item.lastSynced}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Permissions</span>
                <span className="text-xs text-indigo-400 font-medium">Read & Draft/Write (Approval Required)</span>
              </div>
            </div>
          ))}

          {/* Security policy callout */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Human-in-the-Loop Safe Guard Policy
            </span>
            <p className="text-slate-300 leading-relaxed">
              BizMate AI will NEVER send emails, dispatch payments, or invite attendees without prompting for explicit confirmation in the chat with "Confirm / হ্যাঁ, পাঠাও".
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncing}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Test Connection & Sync All'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
