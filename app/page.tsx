"use client";

import Script from "next/script";
import { FormEvent, useState } from "react";
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

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credential: string) {
    setError("");
    setGoogleLoading(true);

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Google login failed.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  function initializeGoogle() {
  const google = window.google;

  if (!google) {
    console.error("Google Identity Services failed to load.");
    return;
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    setError("Google login is not configured.");
    return;
  }

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      handleGoogleLogin(response.credential);
    },
  });
}
  
function startGoogleLogin() {
  setError("");

  if (!window.google) {
    setError(
      "Google Sign-In is still loading. Refresh the page and try again."
    );
    console.error(
      "Google Identity Services script is not available."
    );
    return;
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    setError("Google login is not configured.");
    return;
  }

  initializeGoogle();

  window.google.accounts.id.prompt();
}

  const busy = loading || googleLoading;

  return (
    <>
      <Script
        src="661199063885-pv5931eq4cojnqahn4fvlifrc6jmml11.apps.googleusercontent.com"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      <main className="min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900 selection:bg-violet-500/20">
        {/* Ambient premium background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-[12%] -top-[18%] h-[620px] w-[620px] rounded-full bg-violet-200/40 blur-[150px]" />
          <div className="absolute -right-[10%] top-[2%] h-[560px] w-[560px] rounded-full bg-fuchsia-200/30 blur-[150px]" />
          <div className="absolute bottom-[-25%] left-[25%] h-[600px] w-[600px] rounded-full bg-indigo-200/30 blur-[170px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.10) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(247,248,252,.70)_100%)]" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-[1180px]">
            <div className="grid overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,.10)] backdrop-blur-2xl lg:grid-cols-[1.05fr_.95fr]">

              {/* Premium brand panel */}
              <section className="relative hidden min-h-[720px] overflow-hidden border-r border-slate-200 p-12 lg:flex lg:flex-col lg:justify-between xl:p-14">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.10),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,.07),transparent_35%)]" />

                <div className="relative z-10">
                  <Logo light />

                  <div className="mt-28 max-w-xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_14px_rgba(196,181,253,.95)]" />
                      Premium social growth
                    </div>

                    <h1 className="text-6xl font-black leading-[.98] tracking-[-0.055em] text-slate-950 xl:text-7xl">
                      Grow smarter.
                      <span className="mt-2 block bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-500 bg-clip-text text-transparent">
                        Manage everything.
                      </span>
                    </h1>

                    <p className="mt-7 max-w-lg text-sm leading-7 text-slate-500">
                      One modern workspace for your social media services,
                      orders, balance and support. Fast, clean and built to
                      scale.
                    </p>

                    <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
                      <Feature title="⚡ Fast Orders" description="Place and track orders from one clean dashboard." />
                      <Feature title="◈ 1,000+ Services" description="Organized services with clear rates and limits." />
                      <Feature title="🔒 Secure Account" description="Keep your account and API access protected." />
                      <Feature title="◉ 24/7 Support" description="Get help whenever you need it." />
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                  DreamSMM secure workspace
                </div>
              </section>

              {/* Login */}
              <section className="relative flex min-h-[720px] items-center justify-center p-5 sm:p-8 lg:p-12 xl:p-16">
                <div className="w-full max-w-[440px]">

                  <div className="mb-8 lg:hidden">
                    <Logo />
                  </div>

                  <div className="mb-7">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600 shadow-[0_10px_35px_rgba(124,58,237,.12)]">
                      <span className="text-lg">→</span>
                    </div>

                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-violet-400">
                      Member access
                    </p>

                    <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-[38px]">
                      Welcome back
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-900/35">
                      Sign in to continue to your DreamSMM workspace.
                    </p>
                  </div>

                  <div className="relative overflow-hidden rounded-[30px] border border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,.08)] sm:p-7 sm:p-7">
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
                    <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-violet-100 blur-3xl" />

                    {/* Social login */}
                    <div className="relative grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={startGoogleLogin}
                        disabled={busy}
                        className="group h-12 rounded-2xl border border-white/[0.10] bg-white text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="mr-2 font-black text-red-400">G</span>
                        Continue with Google
                      </button>

                    </div>

                    {googleLoading && (
                      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-xs text-violet-600">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-300" />
                        Signing in with Google...
                      </div>
                    )}

                    <div className="my-6 flex items-center gap-3 text-[9px] font-black tracking-[0.15em] text-slate-900/20 sm:my-7 sm:text-[10px]">
                      <div className="h-px flex-1 bg-white/[0.07]" />
                      <span className="whitespace-nowrap">OR CONTINUE WITH EMAIL</span>
                      <div className="h-px flex-1 bg-white/[0.07]" />
                    </div>

                    <form onSubmit={handleLogin} className="relative">
                      <div className="mb-5">
                        <label
                          htmlFor="email"
                          className="mb-2.5 block text-xs font-bold text-slate-900/60"
                        >
                          Email address
                        </label>

                        <div className="group relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-900/20 transition group-focus-within:text-violet-400">
                            @
                          </span>

                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            inputMode="email"
                            required
                            disabled={busy}
                            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-900/20 hover:border-violet-200 focus:border-violet-400/50 focus:bg-violet-50 focus:ring-4 focus:ring-violet-500/[0.08] disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="password"
                          className="mb-2.5 block text-xs font-bold text-slate-900/60"
                        >
                          Password
                        </label>

                        <div className="group relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-900/20 transition group-focus-within:text-violet-400">
                            •
                          </span>

                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            disabled={busy}
                            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-20 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-900/20 hover:border-violet-200 focus:border-violet-400/50 focus:bg-violet-50 focus:ring-4 focus:ring-violet-500/[0.08] disabled:opacity-50"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={busy}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-900/30 transition hover:bg-white/[0.05] hover:text-violet-600 disabled:opacity-50"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <div className="mb-5 flex items-center justify-between gap-3 text-xs">
                        <label className="flex items-center gap-2 text-slate-900/35">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 accent-violet-500"
                          />
                          Remember me
                        </label>

                        <button
                          type="button"
                          disabled
                          className="font-bold text-violet-400/40"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {error && (
                        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px]">
                            !
                          </span>
                          <span>{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={busy}
                        className="group relative h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-[#7c3aed] to-fuchsia-600 text-sm font-black text-slate-900 shadow-[0_14px_40px_rgba(124,58,237,.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(168,85,247,.35)] disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                        <span className="relative flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Signing in...
                            </>
                          ) : (
                            <>
                              Sign in
                              <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
                                →
                              </span>
                            </>
                          )}
                        </span>
                      </button>
                    </form>

                    <p className="mt-6 border-t border-white/[0.06] pt-6 text-center text-xs leading-5 text-slate-900/30">
                      Don&apos;t have an account?
                      <button
                        type="button"
                        onClick={() => router.push("/register")}
                        className="ml-1 font-bold text-violet-400 transition hover:text-violet-600"
                      >
                        Create account
                      </button>
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium text-slate-900/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                    Secure member access
                    <span className="mx-1 text-slate-900/10">•</span>
                    DreamSMM
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-lg ${
          light
            ? "border border-white/20 bg-white/15 text-slate-900 shadow-lg shadow-black/10"
            : "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-slate-900 shadow-lg shadow-violet-200"
        }`}
      >
        D
      </div>

      <div>
        <div
          className={`font-extrabold ${
            light ? "text-xl text-slate-900" : "text-lg text-slate-900"
          }`}
        >
          Dream<span className={light ? "text-violet-700" : "text-violet-400"}>SMM</span>
        </div>

        <div
          className={`text-[9px] tracking-[0.18em] ${
            light ? "text-slate-900/60" : "text-slate-900/30"
          }`}
        >
          SOCIAL MEDIA PANEL
        </div>
      </div>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl transition hover:border-white/[0.14] hover:bg-white/[0.065]">
      <div className="text-xs font-bold text-slate-900">{title}</div>
      <div className="mt-1.5 text-[10px] leading-4 text-slate-500">
        {description}
      </div>
    </div>
  );
}