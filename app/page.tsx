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
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} />
      <main className="min-h-screen overflow-hidden bg-[#efffff] text-slate-950">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 font-black text-white">D</div>
            <div><div className="text-lg font-black">Dream<span className="text-teal-600">SMM</span></div><div className="text-[8px] font-bold tracking-[.2em] text-slate-400">SOCIAL MEDIA PANEL</div></div>
          </div>
          <button type="button" onClick={() => document.getElementById("login-card")?.scrollIntoView({behavior:"smooth"})} className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white">Sign in →</button>
        </header>

        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pt-16">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-teal-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[.16em] text-teal-700">● The Best & Cheapest SMM Panel</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.95] tracking-[-.055em] sm:text-6xl lg:text-[78px]">Trusted<span className="block text-teal-600">Worldwide.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-7 text-slate-600">One modern workspace for your social media services, orders, balance and support.</p>
            <div className="mt-8 flex flex-wrap gap-3">{["Best quality","Affordable","Quick delivery"].map(x=><span key={x} className="rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm">✓ {x}</span>)}</div>
          </div>

          <section id="login-card" className="relative mx-auto w-full max-w-[480px]">
            <div className="absolute -inset-6 rounded-[40px] bg-teal-300/30 blur-3xl" />
            <div className="relative rounded-[30px] border border-white bg-white/95 p-5 shadow-[0_30px_100px_rgba(15,118,110,.16)] backdrop-blur-2xl sm:p-8">
              <div className="mb-5 text-center">
                <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-600"><ShieldCheck className="h-5 w-5"/></div>
                <h2 className="text-[28px] font-black">Welcome back</h2>
                <p className="mt-2 text-sm text-slate-500">Login to continue managing your orders and services.</p>
              </div>

              <div className="relative h-[58px] w-full">
                <button type="button" onClick={handleGoogleLogin} disabled={busy} className="pointer-events-none absolute inset-0 z-0 flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 disabled:opacity-50">
                  <span className="text-xl font-black text-blue-500">G</span>{googleLoading ? "Signing in with Google..." : "Continue with Google"}
                </button>
                <div ref={googleButtonRef} onClick={()=>{if(!googleLoading)setGoogleLoading(true)}} className="absolute inset-0 z-10 h-[58px] w-full overflow-hidden rounded-2xl opacity-[0.02]" />
              </div>

              <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200"/><span className="text-[9px] font-black tracking-[.18em] text-slate-400">OR CONTINUE WITH EMAIL</span><div className="h-px flex-1 bg-slate-200"/></div>
              {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">{error}</div>}

              <form onSubmit={handleLogin}>
                <label htmlFor="email" className="mb-2 block text-xs font-bold">Email address</label>
                <div className="relative mb-4"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email address" autoComplete="email" required disabled={busy} className="h-14 w-full rounded-[18px] border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"/></div>
                <label htmlFor="login-password" className="mb-2 block text-xs font-bold">Password</label>
                <div className="relative mb-4"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input id="login-password" name="dreamsmm_login_secret" type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required disabled={busy} className="h-14 w-full rounded-[18px] border border-slate-200 bg-white pl-11 pr-20 text-sm font-semibold outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"/><button type="button" onClick={()=>setShowPassword(v=>!v)} disabled={busy} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400">{showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div>
                <button type="submit" disabled={busy} className="h-14 w-full rounded-[18px] bg-slate-950 text-sm font-black text-white shadow-xl disabled:opacity-50">{loading?"Signing in...":"Sign in →"}</button>
              </form>

              <div className="mt-4 text-center text-xs font-bold text-slate-400">✓ Secure sign-in · Fast access</div>
              <div className="mt-5 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">Don't have an account? <button type="button" onClick={()=>router.push("/register")} className="font-black text-teal-600">Create your account</button></div>
            </div>
            <div className="mt-5 text-center text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">✓ Protected by secure authentication</div>
          </section>
        </section>

        <section className="border-y border-teal-100 bg-white/80 py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-teal-600">Why choose us</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Reasons to order SMM services from us</h2></div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[["Best quality","Reliable services selected for consistent results."],["Many payment methods","Convenient ways to fund your account."],["Affordable services","Competitive pricing for creators and businesses."],["Very quick delivery","Fast processing so your order can get moving."]].map(([a,b])=><div key={a} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm"><div className="mb-6 text-2xl text-teal-600">✓</div><h3 className="text-xl font-black">{a}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{b}</p></div>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-xs font-black uppercase tracking-[.2em] text-teal-600">Simple process</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">How to use our panel</h2></div><div className="grid gap-4 sm:grid-cols-2">{[["01","Sign up","Create your account in a few seconds."],["02","Deposit funds","Add balance using your preferred payment method."],["03","Pick SMM services","Choose a service and enter your order details."],["04","Quick results","Place your order and track it from your dashboard."]].map(([n,t,d])=><div key={n} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><span className="font-black text-teal-600">{n}</span><h3 className="mt-4 text-xl font-black">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{d}</p></div>)}</div></div>
        </section>

        <section className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-teal-300">Customer stories</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Our customers' stories</h2></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[["Bayram Koc","Fast delivery and an easy panel to use."],["Ben Cho","The ordering process is simple and clean."],["Melissa Hendrick","Good experience from deposit to delivery."],["Kelly Newsom","Everything I need is in one place."]].map(([n,q])=><div key={n} className="rounded-3xl border border-white/10 bg-white/5 p-6"><div className="text-amber-300">★★★★★</div><p className="mt-5 min-h-20 text-sm leading-6 text-slate-300">“{q}”</p><p className="mt-5 font-black">{n}</p></div>)}</div></div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
          <div className="text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-teal-600">FAQ</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Most Popular Questions</h2></div>
          <div className="mt-10 space-y-3">{[["What is an SMM panel?","An SMM panel is a platform where you can order social media marketing services from one dashboard."],["What SMM services do you sell on your panel?","Available services and pricing are shown directly in the panel."],["Are SMM services on your panel safe to buy?","Service quality can vary. Review each service description and use services responsibly."],["How is the mass order feature used?","Use the mass order feature when you need to submit multiple compatible orders together."],["How is the Drip-feed feature used?","Drip-feed spaces delivery over time when supported by the selected service."],["What does a “mass order” mean?","A mass order lets you submit multiple order lines in one request."]].map(([q,a])=><details key={q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="cursor-pointer list-none font-bold">{q}<span className="float-right text-teal-600">+</span></summary><p className="mt-4 text-sm leading-6 text-slate-500">{a}</p></details>)}</div>
        </section>

        <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 text-sm text-slate-500 sm:px-8 sm:flex-row sm:justify-between"><div><p className="font-black text-slate-950">Dream<span className="text-teal-600">SMM</span></p><p className="mt-1">Social media services, managed simply.</p></div><div className="flex gap-5 font-semibold"><a href="/register">Register</a><a href="#login-card">Login</a><a href="/dashboard">Dashboard</a></div></div></footer>
      </main>
    </>
  );
}
