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

      <main className="min-h-screen bg-[#f7f7fb] lg:grid lg:grid-cols-2">
        {/* Desktop hero */}
        <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#5148e8] via-[#635bff] to-[#925cf6] p-14 text-white lg:flex">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/10" />
          <div className="absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-white/10" />

          <div className="relative z-10 w-full">
            <Logo light />

            <div className="mt-32 max-w-xl">
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
                Grow smarter.
                <br />
                Manage everything.
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-white/75">
                One modern dashboard for your social media services, orders,
                balance and support. Fast, simple and built for scale.
              </p>

              <div className="mt-9 grid max-w-lg grid-cols-2 gap-3">
                <Feature
                  title="⚡ Fast Orders"
                  description="Place and track orders from one clean dashboard."
                />
                <Feature
                  title="◈ 1,000+ Services"
                  description="Organized services with clear rates and limits."
                />
                <Feature
                  title="🔒 Secure Account"
                  description="Keep your account and API access protected."
                />
                <Feature
                  title="◉ 24/7 Support"
                  description="Get help whenever you need it."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Responsive login area */}
        <section className="flex min-h-screen items-center justify-center px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <div className="rounded-[26px] border border-gray-200/80 bg-white p-5 shadow-xl shadow-gray-200/40 sm:rounded-3xl sm:p-8">
              <h2 className="text-[27px] font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Welcome back 👋
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Sign in to continue to your dashboard.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={startGoogleLogin}
                  disabled={busy}
                  className="h-12 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 transition hover:bg-gray-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="mr-1.5 font-bold text-red-500">G</span>
                  Continue with Google
                </button>

                <button
                  type="button"
                  disabled
                  className="h-12 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-400"
                >
                  <span className="mr-1.5"></span>
                  Apple
                </button>
              </div>

              {googleLoading && (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-600">
                  Signing in with Google...
                </div>
              )}

              <div className="my-6 flex items-center gap-3 text-[9px] font-medium tracking-wide text-gray-400 sm:my-7 sm:text-[10px]">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="whitespace-nowrap">OR CONTINUE WITH EMAIL</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <form onSubmit={handleLogin}>
                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-bold text-gray-700"
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
                    inputMode="email"
                    required
                    disabled={busy}
                    className="h-12 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#635bff] focus:bg-white focus:ring-4 focus:ring-[#635bff]/10 disabled:opacity-60"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-bold text-gray-700"
                  >
                    Password
                  </label>

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
                      className="h-12 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 pr-16 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#635bff] focus:bg-white focus:ring-4 focus:ring-[#635bff]/10 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={busy}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 transition hover:text-[#635bff]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="mb-5 flex items-center justify-between gap-3 text-xs">
                  <label className="flex items-center gap-2 text-gray-500">
                    <input type="checkbox" className="accent-[#635bff]" />
                    Remember me
                  </label>

                  <button
                    type="button"
                    disabled
                    className="font-bold text-[#635bff] opacity-40"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-[#635bff] to-[#8b5cf6] text-sm font-bold text-white shadow-lg shadow-[#635bff]/20 transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in →"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs leading-5 text-gray-400">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="ml-1 font-bold text-[#635bff] hover:text-[#5148e8]"
                >
                  Create account
                </button>
              </p>

              <p className="mt-7 text-center text-[10px] text-gray-400 sm:mt-8">
                🔒 Your connection is protected · DreamSMM
              </p>
            </div>
          </div>
        </section>
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
            ? "border border-white/20 bg-white/15 text-white"
            : "bg-gradient-to-br from-[#635bff] to-[#925cf6] text-white"
        }`}
      >
        D
      </div>

      <div>
        <div className={`font-extrabold ${light ? "text-xl text-white" : "text-lg text-gray-900"}`}>
          DreamSMM
        </div>
        <div
          className={`text-[9px] tracking-widest ${
            light ? "text-white/70" : "text-gray-400"
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
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <div className="text-xs font-bold">{title}</div>
      <div className="mt-1.5 text-[10px] leading-4 text-white/60">
        {description}
      </div>
    </div>
  );
}