import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  ArrowLeft, 
  Cpu, 
  ExternalLink, 
  Code, 
  Mail, 
  Calendar, 
  Table, 
  ShieldCheck, 
  Copy, 
  Check 
} from 'lucide-react';
import { N8N_CONFIG } from '../config/n8nConfig';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const HelpPage: React.FC = () => {
  const [copiedPayload, setCopiedPayload] = React.useState(false);

  const samplePayload = `{
  "chatInput": "Schedule a meeting with John tomorrow at 3 PM",
  "sessionId": "chat_1727221000_abc12",
  "userId": "firebase_auth_user_uid",
  "userEmail": "user@business.com",
  "userName": "Business Owner"
}`;

  const copyPayload = () => {
    navigator.clipboard.writeText(samplePayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
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
              Documentation & n8n Integration Guide
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Payload schemas, webhook nodes, and tool triggers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="compact" />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Intro Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Cpu className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">How BizMate AI Connects to n8n</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            BizMate AI serves as the front-end user experience for your n8n AI Agent. The frontend manages user authentication, conversation history, and rich visual cards (such as calendar invites and spreadsheet tables), while your n8n workflow securely retains all API credentials for OpenAI, Google Calendar, Gmail, and Google Sheets.
          </p>
        </div>

        {/* Expected Request Payload */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">1. n8n Request Payload Schema</h3>
              <p className="text-xs text-slate-400">
                Data sent via HTTP POST to <code className="text-indigo-300 font-mono">VITE_N8N_WEBHOOK_URL</code>
              </p>
            </div>
            <button
              onClick={copyPayload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:text-white cursor-pointer"
            >
              {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPayload ? 'Copied' : 'Copy Schema'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            {samplePayload}
          </pre>

          <p className="text-xs text-slate-400">
            You can customize field names (e.g. changing <code className="text-indigo-300 font-mono">chatInput</code> to <code className="text-indigo-300 font-mono">message</code>) in <code className="text-indigo-300 font-mono">src/config/n8nConfig.ts</code>.
          </p>
        </div>

        {/* Expected Response Formats */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">2. Supported n8n Response Formats</h3>
          <p className="text-xs text-slate-300">
            BizMate AI's response parser automatically handles any of the following response formats:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-sans font-semibold">Standard Output</span>
              <pre className="text-slate-300 whitespace-pre-wrap">{`{
  "output": "Your response here"
}`}</pre>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-blue-400 font-sans font-semibold">Calendar Event Result</span>
              <pre className="text-slate-300 whitespace-pre-wrap">{`{
  "type": "calendar",
  "calendarEvent": {
    "title": "Strategy Call",
    "date": "Tomorrow",
    "time": "3:00 PM"
  }
}`}</pre>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-red-400 font-sans font-semibold">Gmail Sent Result</span>
              <pre className="text-slate-300 whitespace-pre-wrap">{`{
  "type": "gmail",
  "gmailSent": {
    "to": "client@example.com",
    "subject": "Invoice Notice",
    "status": "Successfully Sent"
  }
}`}</pre>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-sans font-semibold">Google Sheets Table</span>
              <pre className="text-slate-300 whitespace-pre-wrap">{`{
  "type": "sheets",
  "googleSheets": {
    "sheetName": "Orders_2026",
    "headers": ["ID", "Name", "Status"],
    "rows": [["1", "John", "Paid"]]
  }
}`}</pre>
            </div>
          </div>
        </div>

        {/* Security Summary */}
        <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-2 text-indigo-200">
          <div className="flex items-center gap-2 font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Trust Security Guarantee</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Neither Google OAuth tokens, OpenAI API keys, nor n8n internal node credentials ever touch the browser. All third-party authentication is managed in your secure server-side n8n workflow.
          </p>
        </div>
      </main>
    </div>
  );
};
