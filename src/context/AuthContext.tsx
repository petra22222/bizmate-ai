import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, testFirestoreConnection } from '../lib/firebase';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isFirestoreReady: boolean;
  refreshUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isFirestoreReady: false,
  refreshUserProfile: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirestoreReady, setIsFirestoreReady] = useState(false);

  // Boot connection check
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirestoreReady(connected);
    });
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const profile = await authService.getUserProfile(uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        // Fallback user profile if not in firestore yet
        if (auth.currentUser) {
          const fallback: UserProfile = {
            uid,
            name: auth.currentUser.displayName || 'Small Business Owner',
            email: auth.currentUser.email || '',
            photoURL: auth.currentUser.photoURL || '',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            plan: 'free',
            role: 'user',
          };
          setUserProfile(fallback);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isFirestoreReady,
        refreshUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
