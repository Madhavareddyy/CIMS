/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Active Google Firebase Cloud Configuration
 * Project: CIMS-campus
 */

const firebaseConfig = {
  apiKey: "AIzaSyBkHga08GBG1R4_9AUE40xqLfG6K2aNrpM",
  authDomain: "cims-campus.firebaseapp.com",
  projectId: "cims-campus",
  storageBucket: "cims-campus.firebasestorage.app",
  messagingSenderId: "100493853948",
  appId: "1:100493853948:web:3301414b65870bd4c3c379",
  measurementId: "G-X1XQH1QSRJ"
};

// Export to browser window
if (typeof window !== "undefined") {
  window.FIREBASE_CONFIG = firebaseConfig;
}
