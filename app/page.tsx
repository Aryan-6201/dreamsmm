"use client";

import { useState } from "react";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">

      {/* LEFT SIDE */}
      <section className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-[#5148e8] via-[#635bff] to-[#925cf6] text-white p-14">

        {/* Background circles */}
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


            {/* FEATURES */}
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
          <h2 className="text-3xl font-extrabold tracking-tight">
            Welcome back 👋
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Sign in to continue to your dashboard.
          </p>


          {/* SOCIAL LOGIN */}
          <div className="grid grid-cols-2 gap-3 mt-7">

            <button
              type="button"
              className="h-11 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              G&nbsp; Google
            </button>

            <button
              type="button"
              className="h-11 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              &nbsp; Apple
            </button>

          </div>


          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-6 text-[10px] text-gray-400">

            <div className="h-px bg-gray-200 flex-1" />

            OR CONTINUE WITH EMAIL

            <div className="h-px bg-gray-200 flex-1" />

          </div>


          {/* EMAIL */}
          <div className="mb-5">

            <label className="block text-xs font-bold mb-2">
              Email address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 transition"
            />

          </div>


          {/* PASSWORD */}
          <div className="mb-4">

            <label className="block text-xs font-bold mb-2">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full h-12 px-4 pr-16 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 text-xs font-semibold"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>


          {/* REMEMBER + FORGOT */}
          <div className="flex items-center justify-between mb-6 text-xs">

            <label className="flex items-center gap-2 text-gray-500">

              <input
                type="checkbox"
                className="accent-[#635bff]"
              />

              Remember me

            </label>

            <button
              type="button"
              className="text-[#635bff] font-bold"
            >
              Forgot password?
            </button>

          </div>


          {/* SIGN IN */}
          <button
            type="button"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#635bff] to-[#8b5cf6] text-white text-sm font-bold shadow-lg shadow-[#635bff]/20 hover:-translate-y-0.5 transition"
          >
            Sign in →
          </button>


          {/* REGISTER */}
          <p className="text-center text-xs text-gray-400 mt-6">

            Don't have an account?

            <button
              type="button"
              className="text-[#635bff] font-bold ml-1"
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


/* FEATURE COMPONENT */

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