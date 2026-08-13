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
          name,
          email,
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
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-5 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#635bff] to-[#925cf6] text-white flex items-center justify-center font-bold text-lg">
            D
          </div>

          <div>
            <h1 className="font-extrabold text-lg">
              DreamSMM
            </h1>

            <p className="text-[9px] tracking-widest text-gray-400">
              SOCIAL MEDIA PANEL
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold">
          Create your account
        </h2>

        <p className="text-sm text-gray-500 mt-2 mb-7">
          Join DreamSMM and start managing your orders.
        </p>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-xs font-bold mb-2">
              Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-xs font-bold mb-2">
              Email address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-xs font-bold mb-2">
              Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-600 text-xs">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#635bff] to-[#8b5cf6] text-white text-sm font-bold shadow-lg shadow-[#635bff]/20 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>

        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?

          <a
            href="/"
            className="text-[#635bff] font-bold ml-1"
            >
            Sign in
          </a>
        </p>

      </div>
    </main>
  );
}