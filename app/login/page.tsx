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

      showDashboardSplash();
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      hideDashboardSplash();
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

      <main className="min-h-screen overflow-hidden bg-gradient-to-br from-[#168da3] via-[#49b5bd] to-[#a8e5d7] text-slate-900">

  {/* HEADER */}
  <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10">
    <a href="/login" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#168da3] shadow-lg">
        D
      </div>
      <div>
        <div className="text-xl font-black tracking-tight text-white">DreamSMM</div>
        <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/70">
          Social Media Marketing
        </div>
      </div>
    </a>

    <nav className="hidden items-center gap-8 text-sm font-bold text-white md:flex">
      <a href="#features" className="transition hover:text-yellow-300">Features</a>
      <a href="#how" className="transition hover:text-yellow-300">How it works</a>
      <a href="#reviews" className="transition hover:text-yellow-300">Reviews</a>
      <a href="#faq" className="transition hover:text-yellow-300">FAQ</a>
    </nav>

    <a
      href="#login"
      className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#168da3] shadow-lg transition hover:-translate-y-0.5"
    >
      Sign in
    </a>
  </header>

  {/* HERO */}
  <section className="relative px-5 pb-20 pt-10 lg:px-10 lg:pb-28 lg:pt-16">
    <div className="pointer-events-none absolute left-[5%] top-20 text-5xl opacity-30">❤️</div>
    <div className="pointer-events-none absolute right-[8%] top-28 text-5xl opacity-30">🚀</div>
    <div className="pointer-events-none absolute bottom-16 left-[12%] text-4xl opacity-25">✨</div>
    <div className="pointer-events-none absolute bottom-20 right-[15%] text-4xl opacity-25">💬</div>

    <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">

      {/* HERO TEXT */}
      <div className="max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-wide text-white backdrop-blur">
          ✨ Trusted SMM Panel
        </div>

        <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-[76px]">
          The Best &amp; Cheapest
          <span className="block text-yellow-300">SMM Panel</span>
          <span className="block">Trusted Worldwide.</span>
        </h1>

        <p className="mt-7 max-w-xl text-base font-medium leading-7 text-white/85 sm:text-lg">
          Grow your social media with affordable services, quick delivery
          and a simple SMM panel built for creators, businesses and agencies.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#login"
            className="rounded-2xl bg-yellow-300 px-7 py-4 text-sm font-black text-slate-900 shadow-xl transition hover:-translate-y-1 hover:bg-yellow-200"
          >
            Get Started →
          </a>

          <a
            href="#features"
            className="rounded-2xl border border-white/30 bg-white/15 px-7 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/25"
          >
            Explore Services
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold text-white/85">
          <span>✓ Fast delivery</span>
          <span>✓ Affordable prices</span>
          <span>✓ 24/7 support</span>
        </div>
      </div>

      {/* LOGIN CARD */}
      <div id="login" className="relative mx-auto w-full max-w-[440px]">
        <div className="absolute -inset-5 rounded-[3rem] bg-white/20 blur-xl" />

        <div className="relative rounded-[2rem] border border-white/80 bg-white p-7 shadow-[0_35px_90px_rgba(0,70,90,0.28)] sm:p-9">

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f7f5] text-2xl font-black text-[#168da3]">
              D
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              Welcome back
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Sign in to your DreamSMM account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[#2da7b3] focus:bg-white focus:ring-4 focus:ring-[#2da7b3]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm font-medium outline-none transition focus:border-[#2da7b3] focus:bg-white focus:ring-4 focus:ring-[#2da7b3]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#168da3]"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#168da3] text-sm font-black text-white shadow-lg shadow-[#168da3]/25 transition hover:-translate-y-0.5 hover:bg-[#117d91] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Sign in"}
              {!busy && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div
            ref={googleButtonRef}
            className="flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl"
          />

          <p className="mt-6 text-center text-sm font-medium text-slate-500">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-black text-[#168da3] hover:underline"
            >
              Create account
            </a>
          </p>

        </div>
      </div>
    </div>
  </section>

  {/* FEATURES */}
  <section id="features" className="bg-white px-5 py-20 lg:px-10">
    <div className="mx-auto max-w-7xl">

      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-[#168da3]">
          Why choose us
        </span>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Reasons to order SMM services from us
        </h2>

        <p className="mt-4 text-slate-500">
          Everything you need for simple and effective social media growth.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["🏆", "Best quality", "Quality-focused services designed for reliable delivery."],
          ["💳", "Many payment methods", "Choose a payment option that works for you."],
          ["💰", "Affordable services", "Competitive prices for creators and businesses."],
          ["⚡", "Very quick delivery", "Orders can start quickly after placing them."],
        ].map(([icon, title, text]) => (
          <div
            key={title}
            className="rounded-3xl border border-slate-100 bg-slate-50 p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
              {icon}
            </div>

            <h3 className="mt-6 text-lg font-black text-slate-900">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* HOW TO USE */}
  <section id="how" className="bg-[#f3fbfa] px-5 py-20 lg:px-10">
    <div className="mx-auto max-w-6xl">

      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-[#168da3]">
          Simple process
        </span>

        <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
          How to use our panel
        </h2>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-4">
        {[
          ["01", "Sign up", "Create your DreamSMM account."],
          ["02", "Deposit funds", "Add funds using your preferred payment method."],
          ["03", "Pick SMM services", "Choose a service, add your link and quantity."],
          ["04", "Quick results", "Place your order and track its progress."],
        ].map(([number, title, text]) => (
          <div
            key={number}
            className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5f7f5] text-sm font-black text-[#168da3]">
              {number}
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* CUSTOMER STORIES */}
  <section id="reviews" className="bg-white px-5 py-20 lg:px-10">
    <div className="mx-auto max-w-7xl">

      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-[#168da3]">
          Customer stories
        </span>

        <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
          Our customers' stories
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Bayram Koc", "Great panel with fast service and an easy ordering experience."],
          ["Ben Cho", "Simple interface, affordable services and quick delivery."],
          ["Melissa Hendrick", "Very smooth experience from deposit to delivery."],
          ["Kelly Newsom", "Easy to use and plenty of services to choose from."],
        ].map(([name, text]) => (
          <div
            key={name}
            className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="text-lg tracking-widest text-yellow-400">
              ★★★★★
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              “{text}”
            </p>

            <div className="mt-6 font-black text-slate-900">
              {name}
            </div>

            <div className="mt-1 text-xs font-medium text-slate-400">
              Customer
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* FAQ */}
  <section id="faq" className="bg-slate-50 px-5 py-20 lg:px-10">
    <div className="mx-auto max-w-4xl">

      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-[#168da3]">
          FAQ
        </span>

        <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
          Most Popular Questions
        </h2>
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
          <details
            key={question}
            className="group rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
          >
            <summary className="cursor-pointer list-none font-bold text-slate-800">
              <span className="flex items-center justify-between gap-5">
                {question}
                <span className="text-2xl font-light text-[#168da3] transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>

            <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">
              Contact our support team for complete information about this
              feature, service or ordering option.
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>

  {/* CTA */}
  <section className="bg-white px-5 py-20 lg:px-10">
    <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#168da3] to-[#52bdbd] px-7 py-12 text-center shadow-2xl sm:px-12">
      <div className="text-4xl">🚀</div>

      <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
        Ready to grow your social media?
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
        Join DreamSMM and start ordering your social media services today.
      </p>

      <a
        href="#login"
        className="mt-7 inline-flex rounded-2xl bg-yellow-300 px-7 py-4 text-sm font-black text-slate-900 shadow-lg transition hover:-translate-y-1 hover:bg-yellow-200"
      >
        Get Started Now →
      </a>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="bg-[#084f5d] px-5 py-12 text-white lg:px-10">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-[#168da3]">
            D
          </div>
          <div className="text-xl font-black">DreamSMM</div>
        </div>

        <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
          Your social growth, beautifully managed.
        </p>
      </div>

      <div className="text-sm text-white/60 md:text-right">
        <p>© {new Date().getFullYear()} DreamSMM. All rights reserved.</p>
        <p className="mt-1">Secure payments • DMCA</p>
      </div>
    </div>
  </footer>

  {/* FLOATING CONTACT BUTTONS */}
  <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
    <a
      href="#"
      aria-label="Telegram"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ed9] text-xl text-white shadow-xl transition hover:scale-110"
    >
      ✈
    </a>

    <a
      href="#"
      aria-label="WhatsApp"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-xl text-white shadow-xl transition hover:scale-110"
    >
      ☎
    </a>
  </div>

</main>
    </>
  );
}





































