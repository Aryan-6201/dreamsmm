"use client";

import Script from "next/script";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (options: {
            client_id: string;
            scope: string;
            ux_mode: "popup" | "redirect";
            select_account?: boolean;
            callback: (response: {
              code?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (error: {
              type: string;
            }) => void;
          }) => {
            requestCode: () => void;
          };
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

  const busy = loading || googleLoading;

  /* ============================================================
     NORMAL LOGIN
  ============================================================ */

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
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

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setError(
          data.error ||
            "Invalid email or password."
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     GOOGLE CODE LOGIN
  ============================================================ */

  async function handleGoogleCode(
    code: string
  ) {
    setError("");
    setGoogleLoading(true);

    try {
      const response = await fetch(
        "/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setError(
          data.error ||
            "Google login failed."
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Unable to connect to the server."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  /* ============================================================
     GOOGLE CODE CLIENT
  ============================================================ */

  function initializeGoogle() {
    if (!window.google) {
      setGoogleReady(false);
      return false;
    }

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError(
        "Google login is not configured."
      );
      setGoogleReady(false);
      return false;
    }

    setGoogleReady(true);

    return true;
  }

  /* ============================================================
     GOOGLE LOGIN BUTTON
  ============================================================ */

  function handleGoogleLogin() {
    setError("");

    if (!window.google) {
      setError(
        "Google Sign-In is still loading. Please try again."
      );
      return;
    }

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError(
        "Google login is not configured."
      );
      return;
    }

    setGoogleLoading(true);

    try {
      const client =
        window.google.accounts.oauth2.initCodeClient({
          client_id: clientId,

          /*
           * OpenID scopes are enough to identify
           * the Google account.
           */
          scope:
            "openid email profile",

          /*
           * IMPORTANT:
           * Popup mode gives the Google account
           * chooser/sign-in experience.
           */
          ux_mode: "popup",

          /*
           * Always let the user choose an account.
           */
          select_account: true,

          callback: (response) => {
            if (response.error) {
              setGoogleLoading(false);

              setError(
                response.error_description ||
                  "Google sign-in was cancelled."
              );

              return;
            }

            if (!response.code) {
              setGoogleLoading(false);

              setError(
                "Google did not return an authorization code."
              );

              return;
            }

            handleGoogleCode(
              response.code
            );
          },

          error_callback: (error) => {
            setGoogleLoading(false);

            if (
              error.type ===
              "popup_closed"
            ) {
              setError(
                "Google sign-in window was closed."
              );
              return;
            }

            if (
              error.type ===
              "popup_failed_to_open"
            ) {
              setError(
                "Google popup could not open. Please allow popups."
              );
              return;
            }

            setError(
              "Google sign-in could not be started."
            );
          },
        });

      client.requestCode();
    } catch (error) {
      console.error(
        "Google OAuth error:",
        error
      );

      setGoogleLoading(false);

      setError(
        "Unable to start Google sign-in."
      );
    }
  }

  /* ============================================================
     LOAD GOOGLE
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const checkGoogle = () => {
      if (cancelled) return;

      if (window.google) {
        initializeGoogle();
        return;
      }

      window.setTimeout(
        checkGoogle,
        300
      );
    };

    checkGoogle();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      <main className="min-h-screen overflow-hidden bg-gradient-to-br from-violet-100 via-white to-indigo-100 text-slate-900">

        {/* BACKGROUND */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">

          <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-violet-300/40 blur-[100px]" />

          <div className="absolute -right-32 top-0 h-[430px] w-[430px] rounded-full bg-fuchsia-200/50 blur-[110px]" />

          <div className="absolute bottom-[-180px] left-[20%] h-[500px] w-[500px] rounded-full bg-indigo-200/50 blur-[120px]" />

          <div className="absolute right-[10%] top-[42%] h-40 w-40 rounded-full bg-purple-200/30 blur-3xl" />

        </div>

        {/* HEADER */}

        <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-10">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-violet-300/40">
              D
            </div>

            <div>

              <div className="text-lg font-black tracking-tight text-slate-950">
                Dream
                <span className="text-violet-600">
                  SMM
                </span>
              </div>

              <div className="text-[8px] font-bold tracking-[0.2em] text-slate-400">
                SOCIAL MEDIA PANEL
              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById(
                  "login-card"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 sm:px-6 sm:py-3 sm:text-sm"
          >
            Sign in
          </button>

        </header>

        {/* HERO */}

        <section className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-8 text-center sm:px-6 sm:pt-12">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-violet-700 shadow-sm backdrop-blur">

            <span className="h-2 w-2 rounded-full bg-violet-500" />

            Premium Social Media Panel

          </div>

          <h1 className="mx-auto mt-6 max-w-5xl text-4xl font-black leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">

            Grow smarter.

            <span className="mt-2 block bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
              Manage everything.
            </span>

          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
            One modern workspace for your social media services, orders,
            balance and support.
          </p>

          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">

            <Feature
              icon="⚡"
              title="Fast Orders"
              text="Quick service ordering"
            />

            <Feature
              icon="🚀"
              title="1000+ Services"
              text="Large service catalog"
            />

            <Feature
              icon="🔒"
              title="Secure"
              text="Protected account"
            />

            <Feature
              icon="🎧"
              title="24/7 Support"
              text="Help when needed"
            />

          </div>

        </section>

        {/* LOGIN CARD */}

        <section
          id="login-card"
          className="relative z-10 mx-auto w-full max-w-[480px] px-4 pb-14 sm:px-6"
        >

          <div className="rounded-[32px] border border-white/90 bg-white/95 p-5 shadow-[0_35px_100px_rgba(76,29,149,0.15)] backdrop-blur-xl sm:p-8">

            <div className="mb-7 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-xl shadow-sm">
                🔐
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-600">
                Member Access
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue to your DreamSMM workspace.
              </p>

            </div>

            {/* GOOGLE */}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={busy}
              className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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

            {/* DIVIDER */}

            <div className="my-6 flex items-center gap-3">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="whitespace-nowrap text-[9px] font-black tracking-[0.16em] text-slate-400">
                OR CONTINUE WITH EMAIL
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-600">
                {error}
              </div>
            )}

            {/* EMAIL */}

            <form onSubmit={handleLogin}>

              <div className="mb-5">

                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-black text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    @
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                    required
                    disabled={busy}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-violet-200 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
                  />

                </div>

              </div>

              {/* PASSWORD */}

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
                    className="text-xs font-bold text-violet-600 transition hover:text-violet-700"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                    •
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={busy}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-20 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-violet-200 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    disabled={busy}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-[10px] font-black text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={busy}
                className="group relative h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 text-sm font-black text-white shadow-[0_15px_40px_rgba(109,74,255,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(109,74,255,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
              >

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative">
                  {loading
                    ? "Signing in..."
                    : "Sign in →"}
                </span>

              </button>

            </form>

            {/* REGISTER */}

            <div className="mt-6 border-t border-slate-100 pt-6 text-center">

              <p className="text-sm text-slate-500">

                Don&apos;t have an account?

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/register"
                    )
                  }
                  className="ml-1 font-black text-violet-600 hover:text-violet-700"
                >
                  Create account
                </button>

              </p>

            </div>

          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            Secure DreamSMM workspace

          </div>

        </section>

      </main>
    </>
  );
}

/* ================================================================
   FEATURE
================================================================ */

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md sm:p-4">

      <div className="text-xl">
        {icon}
      </div>

      <div className="mt-1 text-xs font-black text-slate-800">
        {title}
      </div>

      <div className="mt-1 text-[9px] font-medium leading-4 text-slate-400">
        {text}
      </div>

    </div>
  );
}