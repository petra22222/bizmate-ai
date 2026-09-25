import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const ProfilePage: React.FC = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [name, setName] = useState(userProfile?.name || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSavingProfile(true);
    setError(null);
    setProfileSuccess(false);

    try {
      await authService.updateUserProfile(user.uid, {
        name: name.trim(),
        photoURL: photoURL.trim(),
      });
      await refreshUserProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Passwords do not match or are empty.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsChangingPass(true);
    setError(null);
    setPassSuccess(false);

    try {
      await authService.changePassword(newPassword);
      setPassSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. You may need to log in again.');
    } finally {
      setIsChangingPass(false);
    }
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
              User Profile
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Account identity & security settings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="compact" />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-950/50">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-white">{userProfile?.name || 'Owner'}</h2>
                <p className="text-xs text-slate-400 font-mono">{userProfile?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase">
                    Plan: {userProfile?.plan || 'free'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    Role: {userProfile?.role || 'user'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 font-mono">
              <span className="block text-[11px] text-slate-400">Member Since</span>
              <span>
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
              </span>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="text-sm font-semibold text-white">General Information</h3>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email (Managed by Firebase)
                </label>
                <input
                  type="email"
                  value={userProfile?.email || ''}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800/60 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>

          {/* Change Password Form */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white">Security & Password</h3>

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPass || !newPassword}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
