"use client";

import Script from "next/script";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
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

          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export default function Home() {
  const router = useRouter();

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleInitializedRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState("");

  const busy = loading || googleLoading;

  /* ================================
     NORMAL EMAIL LOGIN
  ================================= */

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ================================
     GOOGLE CREDENTIAL LOGIN
  ================================= */

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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Google login failed.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setGoogleLoading(false);
    }
  }

  /* ================================
     GOOGLE INITIALIZATION
     NO prompt()
  ================================= */

  function initializeGoogle() {
    const google = window.google;
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!google || !googleButtonRef.current) {
      return false;
    }

    if (!clientId) {
      setError(
        "Google login is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID."
      );
      return false;
    }

    if (googleInitializedRef.current) {
      return true;
    }

    google.accounts.id.initialize({
      client_id: clientId,

      callback: (response) => {
        if (response?.credential) {
          handleGoogleCredential(response.credential);
        }
      },
    });

    googleButtonRef.current.innerHTML = "";

    google.accounts.id.renderButton(
      googleButtonRef.current,
      {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 390,
        logo_alignment: "left",
      }
    );

    googleInitializedRef.current = true;
    setGoogleReady(true);

    return true;
  }

  /* ================================
     WAIT FOR GOOGLE SCRIPT
  ================================= */

  useEffect(() => {
    let cancelled = false;

    function waitForGoogle() {
      if (cancelled) return;

      if (
        window.google &&
        googleButtonRef.current
      ) {
        initializeGoogle();
        return;
      }

      window.setTimeout(
        waitForGoogle,
        250
      );
    }

    waitForGoogle();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      <main className="min-h-screen overflow-hidden bg-gradient-to-br from-violet-100 via-white to-indigo-100 text-slate-900">

        {/* ================================
            BACKGROUND
        ================================= */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">

          <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-violet-300/40 blur-[100px]" />

          <div className="absolute -right-32 top-0 h-[430px] w-[430px] rounded-full bg-fuchsia-200/50 blur-[110px]" />

          <div className="absolute bottom-[-180px] left-[20%] h-[500px] w-[500px] rounded-full bg-indigo-200/50 blur-[120px]" />

        </div>

        {/* ================================
            HEADER
        ================================= */}

        <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-violet-300/40">
              D
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-950">
                Dream<span className="text-violet-600">SMM</span>
              </div>

              <div className="text-[8px] font-bold tracking-[0.2em] text-slate-400">
                SOCIAL MEDIA PANEL
              </div>
            </div>

          </div>

        </header>

        {/* ================================
            MAIN
        ================================= */}

        <section className="relative z-10 mx-auto grid min-h-[calc(100vh-75px)] max-w-6xl items-center gap-10 px-4 pb-8 sm:px-6 lg:grid-cols-[1fr_460px] lg:gap-20 lg:px-10">

          {/* ================================
              DESKTOP BRANDING
          ================================= */}

          <div className="hidden lg:block">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-violet-700 shadow-sm backdrop-blur">

              <span className="h-2 w-2 rounded-full bg-violet-500" />

              Premium Social Media Panel

            </div>

            <h1 className="max-w-xl text-6xl font-black leading-[.98] tracking-[-0.06em] text-slate-950">

              Grow smarter.

              <span className="mt-3 block bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                Manage everything.
              </span>

            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-500">
              One modern workspace for your social media services,
              orders, balance and support.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">

              <span className="rounded-xl border border-white bg-white/80 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm">
                ⚡ Fast orders
              </span>

              <span className="rounded-xl border border-white bg-white/80 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm">
                🚀 1000+ services
              </span>

              <span className="rounded-xl border border-white bg-white/80 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm">
                🔒 Secure
              </span>

              <span className="rounded-xl border border-white bg-white/80 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm">
                🎧 24/7 support
              </span>

            </div>

          </div>

          {/* ================================
              LOGIN CARD
          ================================= */}

          <div
            id="login-card"
            className="w-full"
          >

            <div className="rounded-[30px] border border-white/90 bg-white/95 p-5 shadow-[0_30px_90px_rgba(76,29,149,.15)] backdrop-blur-xl sm:rounded-[32px] sm:p-8">

              {/* Login Header */}

              <div className="mb-6 text-center">

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-xl shadow-sm">
                  🔐
                </div>

                <h2 className="text-3xl font-black tracking-tight text-slate-950">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to your DreamSMM workspace.
                </p>

              </div>

              {/* ================================
                  REAL GOOGLE BUTTON
              ================================= */}

              <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">

                <div
                  ref={googleButtonRef}
                  className="flex min-h-[44px] w-full items-center justify-center overflow-hidden"
                />

              </div>

              {!googleReady && !googleLoading && (
                <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">
                  Loading Google Sign-In...
                </p>
              )}

              {googleLoading && (
                <div className="mt-3 rounded-2xl bg-violet-50 px-4 py-3 text-center text-xs font-bold text-violet-600">
                  Signing in with Google...
                </div>
              )}

              {/* ================================
                  DIVIDER
              ================================= */}

              <div className="my-5 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="whitespace-nowrap text-[8px] font-black tracking-[0.16em] text-slate-400">
                  OR CONTINUE WITH EMAIL
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              {/* ================================
                  ERROR
              ================================= */}

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* ================================
                  EMAIL LOGIN
              ================================= */}

              <form onSubmit={handleLogin}>

                {/* Email */}

                <div className="mb-4">

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
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                    required
                    disabled={busy}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-violet-200 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
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
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      disabled={busy}
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-violet-200 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      disabled={busy}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-[10px] font-black text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={busy}
                  className="group relative h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 text-sm font-black text-white shadow-[0_15px_40px_rgba(109,74,255,.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(109,74,255,.35)] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative">
                    {loading
                      ? "Signing in..."
                      : "Sign in →"}
                  </span>

                </button>

              </form>

              {/* Register */}

              <div className="mt-5 border-t border-slate-100 pt-5 text-center">

                <p className="text-sm text-slate-500">

                  Don&apos;t have an account?

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/register")
                    }
                    className="ml-1 font-black text-violet-600 hover:text-violet-700"
                  >
                    Create account
                  </button>

                </p>

              </div>

            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              Secure DreamSMM workspace

            </div>

          </div>

        </section>

      </main>
    </>
  );
}