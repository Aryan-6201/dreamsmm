"use client";

import Script from "next/script";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Mail, LockKeyhole, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

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
  const googleInitializedRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [showLoginSplash, setShowLoginSplash] = useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [googleReady, setGoogleReady] =
    useState(false);

  const [error, setError] =
    useState("");

  const busy =
    loading || googleLoading;

  function hideDashboardSplash() {
    document.getElementById("dreamsmm-login-splash")?.remove();
  }

  function showDashboardSplash() {
    const existing = document.getElementById("dreamsmm-login-splash");
    if (existing) return;

    const overlay = document.createElement("div");
    overlay.id = "dreamsmm-login-splash";
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#08060d;";

    const box = document.createElement("div");
    box.style.cssText = "width:240px;text-align:center;";

    const logo = document.createElement("div");
    logo.style.cssText = "margin-bottom:28px;color:#fff;font-size:30px;font-weight:900;letter-spacing:-.04em;";
    logo.innerHTML = 'Dream<span style="color:#8b5cf6">SMM</span>';

    const track = document.createElement("div");
    track.style.cssText = "height:4px;width:100%;overflow:hidden;border-radius:999px;background:rgba(255,255,255,.12);";

    const bar = document.createElement("div");
    bar.style.cssText = "height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#7c3aed,#d946ef);transition:width 1.2s ease-out;";

    track.appendChild(bar);
    box.appendChild(logo);
    box.appendChild(track);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => { bar.style.width = "100%"; });
    });
  }

  /* ============================================================
     NORMAL EMAIL LOGIN
  ============================================================ */

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (busy) return;

    setError("");
    showDashboardSplash();
    setShowLoginSplash(true);
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
        hideDashboardSplash();
        setShowLoginSplash(false);
        setError(
          data.error ||
            "Invalid email or password."
        );
        return;
      }

      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      router.replace("/dashboard");
      router.refresh();
      return;
    } catch {
      hideDashboardSplash();
      setShowLoginSplash(false);
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
    setShowLoginSplash(true);
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
        hideDashboardSplash();
        setShowLoginSplash(false);
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

      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      router.replace("/dashboard");
      router.refresh();
      return;
    } catch (err) {
      hideDashboardSplash();
      setShowLoginSplash(false);
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
    if (googleInitializedRef.current) return true;

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

    googleInitializedRef.current = true;
    setGoogleReady(true);

    return true;
  }

  /* ============================================================
     CUSTOM GOOGLE BUTTON
  ============================================================ */

  function handleGoogleLogin() {
    setError("");
    showDashboardSplash();

    if (!window.google) {
      setError(
        "Google Sign-In is still loading. Please try again."
      );

      return;
    }

    if (!googleReady) {
      const ready =
        initializeGoogle();

      if (!ready) {
        hideDashboardSplash();
        return;
      }
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

        <section className="relative z-10 mx-auto max-w-5xl px-4 pb-1 pt-1 text-center sm:px-6">

          <div className="mx-auto mb-5 flex items-center justify-center gap-2">

            <div className="h-px w-10 bg-gradient-to-r from-transparent to-violet-400" />

            <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />

            <div className="h-px w-10 bg-gradient-to-l from-transparent to-fuchsia-400" />

          </div>

          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/70 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 shadow-[0_8px_25px_rgba(124,58,237,0.08)] backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
            Welcome to DreamSMM
          </div>

          <h1 className="mx-auto max-w-4xl text-[36px] font-black leading-[1.03] tracking-[-0.052em] text-slate-950 sm:text-5xl lg:text-[60px]">

            Your social growth,

            <span className="mt-2 block bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
              beautifully managed.
            </span>

          </h1>

          <p className="mx-auto mt-3 max-w-xl text-[13px] font-medium leading-6 text-slate-500 sm:text-sm">
            One modern workspace for your social media services, orders,
            balance and support.
          </p>

        </section>

        {/* ======================================================
            LOGIN CARD
        ====================================================== */}

        <section
          id="login-card"
          className="relative z-10 mx-auto mt-1 w-full max-w-[480px] px-4 pb-10 pt-4 sm:px-6"
        >

          <div className="pointer-events-none absolute left-1/2 top-8 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-400/20 blur-[90px]" />

          <div className="relative overflow-hidden rounded-[30px] border border-white/95 bg-white/88 p-5 shadow-[0_30px_100px_rgba(76,29,149,0.15)] backdrop-blur-2xl sm:p-8">

            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />

            {/* LOGIN HEADER */}

            <div className="mb-5 text-center">

              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100 shadow-[0_8px_25px_rgba(124,58,237,0.10)]">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.3} />
              </div>

              <h2 className="text-[28px] font-black tracking-[-0.045em] text-slate-950">
                Welcome back
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
                One powerful workspace for orders, services, balance and support.
              </p>

            </div>

            {/* GOOGLE */}

            <div className="relative h-[58px] w-full">

              <button
                type="button"
                onClick={
                  handleGoogleLogin
                }
                disabled={busy}
                className="pointer-events-none absolute inset-0 z-0 flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white text-sm font-bold text-slate-700 shadow-[0_5px_20px_rgba(15,23,42,0.05)] transition disabled:opacity-50"
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
                className="absolute inset-0 z-10 flex h-[58px] w-full items-center justify-center overflow-hidden rounded-2xl opacity-[0.02]"
              />

            </div>

            {/* DIVIDER */}

            <div className="my-5 flex items-center gap-3">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="whitespace-nowrap text-[9px] font-black tracking-[0.18em] text-slate-400">
                OR CONTINUE WITH EMAIL
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-xs font-bold leading-5 text-red-600 shadow-sm">
                {error}
              </div>
            )}

            {/* EMAIL FORM */}

            <form
              onSubmit={handleLogin}
            >

              {/* EMAIL */}

              <div className="mb-4">

                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="Enter your email address"
                    autoComplete="email"
                    inputMode="email"
                    required
                    disabled={busy}
                    className="h-[56px] w-full rounded-[18px] border border-slate-200/90 bg-white/85 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-violet-200 hover:bg-white focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="mb-4">

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="login-password"
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

                  <input
                    id="login-password" name="dreamsmm_login_secret"
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
                    autoComplete="new-password"
                    required
                    disabled={busy}
                    className="h-[56px] w-full rounded-[18px] border border-slate-200/90 bg-white/85 pl-11 pr-20 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-violet-200 hover:bg-white focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                     className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
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
                className="group relative h-[56px] w-full overflow-hidden rounded-[18px] bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 text-sm font-black text-white shadow-[0_15px_35px_rgba(124,58,237,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(124,58,237,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
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

            {/* TRUST ROW */}

            <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-wide text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Secure sign-in
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <span>DreamSMM</span>
              <span className="h-3 w-px bg-slate-200" />
              <span>Fast access</span>
            </div>

            {/* REGISTER */}

            <div className="mt-4 border-t border-slate-200/70 pt-5 text-center">

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
                  Create your account
                </button>

              </p>

            </div>

          </div>

          {/* SECURITY */}

          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">

            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[9px] text-emerald-500">&#10003;</span>

            Protected by secure authentication

          </div>

        </section>


        {/* WHY CHOOSE US */}
        <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 shadow-sm">
              Why DreamSMM
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Everything you need to grow online
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
              Reliable services, simple ordering and a modern experience built for your social media workflow.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["✦", "Best quality", "We focus on reliable services and a smooth customer experience."],
              ["◈", "Many payment methods", "Choose a convenient way to add funds to your account."],
              ["₹", "Affordable services", "Competitive pricing makes it easier to order the services you need."],
              ["⚡", "Very quick delivery", "Fast order processing helps keep your orders moving quickly."],
            ].map(([icon, title, description]) => (
              <div key={title} className="rounded-[24px] border border-white/90 bg-white/75 p-6 shadow-[0_18px_55px_rgba(76,29,149,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-lg font-black text-white shadow-[0_10px_25px_rgba(124,58,237,0.22)]">
                  {icon}
                </div>
                <h3 className="mt-5 text-base font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW TO USE */}
        <section className="relative z-10 border-y border-violet-100/70 bg-white/45 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-fuchsia-200 bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-600">
                Simple process
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                How to use our panel
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500">
                Four simple steps from creating your account to receiving your results.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-4">
              {[
                ["1", "Sign up", "Create your account and log in."],
                ["2", "Deposit funds", "Add funds using a convenient payment option."],
                ["3", "Pick SMM services", "Choose a service, target link and quantity."],
                ["4", "Quick results", "Place the order and track its progress."],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-[24px] border border-white/90 bg-white/80 p-6 shadow-[0_18px_55px_rgba(76,29,149,0.07)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-black text-white">
                    {number}
                  </div>
                  <h3 className="mt-5 text-base font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CUSTOMER STORIES */}
        <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
              Customer stories
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              What our customers say
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Bayram Koc", "SMM services helped my business get more attention and made it easier to manage social media orders."],
              ["Ben Cho", "The ordering experience is simple, and the panel makes it easy to find affordable services."],
              ["Melissa Hendrick", "It is useful to have different social media services available from one place."],
              ["Kelly Newsom", "Having a dedicated panel makes ordering and tracking social media services much easier."],
            ].map(([name, review]) => (
              <div key={name} className="rounded-[24px] border border-white/90 bg-white/80 p-6 shadow-[0_18px_55px_rgba(76,29,149,0.08)]">
                <div className="text-amber-400">★★★★★</div>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-600">“{review}”</p>
                <p className="mt-5 text-sm font-black text-slate-950">{name}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Customer</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 border-t border-violet-100/70 bg-white/45 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600">
                FAQ
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Most popular questions
              </h2>
            </div>

            <div className="mt-10 space-y-3">
              {[
                ["What is an SMM panel?", "An SMM panel is an online dashboard where customers can browse, order and track social media services."],
                ["What SMM services do you sell?", "Available services depend on the services currently enabled on your DreamSMM panel."],
                ["Are SMM services on your panel safe to buy?", "Review each service's details and requirements before placing an order."],
                ["How is the mass order feature used?", "Mass ordering lets customers submit multiple supported orders through one workflow when available."],
                ["What does drip-feed mean?", "Drip-feed schedules delivery in smaller portions over a selected period when supported."],
                ["What does a mass order mean?", "A mass order means submitting multiple supported targets or orders together."],
              ].map(([question, answer]) => (
                <details key={question} className="group rounded-2xl border border-white/90 bg-white/80 px-5 py-4 shadow-[0_12px_35px_rgba(76,29,149,0.06)]">
                  <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
                    <span className="flex items-center justify-between gap-4">
                      {question}
                      <span className="text-lg text-violet-500 transition-transform group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 pr-8 text-sm font-medium leading-6 text-slate-500">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative z-10 border-t border-violet-100 bg-slate-950 py-10 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="text-xl font-black">Dream<span className="text-violet-400">SMM</span></div>
              <p className="mt-2 text-xs font-medium text-slate-400">Social media services, orders and support in one workspace.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-300">
              <button type="button" onClick={() => router.push("/login")} className="transition hover:text-white">Sign in</button>
              <span className="text-slate-700">•</span>
              <button type="button" onClick={() => router.push("/register")} className="transition hover:text-white">Create account</button>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 px-4 pt-5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:px-6 lg:px-8">
            © {new Date().getFullYear()} DreamSMM. All rights reserved.
          </div>
        </footer>

      </main>
    </>
  );
}
