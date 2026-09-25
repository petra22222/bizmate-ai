import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import fallbackConfig from '../../firebase-applet-config.json';

// Support both environment variables and fallback config from AI Studio
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGKslc4yPJi3wYx2xYvICWXgAZnN0csds",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studio-4328056510-2ec0c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studio-4328056510-2ec0c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studio-4328056510-2ec0c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "168249363166",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:168249363166:web:b6423bfb0e3dbddfbd04f"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying the provisioned firestoreDatabaseId
export const db = getFirestore(app, fallbackConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    if (!db) return false;
    return true;
  } catch (e) {
    console.error("Firestore connection error:", e);
    return false;
  }
}

export function handleFirestoreError(error: any, operation: OperationType, path: string | null = null): FirestoreErrorInfo {
  const message = error?.message || "An unknown Firestore error occurred";
  return {
    error: message,
    operationType: operation,
    path,
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
    }
  };
}