import React, { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA6z96TxHW0GUsvoNY-y9tEX8D6iKb9vag",
  authDomain: "korkomat-cbdd1.firebaseapp.com",
  projectId: "korkomat-cbdd1",
  storageBucket: "korkomat-cbdd1.firebasestorage.app",
  messagingSenderId: "117121446515",
  appId: "1:117121446515:web:3dd97b43d1138e5ca57006",
  measurementId: "G-XH2T1CD6K9"
};

let app;
let auth;
let analytics;
let appCheck;

export function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    auth.languageCode = 'pl';
    analytics = getAnalytics(app);
  }
  return { app, auth, analytics };
}

export function setupRecaptcha(container, auth) {
  if (!auth) throw new Error("Firebase not initialized. Call initFirebase() first.");
  window.recaptchaVerifier = new RecaptchaVerifier(auth, container, {
    size: "invisible",
    callback: () => console.log("reCAPTCHA rozwiązany")
  });
  return window.recaptchaVerifier;
}

const FirebaseInitializer = ({ children }) => {
  useEffect(() => {
    initFirebase();
  }, []);

  return <>
  <div id="recaptcha-container" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: 1, height: 1, overflow: 'hidden' }} />
  {children}
  </>;
};

export default FirebaseInitializer;