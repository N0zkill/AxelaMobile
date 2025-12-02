import React, { useState } from "react";
import Brand from "./assets/axela_logo_no_bg.webp"; // your Axela logo

export default function App() {
    return (
        <div className="app-shell">
            <PhoneAuth />
        </div>
    );
}

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
        alert(
            `${isLogin ? "Logging in" : "Creating account"} for:\n${email}`
        );
        // here is where real auth would go later
    }

    function handleGoogle() {
        alert(
            `${isLogin ? "Log in" : "Sign up"} with Google (placeholder only)`
        );
    }

    function handleGithub() {
        alert(
            `${isLogin ? "Log in" : "Sign up"} with GitHub (placeholder only)`
        );
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
        <svg
            className="oauth-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.96h5.24c-.23 1.33-1.57 3.9-5.24 3.9-3.16 0-5.74-2.6-5.74-5.8s2.58-5.8 5.74-5.8c1.8 0 3 .77 3.69 1.43l2.52-2.43C16.8 3.8 14.75 3 12.18 3 6.98 3 2.76 7.22 2.76 12.42s4.22 9.42 9.42 9.42c6.23 0 8.3-4.36 8.3-6.53 0-.44-.05-.72-.13-1.21z"
            />
        </svg>
    );
}

function GithubIcon() {
    return (
        <svg
            className="oauth-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                fill="currentColor"
                d="M12 .5C5.73.5.75 5.48.75 11.77c0 5 3.25 9.23 7.76 10.73.57.12.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.16.69-3.83-1.36-3.83-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.19 1.75 1.19 1.02 1.76 2.68 1.25 3.33.96.1-.76.4-1.25.72-1.54-2.52-.29-5.17-1.26-5.17-5.62 0-1.24.45-2.25 1.19-3.04-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.16a10.9 10.9 0 0 1 2.9-.39c.99 0 1.99.13 2.9.39 2.2-1.47 3.17-1.16 3.17-1.16.64 1.6.24 2.78.12 3.07.74.79 1.18 1.8 1.18 3.04 0 4.38-2.66 5.33-5.2 5.61.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.13 0 .3.21.68.79.56 4.5-1.5 7.75-5.73 7.75-10.73C23.25 5.48 18.27.5 12 .5Z"
            />
        </svg>
    );
}