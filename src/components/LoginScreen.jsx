// src/components/LoginScreen.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function LoginScreen({
                                        appName = "Axela",
                                        tagline = "Bridging user empathy and engineering precision",
                                    }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [showPw, setShowPw] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const emailErr = useMemo(() => {
        if (!email) return "";
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        return ok ? "" : "Please enter a valid email";
    }, [email]);

    const pwErr = useMemo(() => {
        if (!password) return "";
        const long = password.length >= 8;
        const hasNum = /\d/.test(password);
        return long && hasNum ? "" : "Min 8 chars and at least one number";
    }, [password]);

    const formValid = email && password && !emailErr && !pwErr;

    // 🔐 Email + password login (Supabase)
    async function handleSubmit(e) {
        e.preventDefault();
        if (!formValid || submitting) return;

        setSubmitting(true);
        setError("");

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });
            if (error) throw error;

            // TODO: navigate to main Axela UI when ready
            console.log("✅ Logged in with Supabase");
        } catch (err) {
            console.error("Email login error:", err);
            setError(err?.message || "Login failed. Check your credentials and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    // 🟠 Google login
    async function handleGoogleClick() {
        if (submitting) return;
        setSubmitting(true);
        setError("");

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (err) {
            console.error("Google sign-in error:", err);
            setError(err?.message || "Google sign-in failed. Try again.");
            setSubmitting(false);
        }
    }

    // 🟣 GitHub login
    async function handleGithubClick() {
        if (submitting) return;
        setSubmitting(true);
        setError("");

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (err) {
            console.error("GitHub sign-in error:", err);
            setError(err?.message || "GitHub sign-in failed. Try again.");
            setSubmitting(false);
        }
    }

    // 📝 Simple email + password sign-up
    async function handleCreateAccount() {
        if (!email || !password) {
            setError("Enter email and password above, then tap Create an account.");
            return;
        }
        if (!formValid) {
            setError("Fix the validation errors before creating an account.");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
            });
            if (error) throw error;
        } catch (err) {
            console.error("Sign-up error:", err);
            setError(err?.message || "Could not create account. Try a different email.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        // full-screen gradient background
        <div className="min-h-screen w-full bg-gradient-to-b from-[#0c0806] via-[#0b0a09] to-black text-neutral-100 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Brand header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur flex items-center justify-center">
                        <LogoMark />
                    </div>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight">{appName}</h1>
                    {tagline ? (
                        <p className="mt-1 text-sm font-medium text-amber-200/80">
                            <span className="font-semibold">{tagline}</span>
                        </p>
                    ) : null}
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-2xl backdrop-blur p-5"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field
                            label="Email"
                            htmlFor="email"
                            description="Use your school or work email"
                            error={emailErr}
                        >
                            <input
                                id="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                className={inputClass()}
                                placeholder="you@farmingdale.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-invalid={!!emailErr}
                            />
                        </Field>

                        <Field
                            label="Password"
                            htmlFor="password"
                            description="Minimum 8 characters with a number"
                            error={pwErr}
                        >
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPw ? "text" : "password"}
                                    autoComplete="current-password"
                                    className={inputClass("pr-12")}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-invalid={!!pwErr}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((s) => !s)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-xs font-medium text-amber-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                                    aria-label={showPw ? "Hide password" : "Show password"}
                                >
                                    {showPw ? "Hide" : "Show"}
                                </button>
                            </div>
                        </Field>

                        <div className="flex items-center justify-between">
                            <label className="inline-flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-white/20 bg-black/20 accent-orange-500"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                />
                                Remember me
                            </label>
                            <button
                                type="button"
                                className="text-sm font-medium text-amber-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/60 rounded-lg px-1"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <AnimatePresence initial={false}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="text-sm text-rose-300/90 bg-rose-950/40 ring-1 ring-rose-800/40 rounded-xl p-3"
                                    role="alert"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Primary button */}
                        <button
                            type="submit"
                            disabled={!formValid || submitting}
                            className={[
                                "group relative inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3",
                                "text-sm font-semibold tracking-wide",
                                "ring-1 ring-white/10 shadow-lg",
                                formValid && !submitting
                                    ? "bg-orange-600/90 hover:bg-orange-600 text-white"
                                    : "bg-white/10 text-white/60 cursor-not-allowed",
                            ].join(" ")}
                        >
                            <span>Sign In</span>
                            {submitting ? (
                                <Spinner />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                                >
                                    <path d="M13.5 4.5 21 12l-7.5 7.5m6-7.5H3" />
                                </svg>
                            )}
                        </button>

                        <div className="relative text-center">
                            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="relative bg-transparent px-3 text-xs text-white/70">
                or continue with
              </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <IconButton label="Google" onClick={handleGoogleClick}>
                                <GoogleIcon />
                            </IconButton>
                            <IconButton label="GitHub" onClick={handleGithubClick}>
                                <GithubIcon />
                            </IconButton>
                        </div>

                        <p className="text-center text-sm text-white/70">
                            New here?{" "}
                            <button
                                type="button"
                                onClick={handleCreateAccount}
                                className="font-medium text-amber-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/60 rounded-lg px-1"
                            >
                                Create an account
                            </button>
                        </p>
                    </form>
                </motion.div>

                <p className="mt-4 text-center text-xs text-white/50">
                    Protected by industry-standard encryption • v1.0
                </p>
            </div>

            <AccentBlobs />
        </div>
    );
}

function inputClass(extra = "") {
    return [
        "w-full rounded-2xl bg-black/20 text-white placeholder-white/40",
        "ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/60",
        "px-4 py-3 text-sm",
        extra,
    ].join(" ");
}

function Field({ label, htmlFor, description, error, children }) {
    const descId = htmlFor + "-desc";
    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
                <label htmlFor={htmlFor} className="text-sm font-medium">
                    {label}
                </label>
                {error ? <span className="text-xs text-rose-300">{error}</span> : null}
            </div>
            {children}
            {description ? (
                <p id={descId} className="text-xs text-white/60">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

function Spinner() {
    return (
        <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
        </svg>
    );
}

function IconButton({ label, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
            aria-label={`Continue with ${label}`}
        >
            <span className="h-5 w-5">{children}</span>
            <span>{label}</span>
        </button>
    );
}

function LogoMark() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-orange-300"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12 2c-1.7 0-3 1.3-3 3v2.1c0 .5-.3 1-.7 1.2L6 9c-1.2.7-2 2-2 3.4V18c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4v-5.6c0-1.4-.8-2.7-2-3.4l-2.3-1.4c-.4-.2-.7-.7-.7-1.2V5c0-1.7-1.3-3-3-3zm0 8a4 4 0 014 4v2h-2v-2a2 2 0 10-4 0v2H8v-2a4 4 0 014-4z" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M21.35 11.1h-9.17v2.96h5.24c-.23 1.33-1.57 3.9-5.24 3.9-3.16 0-5.74-2.6-5.74-5.8s2.58-5.8 5.74-5.8c1.8 0 3 .77 3.69 1.43l2.52-2.43C16.8 3.8 14.75 3 12.18 3 6.98 3 2.76 7.22 2.76 12.42S6.98 21.84 12.18 21.84c6.23 0 8.3-4.36 8.3-6.53 0-.44-.05-.72-.13-1.21z"
                fill="currentColor"
            />
        </svg>
    );
}

function GithubIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
        >
            <path
                fill="currentColor"
                d="M12 .5C5.73.5.75 5.48.75 11.77c0 5 3.25 9.23 7.76 10.73.57.12.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.16.69-3.83-1.36-3.83-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.19 1.75 1.19 1.02 1.76 2.68 1.25 3.33.96.1-.76.4-1.25.72-1.54-2.52-.29-5.17-1.26-5.17-5.62 0-1.24.45-2.25 1.19-3.04-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.16a10.9 10.9 0 0 1 2.9-.39c.99 0 1.99.13 2.9.39 2.2-1.47 3.17-1.16 3.17-1.16.64 1.6.24 2.78.12 3.07.74.79 1.18 1.8 1.18 3.04 0 4.38-2.66 5.33-5.2 5.61.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.13 0 .3.21.68.79.56 4.5-1.5 7.75-5.73 7.75-10.73C23.25 5.48 18.27.5 12 .5Z"
            />
        </svg>
    );
}

function AccentBlobs() {
    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 1.2 }}
                className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
                style={{
                    background:
                        "radial-gradient(closest-side, rgba(251,146,60,0.7), transparent 70%)",
                }}
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full blur-3xl"
                style={{
                    background:
                        "radial-gradient(closest-side, rgba(234,88,12,0.6), transparent 70%)",
                }}
            />
        </div>
    );
}