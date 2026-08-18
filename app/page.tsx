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
    if (!window.google) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google login is not configured.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => handleGoogleLogin(response.credential),
    });
  }

  function startGoogleLogin() {
    setError("");

    if (!window.google) {
      setError("Google login is still loading. Please try again.");
      return;
    }

    initializeGoogle();
    window.google.accounts.id.prompt();
  }

  const busy = loading || googleLoading;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      <main className="min-h-screen overflow-hidden bg-[#05030a] text-white selection:bg-violet-500/30">
        {/* Ambient premium background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-[12%] -top-[18%] h-[620px] w-[620px] rounded-full bg-violet-700/20 blur-[150px]" />
          <div className="absolute -right-[10%] top-[2%] h-[560px] w-[560px] rounded-full bg-fuchsia-600/12 blur-[150px]" />
          <div className="absolute bottom-[-25%] left-[25%] h-[600px] w-[600px] rounded-full bg-indigo-700/10 blur-[170px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(5,3,10,.72)_100%)]" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-[1180px]">
            <div className="grid overflow-hidden rounded-[36px] border border-white/[0.10] bg-white/[0.035] shadow-[0_40px_140px_rgba(0,0,0,.65)] backdrop-blur-2xl lg:grid-cols-[1.05fr_.95fr]">

              {/* Premium brand panel */}
              <section className="relative hidden min-h-[720px] overflow-hidden border-r border-white/[0.07] p-12 lg:flex lg:flex-col lg:justify-between xl:p-14">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.22),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,.12),transparent_35%)]" />

                <div className="relative z-10">
                  <Logo light />

                  <div className="mt-28 max-w-xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/[0.07] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,.95)]" />
                      Premium social growth
                    </div>

                    <h1 className="text-6xl font-black leading-[.98] tracking-[-0.055em] text-white xl:text-7xl">
                      Grow smarter.
                      <span className="mt-2 block bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-400 bg-clip-text text-transparent">
                        Manage everything.
                      </span>
                    </h1>

                    <p className="mt-7 max-w-lg text-sm leading-7 text-white/45">
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

                <div className="relative flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/25">
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
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.08] text-violet-300 shadow-[0_10px_35px_rgba(124,58,237,.12)]">
                      <span className="text-lg">→</span>
                    </div>

                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-violet-400">
                      Member access
                    </p>

                    <h2 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-[38px]">
                      Welcome back
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-white/35">
                      Sign in to continue to your DreamSMM workspace.
                    </p>
                  </div>

                  <div className="relative overflow-hidden rounded-[30px] border border-white/[0.11] bg-white/[0.055] p-5 shadow-[0_28px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl sm:p-7">
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
                    <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

                    {/* Social login */}
                    <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={startGoogleLogin}
                        disabled={busy}
                        className="group h-12 rounded-2xl border border-white/[0.10] bg-white/[0.045] text-sm font-bold text-white/80 transition-all hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-white/[0.075] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="mr-2 font-black text-red-400">G</span>
                        Continue with Google
                      </button>

                      <button
                        type="button"
                        disabled
                        className="h-12 rounded-2xl border border-white/[0.06] bg-white/[0.025] text-sm font-bold text-white/20"
                      >
                        <span className="mr-2"></span>
                        Apple
                      </button>
                    </div>

                    {googleLoading && (
                      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-violet-400/10 bg-violet-500/[0.07] px-4 py-3 text-xs text-violet-300">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-300/20 border-t-violet-300" />
                        Signing in with Google...
                      </div>
                    )}

                    <div className="my-6 flex items-center gap-3 text-[9px] font-black tracking-[0.15em] text-white/20 sm:my-7 sm:text-[10px]">
                      <div className="h-px flex-1 bg-white/[0.07]" />
                      <span className="whitespace-nowrap">OR CONTINUE WITH EMAIL</span>
                      <div className="h-px flex-1 bg-white/[0.07]" />
                    </div>

                    <form onSubmit={handleLogin} className="relative">
                      <div className="mb-5">
                        <label
                          htmlFor="email"
                          className="mb-2.5 block text-xs font-bold text-white/60"
                        >
                          Email address
                        </label>

                        <div className="group relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/20 transition group-focus-within:text-violet-400">
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
                            className="h-14 w-full rounded-2xl border border-white/[0.09] bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/20 hover:border-white/[0.15] focus:border-violet-400/50 focus:bg-violet-500/[0.045] focus:ring-4 focus:ring-violet-500/[0.08] disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="password"
                          className="mb-2.5 block text-xs font-bold text-white/60"
                        >
                          Password
                        </label>

                        <div className="group relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/20 transition group-focus-within:text-violet-400">
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
                            className="h-14 w-full rounded-2xl border border-white/[0.09] bg-black/20 pl-11 pr-20 text-sm text-white outline-none transition-all placeholder:text-white/20 hover:border-white/[0.15] focus:border-violet-400/50 focus:bg-violet-500/[0.045] focus:ring-4 focus:ring-violet-500/[0.08] disabled:opacity-50"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={busy}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white/30 transition hover:bg-white/[0.05] hover:text-violet-300 disabled:opacity-50"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <div className="mb-5 flex items-center justify-between gap-3 text-xs">
                        <label className="flex items-center gap-2 text-white/35">
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
                        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/[0.08] px-4 py-3 text-sm leading-5 text-red-300">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-[10px]">
                            !
                          </span>
                          <span>{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={busy}
                        className="group relative h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-[#7c3aed] to-fuchsia-600 text-sm font-black text-white shadow-[0_14px_40px_rgba(124,58,237,.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(168,85,247,.35)] disabled:cursor-not-allowed disabled:opacity-55"
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

                    <p className="mt-6 border-t border-white/[0.06] pt-6 text-center text-xs leading-5 text-white/30">
                      Don&apos;t have an account?
                      <button
                        type="button"
                        onClick={() => router.push("/register")}
                        className="ml-1 font-bold text-violet-400 transition hover:text-violet-300"
                      >
                        Create account
                      </button>
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium text-white/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                    Secure member access
                    <span className="mx-1 text-white/10">•</span>
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
            ? "border border-white/20 bg-white/15 text-white shadow-lg shadow-black/10"
            : "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-900/25"
        }`}
      >
        D
      </div>

      <div>
        <div
          className={`font-extrabold ${
            light ? "text-xl text-white" : "text-lg text-white"
          }`}
        >
          Dream<span className={light ? "text-violet-200" : "text-violet-400"}>SMM</span>
        </div>

        <div
          className={`text-[9px] tracking-[0.18em] ${
            light ? "text-white/60" : "text-white/30"
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
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-xl transition hover:border-white/[0.14] hover:bg-white/[0.065]">
      <div className="text-xs font-bold text-white">{title}</div>
      <div className="mt-1.5 text-[10px] leading-4 text-white/45">
        {description}
      </div>
    </div>
  );
}
