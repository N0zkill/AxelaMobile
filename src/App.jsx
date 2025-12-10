import React, { useState, useEffect } from "react";
import Brand from "./assets/axela_logo_no_bg.webp"; // your Axela logo
import { supabase } from "./supabaseClient";        // Supabase client

export default function App() {
    const [session, setSession] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // 1. Check existing session on load
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.error("Error getting session:", error);
            }
            setSession(data?.session ?? null);
            setChecking(false);
        });

        // 2. Listen for login / logout changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (checking) {
        return (
            <div className="app-shell">
                <div className="phone">
                    <div className="screen screen-login flex items-center justify-center">
                        <p style={{ color: "white" }}>Checking session…</p>
                    </div>
                </div>
            </div>
        );
    }

    // Not logged in → show your welcome/login flow
    if (!session) {
        return (
            <div className="app-shell">
                <PhoneAuth />
            </div>
        );
    }

    // Logged in → show home view with chats/scripts/settings
    return (
        <div className="app-shell">
            <AuthedHome session={session} />
        </div>
    );
}

/* ===== AUTHED HOME: CHATS + SCRIPTS + SETTINGS ===== */

function AuthedHome({ session }) {
    const userId = session?.user?.id;
    const email = session?.user?.email ?? "Unknown user";

    const [chats, setChats] = useState([]);
    const [scripts, setScripts] = useState([]);
    const [theme, setTheme] = useState("dark");
    const [mobileNotify, setMobileNotify] = useState(true);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) return;

        async function loadData() {
            setLoading(true);
            setError("");

            try {
                // ⚠️ ADJUST THESE TABLE NAMES / COLUMNS TO MATCH YOUR REAL SUPABASE SCHEMA

                // 1) Recent chats
                const { data: chatRows, error: chatErr } = await supabase
                    .from("axela_chats") // e.g., your chats table name
                    .select("id, title, last_message, updated_at")
                    .eq("user_id", userId)
                    .order("updated_at", { ascending: false })
                    .limit(5);

                if (chatErr) throw chatErr;
                setChats(chatRows || []);

                // 2) Scripts
                const { data: scriptRows, error: scriptErr } = await supabase
                    .from("axela_scripts") // e.g., your scripts table name
                    .select("id, name, description, updated_at")
                    .eq("user_id", userId)
                    .order("updated_at", { ascending: false })
                    .limit(5);

                if (scriptErr) throw scriptErr;
                setScripts(scriptRows || []);

                // 3) Settings
                const { data: settingsRows, error: settingsErr } = await supabase
                    .from("axela_settings") // e.g., your settings table name
                    .select("theme, mobile_notify")
                    .eq("user_id", userId)
                    .single();

                if (settingsErr && settingsErr.code !== "PGRST116") {
                    // PGRST116 = no rows found (ok for first-time user)
                    throw settingsErr;
                }

                if (settingsRows) {
                    if (settingsRows.theme) setTheme(settingsRows.theme);
                    if (typeof settingsRows.mobile_notify === "boolean") {
                        setMobileNotify(settingsRows.mobile_notify);
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                setError(err?.message || "Failed to load your Axela data.");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [userId]);

    async function handleSaveSettings() {
        if (!userId) return;
        setSavingSettings(true);
        setError("");

        try {
            const { error: upsertErr } = await supabase
                .from("axela_settings") // same table as above
                .upsert(
                    {
                        user_id: userId,
                        theme,
                        mobile_notify: mobileNotify,
                    },
                    { onConflict: "user_id" }
                );

            if (upsertErr) throw upsertErr;
            alert("Settings saved for Axela mobile.");
        } catch (err) {
            console.error("Failed to save settings:", err);
            setError(err?.message || "Failed to save settings.");
        } finally {
            setSavingSettings(false);
        }
    }

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
            alert("Error signing out: " + error.message);
        }
    }

    return (
        <div className="phone">
            <div className="screen screen-login">
                <header className="topbar">
                    <div className="topbar-title">Axela Mobile</div>
                    <img src={Brand} alt="Axela small logo" className="topbar-logo" />
                </header>

                <div className="pad login-content">
                    <div className="login-card">
                        <p className="login-caption">You&apos;re logged in as:</p>
                        <p
                            style={{
                                color: "white",
                                fontWeight: 600,
                                wordBreak: "break-all",
                                marginBottom: "0.75rem",
                            }}
                        >
                            {email}
                        </p>

                        {loading ? (
                            <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
                                Loading your chats, scripts, and settings…
                            </p>
                        ) : (
                            <>
                                {error && (
                                    <p style={{ color: "#ffb4b4", fontSize: "0.85rem" }}>
                                        {error}
                                    </p>
                                )}

                                {/* Recent chats */}
                                <section style={{ marginTop: "1rem" }}>
                                    <h3
                                        style={{
                                            color: "white",
                                            fontSize: "0.95rem",
                                            marginBottom: "0.35rem",
                                        }}
                                    >
                                        Recent chats
                                    </h3>
                                    {(!chats || chats.length === 0) && (
                                        <p style={{ color: "#aaa", fontSize: "0.8rem" }}>
                                            No chats found yet. Start a conversation on desktop Axela
                                            and it will show up here.
                                        </p>
                                    )}
                                    {chats && chats.length > 0 && (
                                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                            {chats.map((chat) => (
                                                <li
                                                    key={chat.id}
                                                    style={{
                                                        padding: "0.4rem 0",
                                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color: "white",
                                                            fontSize: "0.85rem",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {chat.title || "Untitled chat"}
                                                    </div>
                                                    {chat.last_message && (
                                                        <div
                                                            style={{
                                                                color: "#bbb",
                                                                fontSize: "0.75rem",
                                                                marginTop: "0.1rem",
                                                            }}
                                                        >
                                                            {chat.last_message}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </section>

                                {/* Scripts */}
                                <section style={{ marginTop: "1rem" }}>
                                    <h3
                                        style={{
                                            color: "white",
                                            fontSize: "0.95rem",
                                            marginBottom: "0.35rem",
                                        }}
                                    >
                                        Scripts
                                    </h3>
                                    {(!scripts || scripts.length === 0) && (
                                        <p style={{ color: "#aaa", fontSize: "0.8rem" }}>
                                            No scripts saved yet. Save a script on desktop Axela to
                                            see it here.
                                        </p>
                                    )}
                                    {scripts && scripts.length > 0 && (
                                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                            {scripts.map((script) => (
                                                <li
                                                    key={script.id}
                                                    style={{
                                                        padding: "0.4rem 0",
                                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color: "white",
                                                            fontSize: "0.85rem",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {script.name || "Untitled script"}
                                                    </div>
                                                    {script.description && (
                                                        <div
                                                            style={{
                                                                color: "#bbb",
                                                                fontSize: "0.75rem",
                                                                marginTop: "0.1rem",
                                                            }}
                                                        >
                                                            {script.description}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </section>

                                {/* Settings */}
                                <section style={{ marginTop: "1rem" }}>
                                    <h3
                                        style={{
                                            color: "white",
                                            fontSize: "0.95rem",
                                            marginBottom: "0.35rem",
                                        }}
                                    >
                                        Mobile settings
                                    </h3>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "0.75rem",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                    <span
                        style={{ color: "#ddd", fontSize: "0.85rem" }}
                    >
                      Theme
                    </span>
                                        <select
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            style={{
                                                backgroundColor: "#111",
                                                color: "white",
                                                borderRadius: "999px",
                                                padding: "0.35rem 0.8rem",
                                                border: "1px solid rgba(255,255,255,0.12)",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            <option value="dark">Dark (recommended)</option>
                                            <option value="light">Light</option>
                                        </select>
                                    </div>

                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "0.75rem",
                                            fontSize: "0.85rem",
                                            color: "#ddd",
                                        }}
                                    >
                                        <span>Send mobile notifications</span>
                                        <input
                                            type="checkbox"
                                            checked={mobileNotify}
                                            onChange={(e) => setMobileNotify(e.target.checked)}
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-full"
                                        onClick={handleSaveSettings}
                                        disabled={savingSettings}
                                        style={{ marginTop: "0.75rem" }}
                                    >
                                        {savingSettings ? "Saving…" : "Save settings"}
                                    </button>
                                </section>
                            </>
                        )}

                        <button
                            type="button"
                            className="btn btn-ghost btn-full"
                            onClick={handleLogout}
                            style={{ marginTop: "1rem" }}
                        >
                            Log out
                        </button>
                    </div>
                </div>

                <div className="home-indicator" />
            </div>
        </div>
    );
}

/* ===== PHONE AUTH FLOW (unchanged) ===== */

function PhoneAuth() {
    const [screen, setScreen] = useState("welcome"); // "welcome" | "login"
    const [authMode, setAuthMode] = useState("login"); // "login" | "signup"

    return (
        <div className="phone">
            {screen === "welcome" ? (
                <WelcomeScreen
                    onLogin={() => {
                        setAuthMode("login");
                        setScreen("login");
                    }}
                    onCreateAccount={() => {
                        setAuthMode("signup");
                        setScreen("login");
                    }}
                />
            ) : (
                <LoginScreen
                    mode={authMode}
                    onBack={() => setScreen("welcome")}
                    onSwitchMode={(next) => setAuthMode(next)}
                />
            )}
        </div>
    );
}

/* ===== WELCOME SCREEN ===== */

function WelcomeScreen({ onLogin, onCreateAccount }) {
    return (
        <div className="screen screen-welcome">
            <div className="hero">
                <div className="hero-logo-wrap">
                    <img src={Brand} alt="Axela logo" className="hero-logo" />
                </div>

                <div className="hero-orbit hero-orbit--one" />
                <div className="hero-orbit hero-orbit--two" />
            </div>

            <div className="pad welcome-content">
                <h1 className="welcome-title">Axela</h1>
                <h2 className="welcome-tagline">
                    Command your world. Axela does the rest.
                </h2>
                <p className="welcome-copy">
                    Your personal desktop co-pilot — launch apps, control windows, and run
                    smart workflows with a single voice or shortcut.
                </p>

                <button className="btn btn-accent btn-full" onClick={onLogin}>
                    Log in
                </button>

                <button
                    className="btn btn-ghost btn-full small-text"
                    type="button"
                    onClick={onCreateAccount}
                >
                    Create an account
                </button>
            </div>

            <div className="home-indicator" />
        </div>
    );
}

/* ===== LOGIN / SIGNUP SCREEN ===== */

function LoginScreen({ mode, onBack, onSwitchMode }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const isLogin = mode === "login";

    function handleSubmit(e) {
        e.preventDefault();
        // TODO: later wire this to Supabase email/password auth if you want
        alert(
            `${isLogin ? "Logging in" : "Creating account"} for:\n${email}`
        );
    }

    async function handleGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin,
                },
            });

            if (error) {
                console.error("Google sign-in error:", error);
                alert("Google sign-in error: " + error.message);
            } else {
                console.log("Google OAuth started:", data);
            }
        } catch (err) {
            console.error("Google sign-in failed:", err);
            alert("Something went wrong with Google sign-in.");
        }
    }

    async function handleGithub() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: {
                    redirectTo: window.location.origin,
                },
            });

            if (error) {
                console.error("GitHub sign-in error:", error);
                alert("GitHub sign-in error: " + error.message);
            } else {
                console.log("GitHub OAuth started:", data);
            }
        } catch (err) {
            console.error("GitHub sign-in failed:", err);
            alert("Something went wrong with GitHub sign-in.");
        }
    }

    return (
        <div className="screen screen-login">
            <header className="topbar">
                <button className="icon-btn" type="button" onClick={onBack}>
                    ‹
                </button>
                <div className="topbar-title">
                    {isLogin ? "Log in" : "Create account"}
                </div>
                <img src={Brand} alt="Axela small logo" className="topbar-logo" />
            </header>

            <div className="pad login-content">
                <form className="login-card" onSubmit={handleSubmit}>
                    <p className="login-caption">
                        {isLogin
                            ? "Sign in to continue your Axela session."
                            : "Create your Axela account to sync your assistant everywhere."}
                    </p>

                    <label className="field">
                        <span className="field-label">Email</span>
                        <input
                            className="field-input"
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">Password</span>
                        <input
                            className="field-input"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>

                    <div className="field-row">
                        <label className="remember">
                            <input type="checkbox" defaultChecked /> <span>Remember me</span>
                        </label>
                        {isLogin && (
                            <button type="button" className="link-text">
                                Forgot password?
                            </button>
                        )}
                    </div>

                    <button type="submit" className="btn btn-accent btn-full">
                        {isLogin ? "Log in" : "Create account"}
                    </button>

                    <div className="divider">
                        <span>or continue with</span>
                    </div>

                    <div className="oauth-row">
                        <button
                            type="button"
                            className="oauth-btn"
                            onClick={handleGoogle}
                        >
                            <GoogleIcon />
                            <span>Google</span>
                        </button>
                        <button
                            type="button"
                            className="oauth-btn"
                            onClick={handleGithub}
                        >
                            <GithubIcon />
                            <span>GitHub</span>
                        </button>
                    </div>

                    <p className="login-footer">
                        {isLogin ? (
                            <>
                                New to Axela?{" "}
                                <button
                                    type="button"
                                    className="link-text"
                                    onClick={() => onSwitchMode("signup")}
                                >
                                    Create an account
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    className="link-text"
                                    onClick={() => onSwitchMode("login")}
                                >
                                    Log in
                                </button>
                            </>
                        )}
                    </p>
                </form>
            </div>

            <div className="home-indicator" />
        </div>
    );
}

/* ===== ICONS ===== */

function GoogleIcon() {
    return (
        <svg className="oauth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.96h5.24c-.23 1.33-1.57 3.9-5.24 3.9-3.16 0-5.74-2.6-5.74-5.8s2.58-5.8 5.74-5.8c1.8 0 3 .77 3.69 1.43l2.52-2.43C16.8 3.8 14.75 3 12.18 3 6.98 3 2.76 7.22 2.76 12.42s4.22 9.42 9.42 9.42c6.23 0 8.3-4.36 8.3-6.53 0-.44-.05-.72-.13-1.21z"
            />
        </svg>
    );
}

function GithubIcon() {
    return (
        <svg className="oauth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12 .5C5.73.5.75 5.48.75 11.77c0 5 3.25 9.23 7.76 10.73.57.12.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.16.69-3.83-1.36-3.83-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.19 1.75 1.19 1.02 1.76 2.68 1.25 3.33.96.1-.76.4-1.25.72-1.54-2.52-.29-5.17-1.26-5.17-5.62 0-1.24.45-2.25 1.19-3.04-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.16a10.9 10.9 0 0 1 2.9-.39c.99 0 1.99.13 2.9.39 2.2-1.47 3.17-1.16 3.17-1.16.64 1.6.24 2.78.12 3.07.74.79 1.18 1.8 1.18 3.04 0 4.38-2.66 5.33-5.2 5.61.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.13 0 .3.21.68.79.56 4.5-1.5 7.75-5.73 7.75-10.73C23.25 5.48 18.27.5 12 .5Z"
            />
        </svg>
    );
}