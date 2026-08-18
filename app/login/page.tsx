"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#06040b] text-white selection:bg-violet-500/30">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-18%] h-[520px] w-[520px] rounded-full bg-violet-700/20 blur-[130px]" />
        <div className="absolute right-[-12%] top-[4%] h-[480px] w-[480px] rounded-full bg-fuchsia-600/12 blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[520px] w-[520px] rounded-full bg-indigo-700/10 blur-[150px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(6,4,11,.55)_100%)]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1080px]">
          <div className="grid overflow-hidden rounded-[34px] border border-white/[0.10] bg-white/[0.035] shadow-[0_35px_120px_rgba(0,0,0,.55)] backdrop-blur-2xl lg:grid-cols-[1fr_0.9fr]">

            {/* Brand / visual side */}
            <section className="relative hidden min-h-[680px] overflow-hidden border-r border-white/[0.07] p-10 lg:flex lg:flex-col lg:justify-between">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/[0.13] via-transparent to-fuchsia-500/[0.05]" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xl font-black shadow-[0_12px_35px_rgba(124,58,237,.35)]">
                    D
                  </div>

                  <div>
                    <p className="text-xl font-black tracking-tight">
                      Dream<span className="text-violet-400">SMM</span>
                    </p>
                    <p className="text-[9px] font-bold tracking-[0.22em] text-white/35">
                      SOCIAL MEDIA PANEL
                    </p>
                  </div>
                </div>

                <div className="mt-28 max-w-md">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,.9)]" />
                    Premium social growth
                  </div>

                  <h2 className="text-5xl font-black leading-[1.03] tracking-[-0.045em] text-white">
                    Everything you need.
                    <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
                      One powerful panel.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-sm text-sm leading-6 text-white/45">
                    Manage your services, orders, balance and account from one
                    clean workspace built for speed.
                  </p>
                </div>
              </div>

              <div className="relative grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-xl">
                  <p className="text-xl font-black text-white">Fast</p>
                  <p className="mt-1 text-[10px] text-white/35">Quick ordering</p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-xl">
                  <p className="text-xl font-black text-white">24/7</p>
                  <p className="mt-1 text-[10px] text-white/35">Panel access</p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-xl">
                  <p className="text-xl font-black text-white">Easy</p>
                  <p className="mt-1 text-[10px] text-white/35">Simple control</p>
                </div>
              </div>
            </section>

            {/* Login side */}
            <section className="relative flex min-h-[680px] items-center justify-center p-5 sm:p-8 lg:p-12">
              <div className="w-full max-w-[430px]">

                {/* Mobile brand */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 font-black shadow-lg shadow-violet-900/30">
                    D
                  </div>
                  <div>
                    <p className="font-black">
                      Dream<span className="text-violet-400">SMM</span>
                    </p>
                    <p className="text-[8px] font-bold tracking-[0.18em] text-white/35">
                      SOCIAL MEDIA PANEL
                    </p>
                  </div>
                </div>

                {/* Heading */}
                <div className="mb-8">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/[0.08] text-violet-300">
                    →
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-violet-400">
                    Member login
                  </p>

                  <h1 className="text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl">
                    Welcome back
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-white/40">
                    Sign in to continue to your DreamSMM workspace.
                  </p>
                </div>

                {/* Glass login card */}
                <div className="relative overflow-hidden rounded-[28px] border border-white/[0.10] bg-white/[0.055] p-5 shadow-[0_25px_80px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:p-7">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
                  <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

                  <form onSubmit={handleLogin} className="relative space-y-5">
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2.5 block text-xs font-bold text-white/65"
                      >
                        Email address
                      </label>

                      <div className="group relative">
                        <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center text-white/25 transition group-focus-within:text-violet-400">
                          @
                        </div>

                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          disabled={loading}
                          className="h-14 w-full rounded-2xl border border-white/[0.09] bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/20 hover:border-white/[0.15] focus:border-violet-400/50 focus:bg-violet-500/[0.04] focus:ring-4 focus:ring-violet-500/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="block text-xs font-bold text-white/65"
                        >
                          Password
                        </label>

                        <span className="text-[10px] font-medium text-white/25">
                          Keep it secure
                        </span>
                      </div>

                      <div className="group relative">
                        <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center text-white/25 transition group-focus-within:text-violet-400">
                          •
                        </div>

                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          disabled={loading}
                          className="h-14 w-full rounded-2xl border border-white/[0.09] bg-black/20 pl-11 pr-20 text-sm text-white outline-none transition-all placeholder:text-white/20 hover:border-white/[0.15] focus:border-violet-400/50 focus:bg-violet-500/[0.04] focus:ring-4 focus:ring-violet-500/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          disabled={loading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white/35 transition hover:bg-white/[0.05] hover:text-violet-300 disabled:opacity-50"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/[0.08] px-4 py-3.5 text-xs leading-5 text-red-300">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-[10px]">
                          !
                        </span>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-sm font-black text-white shadow-[0_14px_35px_rgba(124,58,237,.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(168,85,247,.32)] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

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

                  {/* Register */}
                  <div className="relative mt-6 border-t border-white/[0.06] pt-6 text-center">
                    <p className="text-xs text-white/35">
                      Don&apos;t have an account?{" "}
                      <a
                        href="/register"
                        className="font-bold text-violet-400 transition hover:text-violet-300"
                      >
                        Create an account
                      </a>
                    </p>
                  </div>
                </div>

                {/* Security note */}
                <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-white/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.7)]" />
                  Secure member access
                </div>

                <p className="mt-4 text-center text-[10px] text-white/20">
                  © {new Date().getFullYear()} DreamSMM
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}