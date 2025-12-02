import React, { useState } from "react";
import Brand from "./assets/axela_logo_no_bg.webp"; // your real Axela logo

export default function App() {
    return (
        <div className="app-shell">
            <AuthLayout />
            </div>
    );
}

function AuthLayout() {
    const [mode, setMode] = useState<"login" | "signup">("login");

    return (
        <div className="auth-bg">
        <div className="auth-card">
            {/* Brand / Logo */}
            <div className="auth-brand">
    <div className="auth-logo-pill">
    <img src={Brand} alt="Axela logo" className="auth-logo-img" />
        </div>
        <h1 className="auth-title">Axela</h1>
        <p className="auth-tagline">Command your world. Axela does the rest.</p>
    </div>

    {/* Toggle Login / Create account */}
    <div className="auth-toggle">
    <button
        className={
        "auth-toggle-btn" + (mode === "login" ? " auth-toggle-btn--active" : "")
    }
    type="button"
    onClick={() => setMode("login")}
>
    Log in
    </button>
    <button
    className={
        "auth-toggle-btn" + (mode === "signup" ? " auth-toggle-btn--active" : "")
    }
    type="button"
    onClick={() => setMode("signup")}
>
    Create account
    </button>
    </div>

    {mode === "login" ? <LoginForm /> : <SignupForm />}

    <p className="auth-footer-note">
        Protected by industry-standard encryption • v1.0
    </p>
    </div>

    {/* Soft orange glow in the background */}
    <div className="auth-glow auth-glow--top" />
    <div className="auth-glow auth-glow--bottom" />
        </div>
);
}

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        // Placeholder – this is where real auth would go
        alert(`Log in with:\nEmail: ${email}\nPassword: ${password}`);
    }

    function handleGoogle() {
        alert("Sign in with Google (placeholder – wire backend later)");
    }

    function handleGithub() {
        alert("Sign in with GitHub (placeholder – wire backend later)");
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
    <label className="auth-label">
        Email
        <input
    className="auth-input"
    type="email"
    required
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    />
    </label>

    <label className="auth-label">
        Password
        <input
    className="auth-input"
    type="password"
    required
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    />
    </label>

    <div className="auth-row">
    <label className="auth-checkbox-label">
    <input type="checkbox" className="auth-checkbox" defaultChecked />
    <span>Remember me</span>
    </label>
    <button type="button" className="auth-link">
        Forgot password?
        </button>
        </div>

        <button type="submit" className="auth-btn-primary">
        Log in
        </button>

        <div className="auth-divider">
        <span>or continue with</span>
    </div>

    <div className="auth-oauth-row">
    <button type="button" className="auth-oauth-btn" onClick={handleGoogle}>
        <GoogleIcon />
        <span>Google</span>
        </button>
        <button type="button" className="auth-oauth-btn" onClick={handleGithub}>
        <GithubIcon />
        <span>GitHub</span>
        </button>
        </div>
        </form>
);
}

function SignupForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        alert(`Create account:\nEmail: ${email}\nPassword: ${password}`);
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
    <label className="auth-label">
        Email
        <input
    className="auth-input"
    type="email"
    required
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    />
    </label>

    <label className="auth-label">
        Password
        <input
    className="auth-input"
    type="password"
    required
    placeholder="Minimum 8 characters"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    />
    </label>

    <button type="submit" className="auth-btn-primary">
        Create account
    </button>
    </form>
);
}

/* Simple inline SVG icons so you don't need extra packages */
function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="auth-icon" aria-hidden="true">
    <path
        fill="currentColor"
    d="M21.35 11.1h-9.17v2.96h5.24c-.23 1.33-1.57 3.9-5.24 3.9-3.16 0-5.74-2.6-5.74-5.8s2.58-5.8 5.74-5.8c1.8 0 3 .77 3.69 1.43l2.52-2.43C16.8 3.8 14.75 3 12.18 3 6.98 3 2.76 7.22 2.76 12.42S6.98 21.84 12.18 21.84c6.23 0 8.3-4.36 8.3-6.53 0-.44-.05-.72-.13-1.21z"
        />
        </svg>
);
}

function GithubIcon() {
    return (
        <svg viewBox="0 0 24 24" className="auth-icon" aria-hidden="true">
    <path
        fill="currentColor"
    d="M12 .5C5.73.5.75 5.48.75 11.77c0 5 3.25 9.23 7.76 10.73.57.12.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.16.69-3.83-1.36-3.83-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.19 1.75 1.19 1.02 1.76 2.68 1.25 3.33.96.1-.76.4-1.25.72-1.54-2.52-.29-5.17-1.26-5.17-5.62 0-1.24.45-2.25 1.19-3.04-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.16a10.9 10.9 0 0 1 2.9-.39c.99 0 1.99.13 2.9.39 2.2-1.47 3.17-1.16 3.17-1.16.64 1.6.24 2.78.12 3.07.74.79 1.18 1.8 1.18 3.04 0 4.38-2.66 5.33-5.2 5.61.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.13 0 .3.21.68.79.56 4.5-1.5 7.75-5.73 7.75-10.73C23.25 5.48 18.27.5 12 .5Z"
        />
        </svg>
);
}