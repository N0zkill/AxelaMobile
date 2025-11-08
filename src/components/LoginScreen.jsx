import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginScreen({
                                        appName = "Axela",
                                        tagline = "Bridging user empathy and engineering precision",
                                        onLogin,
                                        onForgotPassword,
                                        onGoogle,
                                        onApple,
                                        onSignUp,
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

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formValid || submitting) return;
        setSubmitting(true);
        setError("");
        try {
            if (onLogin) {
                await onLogin({ email, password, remember });
            } else {
                await new Promise((r) => setTimeout(r, 900)); // demo
            }
        } catch (err) {
            setError(err?.message || "Login failed. Check your credentials and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        {/* background now black with subtle warm tint */}
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0c0806] via-[#0b0a09] to-black text-neutral-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
            {/* Brand */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
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
                    <Field label="Email" htmlFor="email" description="Use your school or work email" error={emailErr}>
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
                            aria-describedby="email-desc"
                        />
                    </Field>

                    <Field label="Password" htmlFor="password" description="Minimum 8 characters with a number" error={pwErr}>
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
                                aria-describedby="pw-desc"
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
                            onClick={onForgotPassword}
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

                    {/* Primary CTA now orange */}
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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 transition-transform group-hover:translate-x-0.5">
                                <path d="M13.5 4.5 21 12l-7.5 7.5m6-7.5H3" />
                            </svg>
                        )}
                    </button>

                    <div className="relative text-center">
                        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <span className="relative bg-transparent px-3 text-xs text-white/70">or continue with</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <IconButton label="Google" onClick={onGoogle}><GoogleIcon /></IconButton>
                        <IconButton label="Apple" onClick={onApple}><AppleIcon /></IconButton>
                    </div>

                    <p className="text-center text-sm text-white/70">
                        New here?{" "}
                        <button
                            type="button"
                            onClick={onSignUp}
                            className="font-medium text-amber-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/60 rounded-lg px-1"
                        >
                            Create an account
                        </button>
                    </p>
                </form>
            </motion.div>

            <p className="mt-4 text-center text-xs text-white/50">Protected by industry-standard encryption • v1.0</p>
        </div>

        {/* Orange glow accents */}
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
                <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
                {error ? <span className="text-xs text-rose-300">{error}</span> : null}
            </div>
            {children}
            {description ? <p id={descId} className="text-xs text-white/60">{description}</p> : null}
        </div>
    );
}

function Spinner() {
    return (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
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
            <span className="h-5 w-5">{children}</span><span>{label}</span>
        </button>
    );
}

function LogoMark() {
    return (
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-orange-300" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2c-1.7 0-3 1.3-3 3v2.1c0 .5-.3 1-.7 1.2L6 9c-1.2.7-2 2-2 3.4V18c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4v-5.6c0-1.4-.8-2.7-2-3.4l-2.3-1.4c-.4-.2-.7-.7-.7-1.2V5c0-1.7-1.3-3-3-3zm0 8a4 4 0 014 4v2h-2v-2a2 2 0 10-4 0v2H8v-2a4 4 0 014-4z" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.35 11.1h-9.17v2.96h5.24c-.23 1.33-1.57 3.9-5.24 3.9-3.16 0-5.74-2.6-5.74-5.8s2.58-5.8 5.74-5.8c1.8 0 3 .77 3.69 1.43l2.52-2.43C16.8 3.8 14.75 3 12.18 3 6.98 3 2.76 7.22 2.76 12.42S6.98 21.84 12.18 21.84c6.23 0 8.3-4.36 8.3-6.53 0-.44-.05-.72-.13-1.21z" fill="currentColor"/>
        </svg>
    );
}

function AppleIcon() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.36 1.64c.02 1.13-.43 2.2-1.23 3-.78.86-1.9 1.43-3.06 1.35-.1-1.11.46-2.23 1.22-3.01.8-.86 2-1.44 3.07-1.34zM20.84 17.1c-.59 1.37-.87 1.97-1.62 3.17-1.04 1.68-2.51 3.78-4.33 3.8-1.62.02-2.04-1.1-4.26-1.1-2.22 0-2.68 1.08-4.3 1.12-1.82.04-3.22-1.82-4.27-3.49-2.33-3.58-4.1-10.12-1.72-14.54 1.18-2.22 3.3-3.63 5.6-3.67 1.75-.04 3.4 1.18 4.26 1.18.85 0 2.95-1.46 4.99-1.25.85.03 3.25.34 4.78 2.58-4.23 2.31-3.55 8.38.87 10.2z" fill="currentColor"/>
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
                style={{ background: "radial-gradient(closest-side, rgba(251,146,60,0.7), transparent 70%)" }} // orange-400
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full blur-3xl"
                style={{ background: "radial-gradient(closest-side, rgba(234,88,12,0.6), transparent 70%)" }} // orange-600
            />
        </div>
    );
}
