"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  balance: string;
  totalSpent: string;
  discountPercent: string;
  lastSeenAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  _count: {
    orders: number;
    transactions: number;
  };
};

const navItems = [
  { href: "/admin", icon: "⌂", label: "Dashboard" },
  { href: "/admin/users", icon: "◉", label: "Users" },
  { href: "/admin/deposits", icon: "₹", label: "Deposits" },
  { href: "/admin/services", icon: "⚙", label: "Services" },
  { href: "/admin/categories", icon: "✦", label: "Categories" },
  { href: "/admin/blog", icon: "✎", label: "Blog" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | User["status"]>("ALL");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load users.");
        return;
      }

      setUsers(data.users || []);
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateDiscount(userId: string, discountPercent: string) {
    const value = Number(discountPercent);

    if (!Number.isFinite(value) || value < 0 || value > 100) {
      setMessage("Discount must be between 0% and 100%.");
      return;
    }

    try {
      setMessage("");

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          discountPercent: value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update discount.");
      }

      setMessage(`Discount updated to ${value}% successfully.`);

      setUsers((current) =>
        current.map((item) =>
          item.id === userId
            ? { ...item, discountPercent: String(value) }
            : item
        )
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update discount."
      );
    }
  }

  const counts = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "ACTIVE").length,
      suspended: users.filter((u) => u.status === "SUSPENDED").length,
      banned: users.filter((u) => u.status === "BANNED").length,
      admins: users.filter((u) => u.role === "ADMIN").length,
    }),
    [users]
  );

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      user.name?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function formatLastSeen(date: string | null) {
    if (!date) return "Never";

    const time = new Date(date).getTime();
    const now = Date.now();
    const minutes = Math.floor((now - time) / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    return new Date(date).toLocaleDateString();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/50 text-slate-900">
      <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-slate-200/80 bg-white/90 px-4 py-5 lg:flex lg:h-screen lg:flex-col lg:sticky lg:top-0">
          <Link href="/admin" className="flex items-center gap-3 px-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 font-black text-white shadow-lg shadow-teal-200">
              D
            </span>
            <span>
              <b className="block text-lg font-black tracking-tight">
                Dream<span className="text-teal-600">SMM</span>
              </b>
              <small className="block text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
                Admin console
              </small>
            </span>
          </Link>

          <div className="mt-8">
            <p className="px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
              Management
            </p>

            <nav className="mt-3 space-y-1">
              {navItems.map((item) => {
                const active = item.href === "/admin/users";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                      active
                        ? "bg-teal-50 text-teal-700 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg text-sm ${
                        active
                          ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
            <p className="text-xs font-black text-teal-900">Admin tip</p>
            <p className="mt-1 text-[11px] font-medium leading-5 text-teal-700/70">
              Search users by username, Gmail or user ID to manage accounts faster.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-sm">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-teal-600">
                  DreamSMM / Admin
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-700">
                  User Management
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={loadUsers}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:border-teal-200 hover:text-teal-700 disabled:opacity-60 sm:px-4 sm:text-sm"
                >
                  ↻ <span className="hidden sm:inline">Refresh</span>
                </button>

                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-black text-white shadow-md shadow-teal-200">
                  A
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* Hero */}
            <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-700 p-6 text-white shadow-[0_24px_70px_rgba(13,148,136,0.20)] sm:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em]">
                    User management
                  </span>
                  <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                    Manage Users
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-teal-100">
                    Manage accounts, balances, activity, status and custom discounts
                    from one clean admin workspace.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:min-w-[430px]">
                  {[
                    ["Total", counts.total],
                    ["Active", counts.active],
                    ["Admins", counts.admins],
                    ["Banned", counts.banned],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100">
                        {label}
                      </p>
                      <p className="mt-1 text-xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ⌕
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search username, Gmail or user ID..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(["ALL", "ACTIVE", "SUSPENDED", "BANNED"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-full px-3.5 py-2 text-[11px] font-black transition ${
                        statusFilter === status
                          ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                          : "bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                      }`}
                    >
                      {status === "ALL" ? "All Users" : status}
                      {status !== "ALL" && (
                        <span className="ml-1.5 opacity-70">
                          {counts[status.toLowerCase() as "active" | "suspended" | "banned"]}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">
                {message}
              </div>
            )}

            {/* Results header */}
            <div className="mt-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  User Accounts
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="self-start rounded-lg px-3 py-2 text-xs font-black text-teal-600 hover:bg-teal-50"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Users */}
            <section className="mt-4">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                  <p className="mt-4 text-sm font-bold text-slate-500">
                    Loading users...
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-xl text-teal-600">
                    ⌕
                  </div>
                  <p className="mt-4 font-black text-slate-800">No users found</p>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    Try another username, Gmail, ID or status filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_16px_40px_rgba(13,148,136,0.08)] sm:p-5"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                        {/* User */}
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 font-black text-teal-700 ring-4 ring-teal-50">
                            {(user.name || user.email || "U").charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-black text-slate-900">
                                {user.name || "Unnamed User"}
                              </p>

                              {user.role === "ADMIN" && (
                                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[10px] font-black text-teal-700">
                                  ADMIN
                                </span>
                              )}

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                                  user.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : user.status === "SUSPENDED"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
                                }`}
                              >
                                {user.status}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-sm font-medium text-slate-500">
                              {user.email}
                            </p>

                            <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-3">
                          <div className="min-w-[115px]">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Balance
                            </p>
                            <p className="mt-1 font-black text-slate-900">
                              INR {user.balance}
                            </p>
                          </div>

                          <div className="min-w-[115px]">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Total Spent
                            </p>
                            <p className="mt-1 font-bold text-slate-700">
                              INR {user.totalSpent}
                            </p>
                          </div>

                          <div className="min-w-[115px]">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Activity
                            </p>
                            <p className="mt-1 font-bold text-slate-700">
                              {formatLastSeen(user.lastSeenAt)}
                            </p>
                            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                              {user._count.orders} orders
                            </p>
                          </div>
                        </div>

                        {/* Discount */}
                        <div className="rounded-xl bg-slate-50 p-3 xl:min-w-[220px]">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Custom Discount
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={user.discountPercent}
                              onChange={(e) => {
                                const value = e.target.value;

                                setUsers((current) =>
                                  current.map((item) =>
                                    item.id === user.id
                                      ? { ...item, discountPercent: value }
                                      : item
                                  )
                                );
                              }}
                              className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                            />

                            <span className="text-xs font-bold text-slate-400">%</span>

                            <button
                              type="button"
                              onClick={() =>
                                updateDiscount(user.id, user.discountPercent)
                              }
                              className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-teal-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>

                        {/* Action */}
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-2.5 text-center text-sm font-black text-teal-700 transition hover:bg-teal-100 xl:self-center"
                        >
                          Manage →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}



