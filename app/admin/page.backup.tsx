"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  users: number;
  activeUsers: number;
  admins: number;
  pendingDeposits: number;
};

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
    <main className="min-h-screen bg-[#070a11] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#090c14]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Dream<span className="text-blue-500">SMM</span>
            </h1>

            <p className="text-[10px] text-gray-500">
              Administration Panel
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-gray-500">Control Center</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 font-bold text-blue-400 ring-1 ring-blue-500/20">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              Control Center
            </div>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Manage your DreamSMM panel from one place.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.08] disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <StatCard
            title="Total Users"
            value={loading ? "—" : stats.users}
            description="Registered accounts"
          />

          <StatCard
            title="Active Users"
            value={loading ? "—" : stats.activeUsers}
            description="Currently active"
            valueClass="text-green-400"
          />

          <StatCard
            title="Administrators"
            value={loading ? "—" : stats.admins}
            description="Admin accounts"
            valueClass="text-blue-400"
          />

          <StatCard
            title="Pending Deposits"
            value={loading ? "—" : stats.pendingDeposits}
            description="Need verification"
            valueClass="text-yellow-400"
          />
        </div>

        {/* Quick Actions */}
        <section className="mt-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="mt-1 text-xs text-gray-600">
              Jump directly to the areas you manage most.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AdminLink
              href="/admin/users"
              icon="👥"
              title="Manage Users"
              description="View users, balances and account status."
            />

            <AdminLink
              href="/admin/deposits"
              icon="💰"
              title="Manage Deposits"
              description="Review and approve pending deposits."
              badge={stats.pendingDeposits > 0 ? stats.pendingDeposits : undefined}
            />

            <AdminLink
              href="/admin/services"
              icon="🛠"
              title="Manage Services"
              description="Control services, rates and availability."
            />

            <AdminLink
  href="/admin/categories"
  icon="✨"
  title="Manage Categories"
  description="Create categories, change icons, glow and display order."
/>

            <AdminLink
              href="/admin/users"
              icon="🔐"
              title="User Accounts"
              description="Open individual user management."
            />

            <AdminLink
              href="/admin/services"
              icon="📦"
              title="Service Catalog"
              description="Manage the services available to customers."
            />

            <AdminLink
              href="/admin/deposits"
              icon="🧾"
              title="Payment Requests"
              description="Check UTRs and payment requests."
            />
          </div>
        </section>

        {/* System Status */}
        <section className="mt-8">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">System Status</h3>
                <p className="mt-1 text-xs text-gray-600">
                  Current DreamSMM administration environment.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Admin APIs Online
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StatusItem
                title="Users API"
                status="Connected"
              />

              <StatusItem
                title="Deposits API"
                status="Connected"
              />

              <StatusItem
                title="Services API"
                status="Available"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] text-gray-700">
          DreamSMM Administration · Secure admin access required
        </p>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  valueClass = "text-white",
}: {
  title: string;
  value: string | number;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-4 sm:p-5">
      <p className="text-xs text-gray-500 sm:text-sm">{title}</p>

      <p className={`mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl ${valueClass}`}>
        {value}
      </p>

      <p className="mt-1 text-[10px] text-gray-600 sm:text-xs">
        {description}
      </p>
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
      className="group relative rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5 transition hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-[#0e121c]"
    >
      {badge !== undefined && (
        <span className="absolute right-4 top-4 rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-bold text-yellow-400">
          {badge}
        </span>
      )}

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-lg">
        {icon}
      </div>

      <h4 className="mt-4 font-semibold group-hover:text-blue-400">
        {title}
      </h4>

      <p className="mt-1 text-xs leading-5 text-gray-600">
        {description}
      </p>

      <div className="mt-4 text-xs font-medium text-gray-500 group-hover:text-blue-400">
        Open →
      </div>
    </Link>
  );
}

function StatusItem({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
      <span className="text-xs text-gray-400">{title}</span>

      <span className="flex items-center gap-1.5 text-[10px] font-medium text-green-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        {status}
      </span>
    </div>
  );
}