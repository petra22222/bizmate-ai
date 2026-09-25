import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  ArrowRight, 
  Mail, 
  Calendar, 
  Table, 
  Cpu, 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <BrainCircuit className="w-5 h-5 text-indigo-400" />,
      title: 'AI Assistant',
      desc: 'Powered by OpenAI reasoning inside your n8n workflow to interpret complex instructions and small business queries.',
    },
    {
      icon: <Mail className="w-5 h-5 text-red-400" />,
      title: 'Gmail Automation',
      desc: 'Seamlessly drafts, schedules, and sends customer reminder emails and supplier follow-ups with full confirmation.',
    },
    {
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      title: 'Google Calendar',
      desc: 'Intelligently books client meetings, checks availability, creates Google Meet links, and sends calendar invites.',
    },
    {
      icon: <Table className="w-5 h-5 text-emerald-400" />,
      title: 'Google Sheets',
      desc: 'Directly reads orders, tracks inventory, calculates outstanding invoices, and appends new client orders in real time.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      title: 'Conversation Memory',
      desc: 'Maintains contextual session memory so you can reference previous invoices, customer names, and past discussions.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
      title: 'Business Productivity',
      desc: 'Eliminates hours of manual administrative overhead with human-in-the-loop oversight and automated task execution.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Frontend Workspace for n8n AI Agent</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Smart AI Business Assistant
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect with your AI assistant and automate everyday business tasks through one simple workspace.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {user ? (
              <Link
                to="/chat"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-950/60 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Continue to Chat Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-950/60 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Zero-Risk Tag */}
          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Human-in-the-Loop Safe Guard
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              Zero Hardcoded Secrets
            </span>
          </div>
        </div>
      </section>

      {/* Architecture / Workflow Diagram Section */}
      <section id="workflow" className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60 bg-slate-950/50">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
              End-to-End Workflow Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              How BizMate AI Connects to Your n8n Agent
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Your sensitive API keys and third-party tools stay securely inside n8n. The frontend passes authenticated sessions and displays structured results.
            </p>
          </div>

          {/* Workflow Diagram illustration */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-x-auto">
            <div className="min-w-[620px] flex items-center justify-between text-xs font-medium">
              {/* Step 1: User */}
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center w-28">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                  <span className="font-bold text-sm">YOU</span>
                </div>
                <span className="text-slate-200">Business Owner</span>
                <span className="text-[10px] text-slate-500">Natural Request</span>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-[10px] text-slate-400 mb-1">Web Chat</span>
                <div className="w-full h-0.5 bg-gradient-to-r from-slate-700 to-indigo-500 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 absolute right-0 -top-1.5" />
                </div>
              </div>

              {/* Step 2: BizMate AI */}
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-center w-36 shadow-lg shadow-indigo-950/40">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-white font-semibold">BizMate AI</span>
                <span className="text-[10px] text-indigo-300">Auth & Session UI</span>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-[10px] text-indigo-400 mb-1">Webhook / Chat</span>
                <div className="w-full h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-violet-400 absolute right-0 -top-1.5" />
                </div>
              </div>

              {/* Step 3: n8n AI Agent */}
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-950/60 border border-violet-500/40 text-center w-36 shadow-lg shadow-violet-950/40">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-white font-semibold">n8n Workflow</span>
                <span className="text-[10px] text-violet-300">OpenAI + Memory</span>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-[10px] text-violet-400 mb-1">Tool Dispatch</span>
                <div className="w-full h-0.5 bg-gradient-to-r from-violet-500 to-emerald-500 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 absolute right-0 -top-1.5" />
                </div>
              </div>

              {/* Step 4: Tools */}
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center w-36">
                <div className="flex items-center gap-1">
                  <span className="p-1 rounded bg-red-500/20 text-red-400"><Mail className="w-3 h-3" /></span>
                  <span className="p-1 rounded bg-blue-500/20 text-blue-400"><Calendar className="w-3 h-3" /></span>
                  <span className="p-1 rounded bg-emerald-500/20 text-emerald-400"><Table className="w-3 h-3" /></span>
                </div>
                <span className="text-slate-200">Gmail • Calendar • Sheets</span>
                <span className="text-[10px] text-emerald-400">Actions Executed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
            Core Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Everything You Need to Run Your Business Smarter
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 shadow-md space-y-3"
            >
              <div className="p-2.5 rounded-xl bg-slate-950 w-fit border border-slate-800">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">BizMate AI</span>
            <span>•</span>
            <span>Production-grade n8n Agent Frontend</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/help" className="hover:text-white transition-colors">Documentation</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
