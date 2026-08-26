"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  users: number;
  activeUsers: number;
  admins: number;
  pendingDeposits: number;
};

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="group rounded-2xl border border-violet-100 bg-white p-5 shadow-[0_8px_30px_rgba(91,33,182,0.06)] transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_14px_35px_rgba(91,33,182,0.10)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl ring-1 ring-violet-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

function AdminLink({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-2xl border border-violet-100 bg-white p-5 shadow-[0_8px_30px_rgba(91,33,182,0.05)] transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_40px_rgba(91,33,182,0.11)]"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-100/50 blur-2xl transition-all group-hover:bg-violet-200/60" />

      <div className="relative flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-xl text-white shadow-lg shadow-violet-200">
          {icon}
        </div>

        {badge !== undefined && (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600 ring-1 ring-red-100">
            {badge} pending
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <h3 className="text-sm font-black text-slate-800 group-hover:text-violet-700">
          {title}
        </h3>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    activeUsers: 0,
    admins: 0,
    pendingDeposits: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, depositsResponse] = await Promise.all([
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/deposits", { cache: "no-store" }),
      ]);

      const usersData = await usersResponse.json();
      const depositsData = await depositsResponse.json();

      if (!usersResponse.ok) {
        setError(usersData.error || "Could not load users.");
        return;
      }

      if (!depositsResponse.ok) {
        setError(depositsData.error || "Could not load deposits.");
        return;
      }

      const users = usersData.users || [];
      const deposits = depositsData.deposits || [];

      setStats({
        users: users.length,
        activeUsers: users.filter(
          (user: { status: string }) => user.status === "ACTIVE"
        ).length,
        admins: users.filter(
          (user: { role: string }) => user.role === "ADMIN"
        ).length,
        pendingDeposits: deposits.length,
      });
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf9ff] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-violet-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-black text-white shadow-lg shadow-violet-200">
              D
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                Dream<span className="text-violet-600">SMM</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Administration Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-slate-800">
                Administrator
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                Control Center
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-black text-violet-700 ring-4 ring-violet-50">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-purple-600 p-6 text-white shadow-[0_20px_50px_rgba(109,40,217,0.20)] sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-100">
                Control Center
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Dashboard
              </h2>

              <p className="mt-2 max-w-xl text-sm font-medium text-violet-100">
                Manage your DreamSMM panel, users, deposits and services from
                one place.
              </p>
            </div>

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="rounded-xl bg-white px-5 py-3 text-sm font-black text-violet-700 shadow-lg transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            title="Total Users"
            value={loading ? "—" : stats.users}
            description="Registered accounts"
            icon="👥"
          />

          <StatCard
            title="Active Users"
            value={loading ? "—" : stats.activeUsers}
            description="Currently active"
            icon="✓"
          />

          <StatCard
            title="Administrators"
            value={loading ? "—" : stats.admins}
            description="Admin accounts"
            icon="🛡"
          />

          <StatCard
            title="Pending Deposits"
            value={loading ? "—" : stats.pendingDeposits}
            description="Need verification"
            icon="₹"
          />
        </section>

        <section className="mt-9">
          <div className="mb-5">
            <h3 className="text-xl font-black tracking-tight text-slate-900">
              Quick Actions
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Jump directly to the areas you manage most.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AdminLink
              href="/admin/users"
              icon="👥"
              title="Manage Users"
              description="View users, balances and account status."
            />

            <AdminLink
              href="/admin/deposits"
              icon="₹"
              title="Manage Deposits"
              description="Review and approve pending deposits."
              badge={
                stats.pendingDeposits > 0
                  ? stats.pendingDeposits
                  : undefined
              }
            />

            <AdminLink
              href="/admin/services"
              icon="⚙"
              title="Manage Services"
              description="Control services, rates and availability."
            />

            <AdminLink
              href="/admin/categories"
              icon="✦"
              title="Manage Categories"
              description="Create categories and manage their display order."
            />

            <AdminLink
              href="/admin/users"
              icon="◉"
              title="User Accounts"
              description="Inspect individual user accounts and activity."
            />

            <AdminLink
              href="/admin/deposits"
              icon="✓"
              title="Deposit Review"
              description="Handle pending payment verification requests."
            />
          </div>
        </section>

        <section className="mt-9 rounded-2xl border border-violet-100 bg-white p-5 shadow-[0_8px_30px_rgba(91,33,182,0.05)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-800">
                System Overview
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Current administration statistics
              </p>
            </div>

            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.10)]" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Users
              </p>
              <p className="mt-1 text-lg font-black text-slate-800">
                {loading ? "—" : stats.users}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active
              </p>
              <p className="mt-1 text-lg font-black text-emerald-600">
                {loading ? "—" : stats.activeUsers}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Admins
              </p>
              <p className="mt-1 text-lg font-black text-violet-600">
                {loading ? "—" : stats.admins}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pending
              </p>
              <p className="mt-1 text-lg font-black text-amber-600">
                {loading ? "—" : stats.pendingDeposits}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
