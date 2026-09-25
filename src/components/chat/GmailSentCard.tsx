import React, { useState } from 'react';
import { Mail, CheckCircle2, Copy, Check, Send } from 'lucide-react';
import { GmailSentData } from '../../types';
import { useI18n } from '../../i18n';

interface GmailSentCardProps {
  data: GmailSentData;
}

export const GmailSentCard: React.FC<GmailSentCardProps> = ({ data }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`To: ${data.to}\nSubject: ${data.subject}\n\n${data.snippet || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/30 via-slate-900 to-slate-950 p-4 shadow-lg shadow-red-950/20 text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 block">
              Gmail Dispatch
            </span>
            <h4 className="text-sm font-semibold text-white leading-tight">
              {t('tools.gmailSent')}
            </h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t('common.connected')}
        </span>
      </div>

      <div className="space-y-2 py-3 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">{t('tools.recipient')}:</span>
          <span className="font-mono text-slate-100 font-medium">{data.to}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">{t('tools.subject')}:</span>
          <span className="text-slate-200 font-medium">{data.subject}</span>
        </div>
        {data.snippet && (
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 font-sans text-xs leading-relaxed">
            {data.snippet}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Send className="w-3 h-3 text-red-400 rtl-mirror" />
          Delivered via n8n Gmail API tool
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer text-xs"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? t('common.copied') : t('common.copy')}</span>
        </button>
      </div>
    </div>
  );
};
