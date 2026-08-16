import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoKeyFAA2025Valid00000000000',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'faa-avaliacao-militar.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'faa-avaliacao-militar',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'faa-avaliacao-militar.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '780617304823',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:780617304823:web:5733f3885d581f1857c919',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = typeof window !== 'undefined' ? getAuth(app) : null;
const db = typeof window !== 'undefined' ? getFirestore(app) : null;

export { app, auth, db };
export const isFirebaseConfigured = () => true;
