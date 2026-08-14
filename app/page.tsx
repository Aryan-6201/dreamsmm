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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential,
        }),
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
      callback: (response) => {
        handleGoogleLogin(response.credential);
      },
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

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      <main className="min-h-screen grid lg:grid-cols-2 bg-[#f8f8fc]">

        {/* LEFT SIDE */}
        <section className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-[#5148e8] via-[#635bff] to-[#925cf6] text-white p-14">

          <div className="absolute -right-40 -top-40 w-[500px] h-[500px] rounded-full bg-white/10" />
          <div className="absolute -left-40 -bottom-40 w-[450px] h-[450px] rounded-full bg-white/10" />

          <div className="relative z-10 w-full">

            {/* LOGO */}
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-xl">
                D
              </div>

              <div>
                <div className="font-extrabold text-xl">
                  DreamSMM
                </div>

                <div className="text-[9px] tracking-widest opacity-70">
                  SOCIAL MEDIA PANEL
                </div>
              </div>

            </div>

            {/* HERO */}
            <div className="mt-32 max-w-xl">

              <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
                Grow smarter.
                <br />
                Manage everything.
              </h1>

              <p className="mt-6 text-sm leading-7 text-white/75 max-w-lg">
                One modern dashboard for your social media services,
                orders, balance and support. Fast, simple and built for scale.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-9 max-w-lg">

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

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}
            <div className="lg:hidden flex items-center gap-3 mb-12">

              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#635bff] to-[#925cf6] text-white flex items-center justify-center font-bold">
                D
              </div>

              <div>
                <div className="font-extrabold text-lg">
                  DreamSMM
                </div>

                <div className="text-[9px] text-gray-400 tracking-widest">
                  SOCIAL MEDIA PANEL
                </div>
              </div>

            </div>

            {/* LOGIN CARD */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-8 shadow-xl shadow-gray-200/40">

              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Welcome back 👋
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Sign in to continue to your dashboard.
              </p>

              {/* SOCIAL LOGIN */}
              <div className="grid grid-cols-2 gap-3 mt-7">

                <button
                  type="button"
                  onClick={startGoogleLogin}
                  disabled={loading || googleLoading}
                  className="h-11 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-red-500 font-bold mr-1">
                    G
                  </span>
                  Google
                </button>

                <button
                  type="button"
                  disabled
                  className="h-11 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm font-semibold cursor-not-allowed"
                >
                  <span className="mr-1"></span>
                  Apple
                </button>

              </div>

              {googleLoading && (
                <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-xs text-indigo-600">
                  Signing in with Google...
                </div>
              )}

              {/* DIVIDER */}
              <div className="flex items-center gap-3 my-6 text-[10px] text-gray-400">

                <div className="h-px bg-gray-200 flex-1" />

                OR CONTINUE WITH EMAIL

                <div className="h-px bg-gray-200 flex-1" />

              </div>

              {/* EMAIL LOGIN */}
              <form onSubmit={handleLogin}>

                {/* EMAIL */}
                <div className="mb-5">

                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-gray-700 mb-2"
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
                    required
                    disabled={loading || googleLoading}
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 outline-none text-sm focus:border-[#635bff] focus:bg-white focus:ring-4 focus:ring-[#635bff]/10 transition disabled:opacity-60"
                  />

                </div>

                {/* PASSWORD */}
                <div className="mb-4">

                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-gray-700 mb-2"
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
                      disabled={loading || googleLoading}
                      className="w-full h-12 px-4 pr-16 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 outline-none text-sm focus:border-[#635bff] focus:bg-white focus:ring-4 focus:ring-[#635bff]/10 transition disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading || googleLoading}
                      className="absolute right-4 top-3.5 text-gray-500 hover:text-[#635bff] text-xs font-semibold"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                </div>

                {/* REMEMBER */}
                <div className="flex items-center justify-between mb-4 text-xs">

                  <label className="flex items-center gap-2 text-gray-500">

                    <input
                      type="checkbox"
                      className="accent-[#635bff]"
                    />

                    Remember me

                  </label>

                  <button
                    type="button"
                    disabled
                    className="text-[#635bff] font-bold opacity-40 cursor-not-allowed"
                  >
                    Forgot password?
                  </button>

                </div>

                {/* ERROR */}
                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* SIGN IN */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#635bff] to-[#8b5cf6] text-white text-sm font-bold shadow-lg shadow-[#635bff]/20 hover:-translate-y-0.5 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in →"}
                </button>

              </form>

              {/* REGISTER */}
              <p className="text-center text-xs text-gray-400 mt-6">

                Don't have an account?

                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-[#635bff] font-bold ml-1 hover:text-[#5148e8]"
                >
                  Create account
                </button>

              </p>

              {/* SECURITY */}
              <p className="text-center text-[10px] text-gray-400 mt-8">
                🔒 Your connection is protected · DreamSMM
              </p>

            </div>

          </div>
        </section>
      </main>
    </>
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
    <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">

      <div className="text-xs font-bold">
        {title}
      </div>

      <div className="text-[10px] text-white/60 mt-1.5 leading-4">
        {description}
      </div>

    </div>
  );
}