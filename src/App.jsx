// src/App.jsx
import React, { useState } from "react";
import Brand from "./assets/axela_logo_no_bg.webp";

import {
    signInWithGoogle,
    signInWithGithub,
    loginWithEmailPassword,
    registerWithEmailPassword,
} from "./firebaseConfig";

export default function App() {
    return (
        <div className="app-shell">
            <PhoneAuth
                appName="Axela"
                tagline="Command your world. Axela does the rest."
            />
        </div>
    );
}

function PhoneAuth({ appName, tagline }) {
    const [screen, setScreen] = useState("welcome");
    const [loginMode, setLoginMode] = useState("login"); // "login" | "signup"

    return (
        <div className="phone">
            {screen === "welcome" ? (
                <WelcomeScreen
                    appName={appName}
                    tagline={tagline}
                    onLogin={() => { setLoginMode("login"); setScreen("login"); }}
                    onCreateAccount={() => { setLoginMode("signup"); setScreen("login"); }}
                />
            ) : (
                <LoginScreen
                    onBack={() => setScreen("welcome")}
                    initialMode={loginMode}
                />
            )}
        </div>
    );
}

/* -------------------- WELCOME (upgraded hero + side-by-side buttons) -------------------- */
function WelcomeScreen({ appName, tagline, onLogin, onCreateAccount }) {
    return (
        <div className="screen screen-welcome">
            <div className="hero">
                {/* New gradient box containing a BLACK logo */}
                <div className="hero-card">
                    <img
                        src={Brand}
                        alt={`${appName} logo`}
                        className="brand-insignia black-logo"
                    />
                </div>
            </div>

            <div className="pad">
                <h1 className="title">{appName}</h1>
                <h2 className="headline">{tagline}</h2>
                <p className="subcopy">
                    Smarter control for your computer — voice, shortcuts, and automations
                    that keep you in flow.
                </p>

                {/* Side-by-side buttons */}
                <div className="actions-row">
                    <button className="btn btn-accent" onClick={onLogin}>Log in</button>
                    <button className="btn btn-outline-accent" onClick={onCreateAccount}>
                        Create account
                    </button>
                </div>
            </div>

            <div className="home-indicator" />
        </div>
    );
}

/* -------------------- LOGIN (unchanged flow, supports signup mode) -------------------- */
function LoginScreen({ onBack, initialMode = "login" }) {
    const [mode, setMode] = useState(initialMode); // "login" | "signup"
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setErr("");
        setBusy(true);
        try {
            if (mode === "login") {
                await loginWithEmailPassword(email.trim(), pw);
            } else {
                if (pw !== confirm) throw new Error("Passwords do not match");
                await registerWithEmailPassword(email.trim(), pw);
            }
        } catch (ex) {
            setErr(ex?.code || ex?.message || String(ex));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="screen screen-login">
            <header className="topbar">
                <button className="icon-btn" aria-label="Back" onClick={onBack}>‹</button>
                <div className="topbar-title">{mode === "login" ? "Log in" : "Create account"}</div>
                <img
                    src={Brand}
                    alt="Axela"
                    className="brand-badge"
                    style={{ width: 28, height: 28, objectFit: "contain" }}
                />
            </header>

            <form className="pad login-card" onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="email">Email</label>
                <input
                    id="email"
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />

                <label className="field-label" htmlFor="pw">Password</label>
                <input
                    id="pw"
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                />

                {mode === "signup" && (
                    <>
                        <label className="field-label" htmlFor="confirm">Confirm password</label>
                        <input
                            id="confirm"
                            className="input"
                            type="password"
                            placeholder="••••••••"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </>
                )}

                <button type="submit" className="btn btn-accent wider" disabled={busy} style={{ marginTop: 10 }}>
                    {busy ? (mode === "login" ? "Signing in..." : "Creating account...") : (mode === "login" ? "Log in" : "Create account")}
                </button>

                <p className="alt-link" style={{ marginTop: 10 }}>
                    {mode === "login" ? (
                        <>
                            Don’t have an account?
                            <button type="button" className="link" onClick={() => { setMode("signup"); setErr(""); }}>
                                Create one
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?
                            <button type="button" className="link" onClick={() => { setMode("login"); setErr(""); }}>
                                Log in
                            </button>
                        </>
                    )}
                </p>

                <div className="divider" style={{ marginTop: 16 }}>
                    <span>Or continue with</span>
                </div>

                <button
                    type="button"
                    className="btn btn-ghost wider"
                    onClick={async () => {
                        try { await signInWithGoogle(); } catch (e) { alert(e?.code || e?.message); }
                    }}
                >
                    <span className="icon g">G</span> Sign in with Google
                </button>

                <button
                    type="button"
                    className="btn btn-ghost wider"
                    onClick={async () => {
                        try { await signInWithGithub(); } catch (e) { alert(e?.code || e?.message); }
                    }}
                >
                    <span className="icon gh" aria-hidden>🐱</span> Sign in with GitHub
                </button>
            </form>

            <div className="home-indicator" />
        </div>
    );
}