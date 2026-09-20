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

      <style jsx global>{`
        @keyframes dreamFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -12px, 0) rotate(2deg); }
        }
        @keyframes dreamGlow {
          0%, 100% { opacity: .35; transform: scale(1); }
          50% { opacity: .65; transform: scale(1.08); }
        }
        @keyframes dreamShimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        .dream-float { animation: dreamFloat 5s ease-in-out infinite; }
        .dream-float-slow { animation: dreamFloat 7s ease-in-out infinite; }
        .dream-glow { animation: dreamGlow 4s ease-in-out infinite; }
        .dream-shimmer { position: relative; overflow: hidden; }
        .dream-shimmer::after {
          content: "";
          position: absolute;
          inset: 0 auto 0 -45%;
          width: 35%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
          transform: skewX(-18deg);
          animation: dreamShimmer 3.8s ease-in-out infinite;
          pointer-events: none;
        }
        html { scroll-behavior: smooth; }
      `}</style>

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      <main className="min-h-screen overflow-x-hidden bg-[#eefbfb] text-slate-900">
        {/* ========================= HERO ========================= */}
        <section className="relative min-h-[800px] overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,.18),transparent_28%),radial-gradient(circle_at_85%_25%,rgba(255,255,255,.12),transparent_26%),linear-gradient(135deg,#087f8a_0%,#159aa5_42%,#45c2bd_72%,#8bd8cf_100%)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="dream-glow absolute -left-32 -top-24 h-[520px] w-[520px] rounded-full bg-cyan-100/20 blur-3xl" />
            <div className="dream-glow absolute -right-32 top-24 h-[500px] w-[500px] rounded-full bg-white/15 blur-3xl" />
            <div className="absolute left-[45%] top-[40%] h-[400px] w-[400px] rounded-full bg-teal-100/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[.16]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,.9) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage: "linear-gradient(to bottom, black, transparent 80%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black, transparent 80%)",
              }}
            />
            <div className="absolute left-[4%] top-[35%] h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute right-[8%] top-[55%] h-32 w-32 rounded-full bg-white/10 blur-xl" />
            <div className="dream-float absolute left-[7%] top-[28%] text-5xl opacity-50">💜</div>
            <div className="dream-float-slow absolute right-[8%] top-[31%] rotate-12 text-5xl opacity-60">🚀</div>
            <div className="absolute left-[4%] bottom-[13%] text-4xl opacity-50 animate-pulse">💬</div>
            <div className="absolute right-[4%] bottom-[15%] text-4xl opacity-50 animate-pulse">💎</div>
          </div>

          {/* NAVBAR */}
          <header className="relative z-20 mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-[26px] border border-white/20 bg-white/[.09] px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,.10)] backdrop-blur-xl sm:mt-5 sm:px-7 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#159aa5] shadow-[0_12px_30px_rgba(0,0,0,.12)]">
                D
              </div>
              <div>
                <div className="text-xl font-black tracking-tight text-white">
                  Dream<span className="text-yellow-300">SMM</span>
                </div>
                <div className="text-[9px] font-bold tracking-[.22em] text-white/70">
                  SOCIAL MEDIA MARKETING
                </div>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm font-black text-white/95 md:flex">
              <a href="#features" className="transition hover:text-yellow-300">Features</a>
              <a href="#how-it-works" className="transition hover:text-yellow-300">How it works</a>
              <a href="#reviews" className="transition hover:text-yellow-300">Reviews</a>
              <a href="#faq" className="transition hover:text-yellow-300">FAQ</a>
            </nav>

            <button
              type="button"
              onClick={() =>
                document.getElementById("login-card")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="dream-shimmer rounded-full border border-white/60 bg-white px-6 py-3 text-sm font-black text-[#0f7480] shadow-[0_12px_30px_rgba(0,0,0,.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,.20)]"
            >
              Sign in
            </button>
          </header>

          {/* MAIN HERO */}
          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pt-16">
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/[.12] px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white shadow-lg backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,.9)]" />
                Trusted SMM Panel
              </div>

              <h1 className="max-w-3xl text-[52px] font-black leading-[.94] tracking-[-.055em] text-white sm:text-6xl lg:text-[78px]">
                The Best &amp;
                <span className="block">Cheapest</span>
                <span className="block text-yellow-300">SMM Panel</span>
                <span className="mt-2 block">Trusted</span>
                <span className="block">Worldwide.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-white/85 sm:text-lg">
                One premium workspace for social growth — affordable services, lightning-fast delivery,
                clean ordering and support built for creators, businesses and agencies.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("login-card")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  className="dream-shimmer rounded-2xl bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-300 px-7 py-4 text-sm font-black text-slate-950 shadow-[0_18px_45px_rgba(0,0,0,.20)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(0,0,0,.25)]"
                >
                  Get Started →
                </button>
                <a
                  href="#features"
                  className="rounded-2xl border border-white/35 bg-white/10 px-7 py-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  Explore Services
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-xs font-bold text-white/75">
                <span>✓ Fast delivery</span>
                <span>✓ Affordable prices</span>
                <span>✓ 24/7 support</span>
              </div>

              <div className="pointer-events-none absolute -left-2 top-[7%] hidden text-4xl sm:block animate-pulse">
                ✨
              </div>
            </div>

            {/* LOGIN CARD */}
            <div id="login-card" className="relative scroll-mt-6">
              <div className="absolute -inset-5 rounded-[42px] bg-white/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/[.97] p-6 shadow-[0_35px_100px_rgba(0,55,65,.28)] ring-1 ring-white/50 sm:p-9">
                <div className="absolute left-1/2 top-0 h-1 w-1/2 -translate-x-1/2 rounded-full bg-[#159aa5]" />

                <div className="mb-6 text-center">
                  <div className="dream-glow mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8ffff] to-[#c9f2f1] text-xl font-black text-[#0b8994] shadow-[inset_0_2px_8px_rgba(255,255,255,.9),0_10px_25px_rgba(21,154,165,.12)] ring-1 ring-cyan-100">
                    D
                  </div>
                  <h2 className="text-[30px] font-black tracking-[-.04em] text-slate-950">
                    Welcome back
                  </h2>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Sign in to your DreamSMM account
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <label htmlFor="email" className="mb-2 block text-xs font-black text-slate-700">
                    Email
                  </label>
                  <div className="relative mb-4">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      required
                      disabled={busy}
                      className="h-14 w-full rounded-2xl border border-slate-200/80 bg-slate-50/90 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#159aa5] focus:bg-white focus:ring-4 focus:ring-[#159aa5]/10 disabled:opacity-50"
                    />
                  </div>

                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="login-password" className="text-xs font-black text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setError("Password recovery is not connected yet.")}
                      className="text-xs font-black text-[#159aa5] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative mb-5">
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      name="dreamsmm_login_secret"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      disabled={busy}
                      className="h-14 w-full rounded-2xl border border-slate-200/80 bg-slate-50/90 pl-11 pr-16 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#159aa5] focus:bg-white focus:ring-4 focus:ring-[#159aa5]/10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={busy}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-[#e7f8f8] hover:text-[#159aa5]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="dream-shimmer group h-14 w-full rounded-2xl bg-gradient-to-r from-[#087f8a] via-[#159aa5] to-[#35b7b2] text-sm font-black text-white shadow-[0_16px_35px_rgba(21,154,165,.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(21,154,165,.35)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? "Signing in..." : "Sign in"}
                      {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
                    </span>
                  </button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[9px] font-black tracking-[.18em] text-slate-400">OR</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* REAL GOOGLE BUTTON — keeps existing working Google flow */}
                <div className="relative h-[56px] overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={busy}
                    className="pointer-events-none absolute inset-0 z-0 flex h-full w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700"
                  >
                    <span className="text-xl font-black">G</span>
                    <span>{googleLoading ? "Signing in with Google..." : "Continue with Google"}</span>
                  </button>
                  <div
                    ref={googleButtonRef}
                    className="absolute inset-0 z-10 overflow-hidden rounded-2xl opacity-[0.02]"
                    onClick={() => {
                      if (!googleLoading) setGoogleLoading(true);
                    }}
                  />
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5 text-center text-sm font-medium text-slate-500">
                  Don&apos;t have an account?
                  <button
                    type="button"
                    onClick={() => router.push("/register")}
                    className="ml-1 font-black text-[#159aa5] hover:underline"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <div className="relative z-10 mx-auto -mt-1 max-w-6xl px-5 pb-14 sm:px-8">
          <div className="grid overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_24px_70px_rgba(0,0,0,.14)] ring-1 ring-white sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["⚡", "Instant Delivery", "Blazing Fast"],
              ["🛡️", "Secure & Safe", "100% Protected"],
              ["👥", "14M+ Orders", "Worldwide Trust"],
              ["🎧", "24/7 Support", "Always Here"],
            ].map(([icon, title, sub]) => (
              <div key={title} className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
                <div className="text-2xl">{icon}</div>
                <div>
                  <div className="text-sm font-black text-slate-900">{title}</div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section id="features" className="scroll-mt-10 bg-white px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-[.2em] text-[#159aa5]">
                Why DreamSMM
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Reasons to order SMM services from us
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Simple tools, clear pricing and fast service for your everyday social media workflow.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["✨", "Best quality", "Reliable services and a smooth ordering experience."],
                ["💳", "Many payment methods", "Convenient ways to add funds to your account."],
                ["₹", "Affordable services", "Competitive pricing across the service catalog."],
                ["⚡", "Very quick delivery", "Fast order processing keeps your workflow moving."],
              ].map(([icon, title, description]) => (
                <div key={title} className="group relative overflow-hidden rounded-[28px] border border-cyan-100 bg-gradient-to-br from-white to-[#effbfb] p-6 shadow-[0_12px_35px_rgba(15,116,128,.06)] transition duration-300 hover:-translate-y-2 hover:border-cyan-200 hover:shadow-[0_22px_50px_rgba(15,116,128,.14)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#159aa5] text-xl shadow-lg shadow-cyan-100">
                    {icon}
                  </div>
                  <h3 className="mt-5 text-base font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="scroll-mt-10 bg-[#eaf9f9] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-[.2em] text-[#159aa5]">
                Simple process
              </span>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">How to use our panel</h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-4">
              {[
                ["01", "Sign up", "Create your account and log in."],
                ["02", "Deposit funds", "Add funds using a convenient payment option."],
                ["03", "Pick SMM services", "Choose a service, target link and quantity."],
                ["04", "Quick results", "Place the order and track its progress."],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-[26px] border border-white bg-white p-6 shadow-[0_14px_35px_rgba(15,116,128,.08)] ring-1 ring-cyan-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(15,116,128,.12)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#159aa5] text-xs font-black text-white">
                    {number}
                  </div>
                  <h3 className="mt-5 font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section id="reviews" className="scroll-mt-10 bg-white px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-[.2em] text-[#159aa5]">
                Customer stories
              </span>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Our customers&apos; stories</h2>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Bayram Koc", "Fast service and an easy panel experience."],
                ["Ben Cho", "Simple ordering and affordable services."],
                ["Melissa Hendrick", "Everything is available from one place."],
                ["Kelly Newsom", "Easy to order and track social media services."],
              ].map(([name, review]) => (
                <div key={name} className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(15,23,42,.10)]">
                  <div className="text-yellow-400">★★★★★</div>
                  <p className="mt-4 text-sm leading-6 text-slate-500">“{review}”</p>
                  <p className="mt-5 font-black">{name}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Customer</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-10 bg-[#eaf9f9] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-[.2em] text-[#159aa5]">FAQ</span>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Most Popular Questions</h2>
            </div>

            <div className="mt-10 space-y-3">
              {[
                "What is an SMM panel?",
                "What SMM services do you sell on your panel?",
                "Are SMM services on your panel safe to buy?",
                "How is the mass order feature used?",
                "How is the Drip-feed feature used?",
                "What does a “mass order” mean?",
              ].map((question) => (
                <details key={question} className="group rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-cyan-100">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black">
                    {question}
                    <span className="text-xl text-[#159aa5] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 pr-8 text-sm leading-6 text-slate-500">
                    Open a support ticket if you need more information about this feature or service.
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#159aa5] px-5 py-16 text-center text-white">
          <h2 className="text-3xl font-black sm:text-4xl">Ready to grow?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80">
            Join DreamSMM and manage your social media orders from one simple workspace.
          </p>
          <button
            type="button"
            onClick={() => document.getElementById("login-card")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-6 rounded-2xl bg-yellow-300 px-7 py-4 text-sm font-black text-slate-900 shadow-xl transition hover:-translate-y-1 hover:bg-yellow-200"
          >
            Get Started →
          </button>
        </section>

        {/* FLOATING CONTACT */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ED9] text-xl text-white shadow-xl transition hover:-translate-y-1"
            aria-label="Telegram"
          >
            ✈
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-xl text-white shadow-xl transition hover:-translate-y-1"
            aria-label="WhatsApp"
          >
            ☎
          </a>
        </div>

        <footer className="bg-slate-950 px-5 py-10 text-center text-xs text-slate-400">
          <div className="text-lg font-black text-white">Dream<span className="text-[#159aa5]">SMM</span></div>
          <p className="mt-2">© 2026 DreamSMM. All rights reserved.</p>
          <p className="mt-1">Terms · Privacy · Refund · Contact · DMCA</p>
        </footer>
      </main>
    </>
  );
}
