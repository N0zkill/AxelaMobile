// src/App.tsx
import React, { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import LoginScreen from "./components/LoginScreen";
import type { Session } from "@supabase/supabase-js";

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1) Get current session on first load
        const fetchSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error getting session:", error.message);
            }
            setSession(data.session ?? null);
            setLoading(false);
        };

        fetchSession();

        // 2) Listen for login/logout changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });

        // Cleanup listener on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Small loading screen while checking session
    if (loading) {
        return (
            <div className="app-shell loading-screen">
            <div className="phone">
            <div className="loading-inner">
            <div className="axela-dot" />
                <p>Waking Axela…</p>
        </div>
        </div>
        </div>
    );
    }

    // ❌ No session → show your Supabase-powered login screen
    if (!session) {
        return <LoginScreen />;
    }

    // ✅ Logged in → show main app
    return <MainApp onLogout={handleLogout} />;
}

// Simple main app shell (replace inside with your real UI if you want)
function MainApp({ onLogout }: { onLogout: () => void }) {
    return (
        <div className="app-shell">
        <div className="phone phone-main">
        <header className="main-header">
        <div className="main-title">
        <span className="axela-pill">Axela</span>
            <h1>Welcome back</h1>
    <p className="main-sub">
        You&apos;re signed in with Supabase. This is the main app area.
    </p>
    </div>

    <button className="btn btn-ghost" onClick={onLogout}>
        Log out
    </button>
    </header>

    <main className="main-body">
    <div className="placeholder-card">
        <p>
              🔧 Replace this section with your real Axela chat / tools UI when
    you&apos;re ready.
    </p>
    </div>
    </main>
    </div>
    </div>
);
}

async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error.message);
        alert("Could not log out, check console.");
    }
}

export default App;