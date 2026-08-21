"use client";

import Script from "next/script";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------
  // Normal login
  // -----------------------------

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // Google login
  // -----------------------------

  async function handleGoogleCredential(credential: string) {
    setError("");
    setGoogleLoading(true);

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Google login failed.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setGoogleLoading(false);
    }
  }

  function initializeGoogle() {
    const google = window.google;

    if (!google) {
      setGoogleReady(false);
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google login is not configured.");
      setGoogleReady(false);
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        handleGoogleCredential(response.credential);
      },
    });

    setGoogleReady(true);
  }

  function handleGoogleClick() {
    setError("");

    if (!window.google) {
      setError("Google Sign-In is still loading. Please try again.");
      return;
    }

    if (!googleReady) {
      initializeGoogle();
    }

    window.google.accounts.id.prompt();
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (window.google) {
        initializeGoogle();
        window.clearInterval(timer);
      }
    }, 300);

    return () => window.clearInterval(timer);
  }, []);

  const busy = loading || googleLoading;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      <main className="min-h-screen bg-gradient-to-br from-violet-100 via-white to-indigo-100 text-slate-900">
        {/* Background decoration */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl" />
          <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-fuchsia-200/50 blur-3xl" />
          <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-violet-200">
              D
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-950">
                Dream<span className="text-violet-600">SMM</span>
              </div>

              <div className="text-[8px] font-bold tracking-[0.18em] text-slate-400">
                SOCIAL MEDIA PANEL
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("login")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 sm:px-5 sm:text-sm"
          >
            Sign in
          </button>
        </header>

        {/* Hero */}
        <section className="relative z-10 mx-auto max-w-4xl px-4 pb-8 pt-8 text-center sm:px-6 sm:pt-12">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-violet-600 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Premium Social Media Panel
          </div>

          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-6xl">
            Grow smarter.
            <span className="block bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
              Manage everything.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
            One clean workspace for your social media services, orders,
            balance and support.
          </p>
        </section>

        {/* Login */}
        <section
          id="login"
          className="relative z-10 mx-auto w-full max-w-[460px] px-4 pb-12 sm:px-6"
        >
          <div className="rounded-[30px] border border-white bg-white p-5 shadow-[0_30px_90px_rgba(76,29,149,0.16)] sm:p-8">
            {/* Heading */}
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-xl shadow-sm">
                🔐
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                Member Access
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to your DreamSMM account.
              </p>
            </div>

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={busy}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white text-xl font-black shadow-sm">
                <span className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                  G
                </span>
              </span>

              <span>
                {googleLoading
                  ? "Signing in with Google..."
                  : "Continue with Google"}
              </span>
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[9px] font-black tracking-[0.15em] text-slate-400">
                OR CONTINUE WITH EMAIL
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-600">
                {error}
              </div>
            )}

            {/* Email form */}
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-black text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={busy}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-black text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-bold text-violet-600 hover:text-violet-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={busy}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={busy}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-[10px] font-black text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 text-sm font-black text-white shadow-[0_14px_40px_rgba(109,74,255,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(109,74,255,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            {/* Register */}
            <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?

              <button
                type="button"
                onClick={() => router.push("/register")}
                className="ml-1 font-black text-violet-600 hover:text-violet-700"
              >
                Create account
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Secure DreamSMM workspace
          </div>
        </section>
      </main>
    </>
  );
}