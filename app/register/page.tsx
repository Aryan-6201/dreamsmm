"use client";

import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      alert("Account created successfully!");
      window.location.href = "/";
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7ff] via-white to-[#f3efff] px-5 py-10">

      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-200">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">

          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#635bff] to-[#925cf6] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#635bff]/20">
            D
          </div>

          <div>
            <h1 className="font-extrabold text-lg text-gray-950">
              DreamSMM
            </h1>

            <p className="text-[9px] tracking-widest text-gray-400">
              SOCIAL MEDIA PANEL
            </p>
          </div>

        </div>

        {/* Heading */}
        <h2 className="text-2xl font-extrabold text-gray-950">
          Create your account
        </h2>

        <p className="text-sm text-gray-500 mt-2 mb-7">
          Join DreamSMM and start managing your orders.
        </p>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <div className="mb-5">

            <label
              htmlFor="name"
              className="block text-xs font-bold mb-2 text-gray-800"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder:text-gray-500 outline-none text-sm focus:bg-white focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 transition disabled:opacity-60"
            />

          </div>

          {/* Email */}
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
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder:text-gray-500 outline-none text-sm focus:bg-white focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 transition disabled:opacity-60"
            />

          </div>

          {/* Password */}
          <div className="mb-5">

            <label
              htmlFor="password"
              className="block text-xs font-bold mb-2 text-gray-800"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              disabled={loading}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder:text-gray-500 outline-none text-sm focus:bg-white focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 transition disabled:opacity-60"
            />

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#635bff] to-[#8b5cf6] text-white text-sm font-bold shadow-lg shadow-[#635bff]/20 hover:-translate-y-0.5 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>

        </form>

        {/* Login */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?

          <a
            href="/"
            className="text-[#635bff] font-bold ml-1 hover:text-[#5148e8]"
          >
            Sign in
          </a>
        </p>

        {/* Security */}
        <p className="text-center text-[10px] text-gray-400 mt-8">
          🔒 Your connection is protected · DreamSMM
        </p>

      </div>
    </main>
  );
}