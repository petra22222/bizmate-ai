import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';
import { removeUndefinedFields } from '../utils/firestoreUtils';

export const authService = {
  // Sign up with Email and Password
  async signUp(name: string, email: string, pass: string): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    
    // Update Firebase Auth display name
    await updateProfile(user, { displayName: name });

    // Send email verification link
    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.warn('Could not send verification email immediately:', err);
    }

    const now = new Date().toISOString();
    const profile: UserProfile = {
      uid: user.uid,
      name,
      email: user.email || email,
      photoURL: user.photoURL || '',
      createdAt: now,
      lastLoginAt: now,
      plan: 'free',
      role: 'user',
    };

    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, removeUndefinedFields(profile));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    }

    return profile;
  },

  // Log in with Email and Password
  async login(email: string, pass: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    const now = new Date().toISOString();

    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await updateDoc(userRef, removeUndefinedFields({ lastLoginAt: now }));
        return snap.data() as UserProfile;
      } else {
        // Create initial profile if missing
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || 'Small Business Owner',
          email: user.email || email,
          photoURL: user.photoURL || '',
          createdAt: now,
          lastLoginAt: now,
          plan: 'free',
          role: 'user',
        };
        await setDoc(userRef, removeUndefinedFields(newProfile));
        return newProfile;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      throw error;
    }
  },

  // Sign in with Google Popup
  async loginWithGoogle(): Promise<UserProfile> {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    const now = new Date().toISOString();
    const userRef = doc(db, 'users', user.uid);

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await updateDoc(userRef, removeUndefinedFields({ lastLoginAt: now }));
        return snap.data() as UserProfile;
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: now,
          lastLoginAt: now,
          plan: 'free',
          role: 'user',
        };
        await setDoc(userRef, removeUndefinedFields(newProfile));
        return newProfile;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      throw error;
    }
  },

  // Send Password Reset
  async forgotPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Send Email Verification
  async resendEmailVerification(): Promise<void> {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  },

  // Update profile details
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    if (auth.currentUser && updates.name) {
      await updateProfile(auth.currentUser, { displayName: updates.name });
    }
    try {
      await updateDoc(userRef, removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  // Update Password
  async changePassword(newPass: string): Promise<void> {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPass);
    }
  },

  // Logout
  async logout(): Promise<void> {
    await firebaseSignOut(auth);
  },

  // Get current user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  }
};
