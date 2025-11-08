// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";

// --- Your Firebase Web config (Project settings → General → Your apps) ---
const firebaseConfig = {
    apiKey: "AIzaSyBVgpgEH0hK9rZXegDYmhr6iBJtwsdaLBs",
    authDomain: "axela-6896d.firebaseapp.com",
    projectId: "axela-6896d",
    storageBucket: "axela-6896d.firebasestorage.app",
    messagingSenderId: "1084102937697",
    appId: "1:1084102937697:web:316fc784a1faec1979ee20",
    measurementId: "G-62BE4KL31L",
};

// --- Init ---
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// --- Providers ---
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
// githubProvider.addScope("user:email"); // optional

// --- Social sign-in helpers (popup first, redirect fallback) ---
export async function signInWithGoogle() {
    try {
        return await signInWithPopup(auth, googleProvider);
    } catch (e) {
        if (e?.code === "auth/popup-blocked" || e?.code === "auth/popup-closed-by-user") {
            return await signInWithRedirect(auth, googleProvider);
        }
        throw e;
    }
}

export async function signInWithGithub() {
    try {
        return await signInWithPopup(auth, githubProvider);
    } catch (e) {
        if (e?.code === "auth/popup-blocked" || e?.code === "auth/popup-closed-by-user") {
            return await signInWithRedirect(auth, githubProvider);
        }
        throw e;
    }
}

// --- Email + Password ---
export function loginWithEmailPassword(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function registerWithEmailPassword(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}