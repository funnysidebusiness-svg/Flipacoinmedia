import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// 🔥 Your Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyC7UeEVdtGRRrwJoALyshMaaMj6DJUOXUA",
  authDomain: "flipacoindashboard.firebaseapp.com",
  projectId: "flipacoindashboard",
  storageBucket: "flipacoindashboard.firebasestorage.app",
  messagingSenderId: "485446226163",
  appId: "1:485446226163:web:17d1d1fd3450e2f9f82786",
  measurementId: "G-BSQMBPKD1S"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Initialize Authentication
const auth = getAuth(app);

// ✅ Optional: Initialize Analytics safely (only if supported)
let analytics = null;
isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

// Export everything cleanly
export { app, db, auth, analytics };