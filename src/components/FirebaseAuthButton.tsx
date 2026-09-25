import React, { useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signOut as fbSignOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { 
  LogIn, 
  LogOut, 
  User, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  Database
} from 'lucide-react';

interface FirebaseAuthButtonProps {
  user: FirebaseUser | null;
  isLoadingAuth: boolean;
  onAuthSuccess?: () => void;
  compact?: boolean;
}

export const FirebaseAuthButton: React.FC<FirebaseAuthButtonProps> = ({
  user,
  isLoadingAuth,
  onAuthSuccess,
  compact = false,
}) => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Firebase Auth Error:', err);
        setAuthError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
      setIsOpenDropdown(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Google SVG Icon
  const GoogleIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.2 3.66-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.44 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.56 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );

  if (isLoadingAuth) {
    return (
      <div className="h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-400 animate-pulse">
        <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <span>Authenticating...</span>
      </div>
    );
  }

  // Not logged in: Show Login / Signup Button
  if (!user) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          className={`group flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer font-medium text-xs shadow-md active:scale-95 ${
            compact
              ? 'px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
              : 'px-3.5 py-2 bg-gradient-to-r from-slate-900 to-indigo-950/80 hover:from-indigo-900/80 hover:to-indigo-800 text-white border border-indigo-500/40 hover:border-indigo-400 shadow-indigo-950/50'
          }`}
          title="Sign in or Sign up using Firebase Auth"
        >
          {isSigningIn ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="p-0.5 rounded bg-white shrink-0 flex items-center justify-center">
              <GoogleIcon />
            </div>
          )}
          <span className="truncate">
            {isSigningIn ? 'Connecting...' : 'Sign In / Sign Up'}
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Firebase
          </span>
        </button>

        {authError && (
          <div className="absolute top-full right-0 mt-2 w-64 p-2.5 rounded-xl bg-red-950/90 border border-red-500/40 text-red-200 text-xs shadow-xl z-50 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-red-100">Sign in notice</p>
              <p className="text-[11px] text-red-300 leading-tight">{authError}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Logged in: Show User Badge and Dropdown Menu
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpenDropdown(!isOpenDropdown)}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-xs"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/40"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
        )}

        <div className="hidden md:flex flex-col text-left">
          <span className="font-medium text-slate-200 truncate max-w-[110px] leading-tight">
            {user.displayName || 'Biz Owner'}
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 leading-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Firebase Synced
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
      </button>

      {/* User Dropdown */}
      {isOpenDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpenDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-3 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            {/* Account Info */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-emerald-500/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  {user.displayName || 'Small Business Owner'}
                </p>
                <p className="text-xs text-slate-400 truncate font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Cloud & Security Status */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Firestore Persistence</span>
                </div>
                <span className="text-[10px] font-semibold uppercase bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Google Auth Provider</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Verified</span>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/30 text-slate-300 hover:text-red-300 text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Sign Out from Firebase</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
