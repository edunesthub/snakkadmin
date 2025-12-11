import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use the SAME Firebase config from your customer app
const firebaseConfig = {
  apiKey: "AIzaSyDm1eENxGfGOS119QLTL8OfIEiqhMzdY0s",
  authDomain: "snakk-679e1.firebaseapp.com",
  projectId: "snakk-679e1",
  storageBucket: "snakk-679e1.firebasestorage.app",
  messagingSenderId: "894137478030",
  appId: "1:894137478030:web:3b09b23218d591bbbe92df"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
