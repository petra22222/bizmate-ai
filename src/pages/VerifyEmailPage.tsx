import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Send, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const VerifyEmailPage: React.FC = () => {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [sentMessage, setSentMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResend = async () => {
    setIsSending(true);
    setError(null);
    try {
      await authService.resendEmailVerification();
      setSentMessage(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">
            BizMate AI
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Verify your email address
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enhance your account security for n8n automated dispatching
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 py-8 px-6 sm:px-8 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-200">
              We sent a verification link to:
            </p>
            <p className="font-mono text-sm text-indigo-300 font-semibold bg-slate-950 p-2 rounded-lg border border-slate-800">
              {user?.email || 'your-email@example.com'}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please click the link in your email to verify your address. Once verified, all automated Gmail and Google Calendar tools will operate with full access.
            </p>
          </div>

          {sentMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verification email resent successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleResend}
              disabled={isSending}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Resend Verification Email'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>Continue to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
