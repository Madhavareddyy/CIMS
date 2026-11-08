/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Active Google Firebase Cloud Configuration
 * Project: CIMS-campus
 */

const firebaseConfig = {
  apiKey: "AIzaSyBkHgaO8GBG1R4_9AUE40xqLfG6K2aNrpM",
  authDomain: "cims-campus.firebaseapp.com",
  projectId: "cims-campus",
  storageBucket: "cims-campus.firebasestorage.app",
  messagingSenderId: "100493853948",
  appId: "1:100493853948:web:9f7e141c62f001b9c3c379",
  measurementId: "G-4R00H1LHBN"
};

// Export to browser window
if (typeof window !== "undefined") {
  window.FIREBASE_CONFIG = firebaseConfig;
}
