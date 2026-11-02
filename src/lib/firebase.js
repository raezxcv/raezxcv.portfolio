import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Default configuration with safe fallback so the entire website never crashes
// on Vercel or any environment if environment variables are missing.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA744_djXHfnjEwn1lQv2ZkKJax7jHqP5Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "raely-ivan-portfolio.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://raely-ivan-portfolio-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "raely-ivan-portfolio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "raely-ivan-portfolio.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "813307116773",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:813307116773:web:3750bb8d1080d45277a80c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ECY0H4M9KZ",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId
);

let app = null;
let dbInstance = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    dbInstance = getDatabase(app);

    if (typeof window !== 'undefined') {
      isSupported().then((yes) => {
        if (yes && app) getAnalytics(app);
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("Firebase initialization skipped:", err);
  }
}

export const db = dbInstance;
