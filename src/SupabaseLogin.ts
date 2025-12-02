// src/SupabaseLogin.tsx
import React, { useState, FormEvent } from "react";
import { supabase } from "./supabaseClient";

const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 420,
    background: "#0b1120",
    borderRadius: 16,
    border: "1px solid #1f2937",
    padding: "24px 24px 20px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    marginBottom: 12,
    height: 40,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#020617",
    color: "#e5e7eb",
    padding: "0 12px",
    fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
    width: "100%",
    marginTop: 8,
    height: 42,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#0b0f19",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(234, 88, 12, 0.4)",
};

const ghostButtonStyle: React.CSSProperties = {
    width: "100%",
    marginTop: 8,
    height: 42,
    borderRadius: 999,
    border: "1px solid #374151",
    background: "#020617",
    color: "#e5e7eb",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
};

const iconCircle: React.CSSProperties = {
    width: 22,
    height: 22,
    borderRadius: "999px",
    border: "1px solid #4b5563",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
};

export default function SupabaseLogin() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required.");
            return;
        }

        setBusy(true);
        try {
            if (mode === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password: password.trim(),
                });
                if (error) throw error;
                setMessage("Logged in successfully.");
            } else {
                const { error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password: password.trim(),
                });
                if (error) throw error;
                setMessage("Account created. Check your email to confirm.");
            }
        } catch (err: any) {
            setError(err.message ?? "Something went wrong.");
        } finally {
            setBusy(false);
        }
    };

    const handleOAuth = async (provider: "google" | "github") => {
        setError(null);
        setMessage(null);
        setBusy(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
            // Supabase will handle redirect, nothing else here.
        } catch (err: any) {
            setError(err.message ?? "Unable to start OAuth login.");
            setBusy(false);
        }
    };

    return (
        <div
            style={{
        minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at top, #1f2933 0, #020617 55%)",
            color: "#f9fafb",
            padding: 16,
    }}
>
    <form style={cardStyle} onSubmit={handleSubmit}>
    <h1 style={{ margin: 0, marginBottom: 8, fontSize: 26, fontWeight: 800 }}>
    Axela
    </h1>
    <p
    style={{
        margin: 0,
            marginBottom: 16,
            color: "#9ca3af",
            fontSize: 14,
    }}
>
    Command your world. Axela does the rest.
    </p>

    <p
    style={{
        margin: 0,
            marginBottom: 20,
            color: "#9ca3af",
            fontSize: 13,
    }}
>
    {mode === "login"
        ? "Log in with your Axela account or continue with Google / GitHub."
        : "Create an Axela account with email and password."}
    </p>

    <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
    Email
    </label>
    <input
    type="email"
    placeholder="you@example.com"
    value={email}
    disabled={busy}
    onChange={(e) => setEmail(e.target.value)}
    style={inputStyle}
    />

    <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
    Password
    </label>
    <input
    type="password"
    placeholder="••••••••"
    value={password}
    disabled={busy}
    onChange={(e) => setPassword(e.target.value)}
    style={inputStyle}
    />

    {error && (
        <p
            style={{
        color: "#f97373",
            fontSize: 13,
            marginTop: 4,
            marginBottom: 4,
    }}
    >
        {error}
        </p>
    )}
    {message && (
        <p
            style={{
        color: "#4ade80",
            fontSize: 13,
            marginTop: 4,
            marginBottom: 4,
    }}
    >
        {message}
        </p>
    )}

    <button type="submit" disabled={busy} style={buttonStyle}>
    {busy
        ? mode === "login"
            ? "Logging in..."
            : "Creating..."
        : mode === "login"
            ? "Log in"
            : "Create account"}
    </button>

    <div
    style={{
        display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#6b7280",
            fontSize: 12,
            marginTop: 14,
            marginBottom: 4,
    }}
>
    <span style={{ flex: 1, height: 1, background: "#111827" }} />
    <span>Or continue with</span>
    <span style={{ flex: 1, height: 1, background: "#111827" }} />
    </div>

    <button
    type="button"
    disabled={busy}
    onClick={() => handleOAuth("google")}
    style={ghostButtonStyle}
    >
    <span style={iconCircle}>G</span>
        <span>Sign in with Google</span>
    </button>

    <button
        type="button"
    disabled={busy}
    onClick={() => handleOAuth("github")}
    style={ghostButtonStyle}
    >
    <span style={iconCircle}>🐱</span>
    <span>Continue with GitHub</span>
    </button>

    <p
        style={{
        marginTop: 16,
            fontSize: 13,
            color: "#9ca3af",
            textAlign: "center",
    }}
>
    {mode === "login" ? (
        <>
            Don&apos;t have an account?{" "}
        <button
        type="button"
        onClick={() => {
        setMode("signup");
        setError(null);
        setMessage(null);
    }}
        style={{
        background: "none",
            border: "none",
            color: "#f97316",
            cursor: "pointer",
            fontSize: 13,
            padding: 0,
    }}
    >
        Create one
    </button>
    </>
    ) : (
        <>
            Already have an account?{" "}
        <button
        type="button"
        onClick={() => {
        setMode("login");
        setError(null);
        setMessage(null);
    }}
        style={{
        background: "none",
            border: "none",
            color: "#f97316",
            cursor: "pointer",
            fontSize: 13,
            padding: 0,
    }}
    >
        Log in
        </button>
        </>
    )}
    </p>

    <p
    style={{
        marginTop: 4,
            fontSize: 11,
            color: "#6b7280",
            textAlign: "center",
    }}
>
    By continuing, you agree to our Terms and Privacy Policy.
    </p>
    </form>
    </div>
);
}