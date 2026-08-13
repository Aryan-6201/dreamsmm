"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [socialMessage, setSocialMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSocialMessage("");
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
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSocialLogin(provider: "Google" | "Apple") {
    setError("");
    setSocialMessage(
      `${provider} sign-in is not configured yet. Please use email and password.`
    );
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">

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
      <section className="flex items-center justify-center px-6 py-12 bg-white">

        <div className="w-full max-w-md">

          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center gap-3 mb-14">

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

          {/* HEADING */}
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">
            Welcome back 👋
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Sign in to continue to your dashboard.
          </p>

          {/* SOCIAL LOGIN */}
          <div className="grid grid-cols-2 gap-3 mt-7">

            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              disabled={loading}
              className="h-11 border border-gray-300 bg-white rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition disabled:opacity-50"
            >
              <span className="font-bold">G</span>&nbsp; Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("Apple")}
              disabled={loading}
              className="h-11 border border-gray-300 bg-white rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition disabled:opacity-50"
            >
              &nbsp; Apple
            </button>

          </div>

          {/* SOCIAL MESSAGE */}
          {socialMessage && (
            <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-xs font-medium text-purple-700">
              {socialMessage}
            </div>
          )}

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-6 text-[10px] text-gray-400">

            <div className="h-px bg-gray-200 flex-1" />

            OR CONTINUE WITH EMAIL

            <div className="h-px bg-gray-200 flex-1" />

          </div>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="mb-5">

              <label
                htmlFor="email"
                className="block text-xs font-bold mb-2 text-gray-800"
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
                disabled={loading}
                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder:text-gray-500 outline-none text-sm focus:bg-white focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 transition disabled:opacity-60"
              />

            </div>

            {/* PASSWORD */}
            <div className="mb-4">

              <label
                htmlFor="password"
                className="block text-xs font-bold mb-2 text-gray-800"
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
                  disabled={loading}
                  className="w-full h-12 px-4 pr-16 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder:text-gray-500 outline-none text-sm focus:bg-white focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 transition disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-3.5 text-gray-500 text-xs font-semibold hover:text-gray-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            {/* REMEMBER + FORGOT */}
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
                onClick={() => setError("Password reset is not configured yet.")}
                className="text-[#635bff] font-bold hover:text-[#5148e8]"
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
              disabled={loading}
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
          <p className="text-center text-[10px] text-gray-400 mt-9">
            🔒 Your connection is protected · DreamSMM
          </p>

        </div>
      </section>
    </main>
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