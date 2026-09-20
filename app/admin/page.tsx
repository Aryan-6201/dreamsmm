"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Stats = {
  users: number;
  activeUsers: number;
  admins: number;
  pendingDeposits: number;
};

type Action = {
  href: string;
  icon: string;
  title: string;
  description: string;
  badge?: number;
};

const navigation = [
  { href: "/admin", icon: "▦", label: "Overview", active: true },
  { href: "/admin/users", icon: "👥", label: "Users" },
  { href: "/admin/deposits", icon: "₹", label: "Deposits" },
  { href: "/admin/services", icon: "⚙", label: "Services" },
  { href: "/admin/discounts", icon: "%", label: "Discounts" },
  { href: "/admin/categories", icon: "✦", label: "Categories" },
  { href: "/admin/blog", icon: "📝", label: "Blog" },
];

function StatCard({
  title,
  value,
  description,
  icon,
  accent,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  accent: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5 ">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 ">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 ">
            {value}
          </p>

          <p className="mt-1.5 text-xs font-medium text-slate-500 ">
            {description}
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-xl ring-1 ring-slate-100 transition duration-300 group-hover:scale-110  ">
          {icon}
        </div>
      </div>
    </article>
  );
}

function ActionCard({ href, icon, title, description, badge }: Action) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[170px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-950/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2  "
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-100/70 blur-xl transition duration-300 group-hover:scale-125 group-hover:bg-teal-100/70 " />

      <div className="relative flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-xl text-white shadow-lg shadow-teal-200 transition duration-300 group-hover:rotate-3 group-hover:scale-105 ">
          {icon}
        </div>

        {badge !== undefined && (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-600 ring-1 ring-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/20">
            {badge} pending
          </span>
        )}
      </div>

      <div className="relative mt-auto pt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-black text-slate-900 transition-colors group-hover:text-teal-700  dark:group-hover:text-teal-300">
            {title}
          </h3>

          <span
            aria-hidden="true"
            className="text-base text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-600 dark:text-slate-600"
          >
            →
          </span>
        </div>

        <p className="mt-1.5 text-xs font-medium leading-5 text-slate-500 ">
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");

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

  const actions = useMemo<Action[]>(
    () => [
      {
        href: "/admin/users",
        icon: "👥",
        title: "Manage Users",
        description: "View users, balances and account status.",
      },
      {
        href: "/admin/deposits",
        icon: "₹",
        title: "Manage Deposits",
        description: "Review and approve pending deposits.",
        badge: stats.pendingDeposits || undefined,
      },
      {
        href: "/admin/services",
        icon: "⚙",
        title: "Manage Services",
        description: "Control services, rates and availability.",
      },
      {
        href: "/admin/categories",
        icon: "✦",
        title: "Manage Categories",
        description: "Create categories and manage their display order.",
      },
      {
        href: "/admin/blog",
        icon: "📝",
        title: "Manage Blog",
        description: "Create, edit and publish blog posts.",
      },
      {
        href: "/admin/users",
        icon: "◉",
        title: "User Accounts",
        description: "Inspect individual user accounts and activity.",
      },
      {
        href: "/admin/deposits",
        icon: "✓",
        title: "Deposit Review",
        description: "Handle pending payment verification requests.",
      },
    ],
    [stats.pendingDeposits]
  );

  const visibleActions = actions.filter((action) =>
    `${action.title} ${action.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeRate = stats.users
    ? Math.round((stats.activeUsers / stats.users) * 100)
    : 0;

  return (
    <main
      className={
        darkMode
          ? "min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40"
          : "min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40"
      }
    >
      <div className="min-h-screen text-slate-900 dark:text-slate-100 lg:grid lg:grid-cols-[260px_1fr]">
        {sidebarOpen && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200/80 bg-white px-4 py-5 transition-transform duration-300  lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 font-black text-white shadow-lg shadow-teal-200 ">
                D
              </span>

              <span>
                <b className="block text-lg font-black tracking-tight">
                  Dream<span className="text-teal-600">SMM</span>
                </b>
                <small className="block text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">
                  Admin console
                </small>
              </span>
            </Link>

            <button
              className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden "
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
            >
              ×
            </button>
          </div>

          <nav className="mt-9 space-y-1" aria-label="Admin navigation">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                  item.active
                    ? "bg-teal-50 text-teal-700  "
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900   "
                }`}
              >
                <span className="grid w-5 place-items-center text-base">
                  {item.icon}
                </span>

                {item.label}

                {item.label === "Deposits" && stats.pendingDeposits > 0 && (
                  <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
                    {stats.pendingDeposits}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-slate-50 p-4 ">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-100 font-black text-teal-700  ">
                A
              </span>

              <div>
                <p className="text-sm font-black">Administrator</p>
                <p className="text-[11px] font-medium text-slate-500 ">
                  Control Center
                </p>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="mt-4 flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-teal-700    dark:hover:text-teal-300"
            >
              <span>"Appearance"</span>
              <span>"☼"</span>
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 ">
            <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <button
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden  "
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                ☰
              </button>

              <div className="relative max-w-md flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-slate-400">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search actions..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 dark:border-white/10   dark:focus:border-teal-400"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100  "
                  aria-label="Notifications"
                >
                  ♧
                  {stats.pendingDeposits > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                  )}
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="hidden h-10 rounded-xl px-3 text-sm text-slate-500 hover:bg-slate-100 sm:block  "
                  aria-label="Toggle appearance"
                >
                  "☼"
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-600 p-6 text-white shadow-xl shadow-teal-200/70 sm:p-8">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-xl" />
              <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-300/20 blur-xl" />

              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-teal-100">
                    Control Center
                  </span>

                  <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                    Good to see you, Administrator.
                  </h1>

                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-teal-100">
                    Everything you need to manage DreamSMM is organized in one
                    clear workspace.
                  </p>
                </div>

                <button
                  onClick={loadDashboard}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-teal-700 shadow-lg transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span aria-hidden="true" className={loading ? "animate-spin" : ""}>
                    ↻
                  </span>
                  {loading ? "Loading..." : "Refresh data"}
                </button>
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-500/20  "
              >
                {error}
              </div>
            )}

            <section className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
              <StatCard
                title="Total Users"
                value={loading ? "—" : stats.users}
                description="Registered accounts"
                icon="👥"
                accent="from-teal-600 to-cyan-500"
              />

              <StatCard
                title="Active Users"
                value={loading ? "—" : stats.activeUsers}
                description="Currently active"
                icon="✓"
                accent="from-emerald-500 to-teal-400"
              />

              <StatCard
                title="Administrators"
                value={loading ? "—" : stats.admins}
                description="Admin accounts"
                icon="🛡"
                accent="from-sky-500 to-blue-500"
              />

              <StatCard
                title="Pending Deposits"
                value={loading ? "—" : stats.pendingDeposits}
                description="Need verification"
                icon="₹"
                accent="from-amber-500 to-orange-400"
              />
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link href="/admin/services" className="group rounded-3xl border border-teal-100 bg-white p-5 shadow-[0_12px_35px_rgba(13,148,136,0.08)] transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_45px_rgba(13,148,136,0.13)]">
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-xl text-teal-700">⚙</span>
              <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-500">→</span>
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">Add Service</h3>
            <p className="mt-1 text-sm text-slate-500">Create and manage your SMM services.</p>
          </Link>

          <Link href="/admin/blog" className="group rounded-3xl border border-teal-100 bg-white p-5 shadow-[0_12px_35px_rgba(13,148,136,0.08)] transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_45px_rgba(13,148,136,0.13)]">
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-xl text-teal-700">✎</span>
              <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-500">→</span>
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">Write Blog</h3>
            <p className="mt-1 text-sm text-slate-500">Publish and manage blog posts.</p>
          </Link>

          <Link href="/admin/categories" className="group rounded-3xl border border-teal-100 bg-white p-5 shadow-[0_12px_35px_rgba(13,148,136,0.08)] transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_45px_rgba(13,148,136,0.13)]">
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-xl text-cyan-700">▦</span>
              <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-500">→</span>
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">Categories</h3>
            <p className="mt-1 text-sm text-slate-500">Organize services into categories.</p>
          </Link>

          <Link href="/admin/deposits" className="group rounded-3xl border border-teal-100 bg-white p-5 shadow-[0_12px_35px_rgba(13,148,136,0.08)] transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_45px_rgba(13,148,136,0.13)]">
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-xl text-emerald-700">₹</span>
              <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500">→</span>
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">Review Deposits</h3>
            <p className="mt-1 text-sm text-slate-500">Approve or reject pending payments.</p>
          </Link>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm  sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-600 ">
                      Audience health
                    </p>
                    <h2 className="mt-1 text-lg font-black text-slate-950 ">
                      User activity
                    </h2>
                    <p className="mt-1 text-xs font-medium text-slate-500 ">
                      A quick view of your currently active accounts.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600  dark:text-emerald-300">
                    {loading ? "—" : `${activeRate}% active`}
                  </span>
                </div>

                <div className="mt-8 flex items-end gap-2">
                  <div className="h-28 flex-1 rounded-t-lg bg-teal-100 " />
                  <div className="h-20 flex-1 rounded-t-lg bg-teal-200 " />
                  <div className="h-36 flex-1 rounded-t-lg bg-teal-300 " />
                  <div className="h-24 flex-1 rounded-t-lg bg-teal-400 " />
                  <div className="h-40 flex-1 rounded-t-lg bg-gradient-to-t from-teal-600 to-teal-500" />
                  <div className="h-32 flex-1 rounded-t-lg bg-teal-300 " />
                  <div className="h-44 flex-1 rounded-t-lg bg-teal-200 " />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm  sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-950 ">
                      System status
                    </h2>
                    <p className="mt-1 text-xs font-medium text-slate-500 ">
                      Live dashboard summary
                    </p>
                  </div>

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,.12)]" />
                </div>

                <dl className="mt-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
                    <dt className="text-sm font-medium text-slate-500 ">
                      User accounts
                    </dt>
                    <dd className="font-black text-slate-900 ">
                      {loading ? "—" : stats.users}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
                    <dt className="text-sm font-medium text-slate-500 ">
                      Active users
                    </dt>
                    <dd className="font-black text-emerald-600 dark:text-emerald-300">
                      {loading ? "—" : stats.activeUsers}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-slate-500 ">
                      Deposits to review
                    </dt>
                    <dd className="font-black text-amber-600 dark:text-amber-300">
                      {loading ? "—" : stats.pendingDeposits}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-600 ">
                    Workspace
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 ">
                    Quick actions
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-500 ">
                    Jump straight to the tools you use most.
                  </p>
                </div>

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs font-bold text-teal-600 hover:text-teal-800 "
                  >
                    Clear search
                  </button>
                )}
              </div>

              {visibleActions.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleActions.map((action) => (
                    <ActionCard key={action.title} {...action} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm font-medium text-slate-500  ">
                  No actions match “{search}”.
                </div>
              )}
            </section>

            <section className="mt-10 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm  sm:p-6">
                <h2 className="text-lg font-black text-slate-950 ">
                  Recent activity
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-500 ">
                  Dashboard updates and next actions
                </p>

                <div className="mt-6 space-y-5">
                  <div className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-sm ">
                      ✓
                    </span>
                    <div>
                      <p className="text-sm font-bold">Dashboard data is ready</p>
                      <p className="mt-1 text-xs text-slate-500 ">
                        User and deposit information has been loaded.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-50 text-sm ">
                      ₹
                    </span>
                    <div>
                      <p className="text-sm font-bold">Deposit review queue</p>
                      <p className="mt-1 text-xs text-slate-500 ">
                        {loading
                          ? "Loading pending items…"
                          : `${stats.pendingDeposits} deposit request${
                              stats.pendingDeposits === 1 ? "" : "s"
                            } awaiting review.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 text-sm ">
                      👥
                    </span>
                    <div>
                      <p className="text-sm font-bold">Account overview</p>
                      <p className="mt-1 text-xs text-slate-500 ">
                        {loading
                          ? "Loading account totals…"
                          : `${stats.activeUsers} active user${
                              stats.activeUsers === 1 ? "" : "s"
                            } out of ${stats.users} total.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 p-5 text-white shadow-lg shadow-teal-950/10 sm:p-6">
                <span className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-200">
                  Need attention
                </span>

                <h2 className="mt-2 text-xl font-black">
                  Keep the panel moving.
                </h2>

                <p className="mt-2 max-w-md text-sm font-medium leading-6 text-teal-100">
                  Review pending deposits, check services, and keep your user
                  accounts up to date from the controls above.
                </p>

                <Link
                  href="/admin/deposits"
                  className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-teal-700 shadow-lg transition hover:bg-teal-50"
                >
                  Review deposits <span className="ml-2">→</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}



