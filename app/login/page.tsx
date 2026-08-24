"use client";

import Script from "next/script";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Zap, Sparkles, ShieldCheck, Headphones } from "lucide-react";

type GoogleIdApi = {
  initialize: (options: {
    client_id: string;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    callback: (response: {
      credential?: string;
      error?: string;
    }) => void;
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

  disableAutoSelect?: () => void;
};

/* ============================================================
   GOOGLE WINDOW TYPE
============================================================ */

declare global {
  interface Window {
    google?: {
      accounts: {
        id?: GoogleIdApi;
      };
    };
  }
}

export default function Home() {
  const router = useRouter();

  const googleButtonRef =
    useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [googleReady, setGoogleReady] =
    useState(false);

  const [error, setError] =
    useState("");

  const busy =
    loading || googleLoading;

  /* ============================================================
     NORMAL EMAIL LOGIN
  ============================================================ */

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (busy) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data =
        await response
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
     GOOGLE CREDENTIAL LOGIN
  ============================================================ */

  async function handleGoogleCredential(
    credential: string
  ) {
    setError("");
    setGoogleLoading(true);

    try {
      const response = await fetch(
        "/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            credential,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        console.error(
          "Google backend error:",
          data
        );

        setError(
          data.error ||
            "Google login failed."
        );

        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(
        "Google login request error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  /* ============================================================
     GOOGLE INITIALIZE
  ============================================================ */

  function initializeGoogle() {
    if (!window.google) {
      setGoogleReady(false);
      return false;
    }

    const clientId =
      process.env
        .NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError(
        "Google login is not configured."
      );

      setGoogleReady(false);
      return false;
    }

    if (!googleButtonRef.current) {
      setGoogleReady(false);
      return false;
    }

    const googleId =
      window.google.accounts.id;

    if (
      !googleId ||
      typeof googleId.initialize !==
        "function"
    ) {
      setError(
        "Google Sign-In could not be initialized."
      );

      setGoogleReady(false);
      return false;
    }

    /* Avoid rendering multiple times */

    googleButtonRef.current.innerHTML =
      "";

    googleId.initialize({
      client_id: clientId,

      auto_select: false,

      cancel_on_tap_outside: true,

      callback: (response) => {
        if (
          response?.credential
        ) {
          handleGoogleCredential(
            response.credential
          );

          return;
        }

        setGoogleLoading(false);

        setError(
          "Google authentication failed."
        );
      },
    });

    googleId.renderButton(
      googleButtonRef.current,
      {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 380,
        logo_alignment: "left",
      }
    );

    setGoogleReady(true);

    return true;
  }

  /* ============================================================
     CUSTOM GOOGLE BUTTON
  ============================================================ */

  function handleGoogleLogin() {
    setError("");

    if (!window.google) {
      setError(
        "Google Sign-In is still loading. Please try again."
      );

      return;
    }

    if (!googleReady) {
      const ready =
        initializeGoogle();

      if (!ready) return;
    }

    setGoogleLoading(true);

    window.setTimeout(() => {
      const button =
        googleButtonRef.current?.querySelector(
          "div[role='button']"
        ) as HTMLElement | null;

      if (button) {
        button.click();
        return;
      }

      setGoogleLoading(false);

      setError(
        "Google Sign-In is still loading. Please try again."
      );
    }, 50);
  }

  /* ============================================================
     LOAD GOOGLE SCRIPT
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const checkGoogle = () => {
      if (cancelled) return;

      if (
        window.google &&
        googleButtonRef.current
      ) {
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

      <main className="relative min-h-screen overflow-hidden bg-[#f8f7ff] text-slate-900">

        {/* ======================================================
            PREMIUM BACKGROUND
        ====================================================== */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">

          {/* Base ambient gradient */}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.18),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(217,70,239,0.14),transparent_30%),radial-gradient(circle_at_50%_65%,rgba(99,102,241,0.10),transparent_38%),linear-gradient(135deg,#faf9ff_0%,#f5f3ff_45%,#faf7ff_100%)]" />

          {/* Violet glow */}

          <div className="absolute -left-[220px] -top-[180px] h-[620px] w-[620px] rounded-full bg-violet-400/20 blur-[130px]" />

          {/* Pink glow */}

          <div className="absolute -right-[220px] top-[40px] h-[600px] w-[600px] rounded-full bg-fuchsia-400/15 blur-[140px]" />

          {/* Center atmosphere */}

          <div className="absolute left-[35%] top-[25%] h-[500px] w-[500px] rounded-full bg-indigo-300/10 blur-[150px]" />

          {/* Bottom glow */}

          <div className="absolute -bottom-[300px] left-[25%] h-[650px] w-[650px] rounded-full bg-purple-400/15 blur-[150px]" />

          {/* Premium grid */}

          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "70px 70px",
              maskImage:
                "linear-gradient(to bottom, black, transparent 85%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black, transparent 85%)",
            }}
          />

          {/* Dot pattern left */}

          <div
            className="absolute left-0 top-[30%] h-52 w-52 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(124,58,237,0.45) 1px, transparent 1px)",
              backgroundSize: "12px 12px",
              maskImage:
                "radial-gradient(circle, black, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(circle, black, transparent 70%)",
            }}
          />

          {/* Dot pattern right */}

          <div
            className="absolute bottom-[18%] right-0 h-56 w-56 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(217,70,239,0.5) 1px, transparent 1px)",
              backgroundSize: "13px 13px",
              maskImage:
                "radial-gradient(circle, black, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(circle, black, transparent 70%)",
            }}
          />

          {/* Floating orbs */}

          <div className="absolute left-[7%] top-[46%] h-16 w-16 rounded-full bg-gradient-to-br from-violet-400/30 to-fuchsia-400/10 shadow-[0_0_50px_rgba(139,92,246,0.25)]" />

          <div className="absolute right-[8%] top-[22%] h-20 w-20 rounded-full bg-gradient-to-br from-fuchsia-400/25 to-violet-400/10 shadow-[0_0_60px_rgba(217,70,239,0.25)]" />

          <div className="absolute bottom-[10%] left-[8%] h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400/15 to-violet-400/10 shadow-[0_0_70px_rgba(99,102,241,0.2)]" />

          {/* Light rings */}

          <div className="absolute -left-32 top-[15%] h-[420px] w-[420px] rounded-full border border-violet-300/15" />

          <div className="absolute -left-44 top-[12%] h-[520px] w-[520px] rounded-full border border-violet-300/10" />

          <div className="absolute -right-32 bottom-[12%] h-[430px] w-[430px] rounded-full border border-fuchsia-300/15" />

          <div className="absolute -right-44 bottom-[8%] h-[530px] w-[530px] rounded-full border border-fuchsia-300/10" />

          {/* Tiny particles */}

          <div className="absolute left-[14%] top-[24%] h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.8)]" />

          <div className="absolute right-[18%] top-[34%] h-1 w-1 rounded-full bg-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.8)]" />

          <div className="absolute left-[20%] bottom-[24%] h-1 w-1 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.8)]" />

          <div className="absolute right-[12%] bottom-[30%] h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.8)]" />

        </div>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-10">

          <div className="flex items-center gap-3">

            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-500 text-lg font-black text-white shadow-[0_10px_30px_rgba(124,58,237,0.30)]">
              D

              <div className="absolute inset-0 rounded-2xl bg-white/20" />
            </div>

            <div>

              <div className="text-lg font-black tracking-tight text-slate-950">
                Dream
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
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
      .getElementById("login-card")
      ?.scrollIntoView({
        behavior: "smooth",
      })
  }
  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-black text-white shadow-[0_10px_30px_rgba(124,58,237,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(124,58,237,0.35)]"
>
  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
  <span className="relative flex items-center gap-1.5">
    <span>Sign in</span>
    <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
      &#8594;
    </span>
  </span>
</button>

        </header>

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="relative z-10 mx-auto max-w-6xl px-4 pb-3 pt-1 text-center sm:px-6">

          <div className="mx-auto mb-5 flex items-center justify-center gap-2">

            <div className="h-px w-10 bg-gradient-to-r from-transparent to-violet-400" />

            <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />

            <div className="h-px w-10 bg-gradient-to-l from-transparent to-fuchsia-400" />

          </div>

          <h1 className="mx-auto max-w-5xl text-[42px] font-black leading-[0.98] tracking-[-0.065em] text-slate-950 sm:text-6xl lg:text-[76px]">

            Grow smarter.

            <span className="mt-2 block bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
              Manage everything.
            </span>

          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
            One modern workspace for your social media services, orders,
            balance and support.
          </p>

          {/* FEATURES */}

          <div className="mx-auto mt-7 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

            <Feature
              icon="fast"
              title="Fast Orders"
              text="Quick service ordering"
            />

            <Feature
              icon="services"
              title="1000+ Services"
              text="Large service catalog"
            />

            <Feature
              icon="secure"
              title="Secure"
              text="Protected account"
            />

            <Feature
              icon="support"
              title="24/7 Support"
              text="Help when needed"
            />

          </div>

        </section>

        {/* ======================================================
            LOGIN CARD
        ====================================================== */}

        <section
          id="login-card"
          className="relative z-10 mx-auto -mt-1 w-full max-w-[500px] px-4 pb-12 pt-5 sm:px-6"
        >

          <div className="pointer-events-none absolute left-1/2 top-8 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-400/20 blur-[90px]" />

          <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/75 p-5 shadow-[0_30px_100px_rgba(76,29,149,0.13)] backdrop-blur-2xl sm:p-8">

            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />

            {/* LOGIN HEADER */}

            <div className="mb-7 text-center">

              <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                Welcome back
              </h2>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              </p>

            </div>

            {/* GOOGLE */}

            <div className="relative h-14 w-full">

              <button
                type="button"
                onClick={
                  handleGoogleLogin
                }
                disabled={busy}
                className="pointer-events-none absolute inset-0 z-0 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white text-sm font-bold text-slate-700 shadow-[0_5px_20px_rgba(15,23,42,0.05)] transition disabled:opacity-50"
              >

                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-xl font-black shadow-sm">

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

              <div
                ref={googleButtonRef}
                onClick={() => {
                  if (!googleLoading) {
                    setGoogleLoading(
                      true
                    );
                  }
                }}
                className="absolute inset-0 z-10 flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl opacity-[0.02]"
              />

            </div>

            {/* DIVIDER */}

            <div className="my-6 flex items-center gap-3">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="whitespace-nowrap text-[9px] font-black tracking-[0.18em] text-slate-400">
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

            {/* EMAIL FORM */}

            <form
              onSubmit={handleLogin}
            >

              {/* EMAIL */}

              <div className="mb-5">

                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-violet-400">
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
                    className="h-14 w-full rounded-2xl border border-slate-200/90 bg-white/80 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-violet-200 hover:bg-white focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="mb-5">

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-xs font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-bold text-violet-600 transition hover:text-fuchsia-600"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-violet-400">
                    
                    <span className="text-sm font-black text-violet-400">&#8226;</span>
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
                    className="h-14 w-full rounded-2xl border border-slate-200/90 bg-white/80 pl-11 pr-20 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-violet-200 hover:bg-white focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) =>
                          !value
                      )
                    }
                    disabled={busy}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-[10px] font-black text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              <button
                type="submit"
                disabled={busy}
                className="group relative h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 text-sm font-black text-white shadow-[0_15px_35px_rgba(124,58,237,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(124,58,237,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
              >

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative flex items-center justify-center gap-2">
  {loading ? "Signing in..." : (
    <>
      <span>Sign in</span>
      <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
        &#8594;
      </span>
    </>
  )}
</span>

              </button>

            </form>

            {/* REGISTER */}

            <div className="mt-6 border-t border-slate-200/70 pt-6 text-center">

              <p className="text-sm font-medium text-slate-500">

                Don&apos;t have an account?

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/register"
                    )
                  }
                  className="ml-1 font-black text-violet-600 transition hover:text-fuchsia-600"
                >
                  Create account
                </button>

              </p>

            </div>

          </div>

          {/* SECURITY */}

          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">

            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[9px] text-emerald-500">&#10003;</span>

            Secure DreamSMM workspace

          </div>

        </section>

      </main>
    </>
  );
}

/* ================================================================
   FEATURE CARD
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
    <div className="group relative overflow-hidden rounded-[22px] border border-white/80 bg-white/65 p-4 shadow-[0_10px_35px_rgba(76,29,149,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/85 hover:shadow-[0_18px_45px_rgba(76,29,149,0.12)] sm:p-5">

      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-violet-300/20 blur-2xl transition-all duration-300 group-hover:bg-violet-400/30" />

      <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/90 bg-gradient-to-br from-white via-white to-slate-100 shadow-[0_5px_14px_rgba(15,23,42,0.10),inset_0_1px_2px_rgba(255,255,255,0.95)] ring-1 ring-slate-200/70 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
        {icon === "fast" && (
          <Zap
            className="h-7 w-7 text-violet-600 drop-shadow-[0_1px_1px_rgba(15,23,42,0.18)]"
            strokeWidth={2.5}
          />
        )}

        {icon === "services" && (
          <Sparkles
            className="h-7 w-7 text-violet-600 drop-shadow-[0_1px_1px_rgba(15,23,42,0.18)]"
            strokeWidth={2.5}
          />
        )}

        {icon === "secure" && (
          <ShieldCheck
            className="h-7 w-7 text-violet-600 drop-shadow-[0_1px_1px_rgba(15,23,42,0.18)]"
            strokeWidth={2.5}
          />
        )}

        {icon === "support" && (
          <Headphones
            className="h-7 w-7 text-violet-600 drop-shadow-[0_1px_1px_rgba(15,23,42,0.18)]"
            strokeWidth={2.5}
          />
        )}
      </div>

      <div className="mt-3 text-xs font-black text-slate-800 sm:text-sm">
        {title}
      </div>

      <div className="mt-1 text-[9px] font-medium leading-4 text-slate-400 sm:text-[10px]">
        {text}
      </div>

      <div className="mx-auto mt-3 h-0.5 w-5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50 transition-all duration-300 group-hover:w-10 group-hover:opacity-100" />

    </div>
  );
}

