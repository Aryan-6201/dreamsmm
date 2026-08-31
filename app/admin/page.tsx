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
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5 dark:border-white/10 dark:bg-slate-900">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>

          <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-xl ring-1 ring-slate-100 transition duration-300 group-hover:scale-110 dark:bg-white/10 dark:ring-white/10">
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
      className="group relative flex min-h-[170px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-900 dark:hover:border-violet-500/50"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-100/70 blur-3xl transition duration-300 group-hover:scale-125 group-hover:bg-fuchsia-100/70 dark:bg-violet-500/10" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xl text-white shadow-lg shadow-violet-200 transition duration-300 group-hover:rotate-3 group-hover:scale-105 dark:shadow-none">
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
          <h3 className="text-sm font-black text-slate-900 transition-colors group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-300">
            {title}
          </h3>

          <span
            aria-hidden="true"
            className="text-base text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600 dark:text-slate-600"
          >
            →
          </span>
        </div>

        <p className="mt-1.5 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
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
          ? "dark min-h-screen bg-slate-950"
          : "min-h-screen bg-slate-50"
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
          className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200/80 bg-white px-4 py-5 transition-transform duration-300 dark:border-white/10 dark:bg-slate-900 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 font-black text-white shadow-lg shadow-violet-200 dark:shadow-none">
                D
              </span>

              <span>
                <b className="block text-lg font-black tracking-tight">
                  Dream<span className="text-violet-600">SMM</span>
                </b>
                <small className="block text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">
                  Admin console
                </small>
              </span>
            </Link>

            <button
              className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-white/10"
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
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
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

          <div className="mt-auto rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-100 font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                A
              </span>

              <div>
                <p className="text-sm font-black">Administrator</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Control Center
                </p>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="mt-4 flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-violet-700 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10 dark:hover:text-violet-300"
            >
              <span>{darkMode ? "Light appearance" : "Dark appearance"}</span>
              <span>{darkMode ? "☀" : "☾"}</span>
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
            <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <button
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-white/10"
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
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-400"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  aria-label="Notifications"
                >
                  ♧
                  {stats.pendingDeposits > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                  )}
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="hidden h-10 rounded-xl px-3 text-sm text-slate-500 hover:bg-slate-100 sm:block dark:text-slate-300 dark:hover:bg-white/10"
                  aria-label="Toggle appearance"
                >
                  {darkMode ? "☀" : "☾"}
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-violet-800 to-fuchsia-700 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
              <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-violet-100">
                    Control Center
                  </span>

                  <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                    Good to see you, Administrator.
                  </h1>

                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-violet-100">
                    Everything you need to manage DreamSMM is organized in one
                    clear workspace.
                  </p>
                </div>

                <button
                  onClick={loadDashboard}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-violet-700 shadow-lg transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
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
                accent="from-violet-600 to-indigo-500"
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

            <section className="mt-8 grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.14em] text-violet-600 dark:text-violet-300">
                      Audience health
                    </p>
                    <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                      User activity
                    </h2>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      A quick view of your currently active accounts.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {loading ? "—" : `${activeRate}% active`}
                  </span>
                </div>

                <div className="mt-8 flex items-end gap-2">
                  <div className="h-28 flex-1 rounded-t-lg bg-violet-100 dark:bg-violet-500/15" />
                  <div className="h-20 flex-1 rounded-t-lg bg-violet-200 dark:bg-violet-500/25" />
                  <div className="h-36 flex-1 rounded-t-lg bg-violet-300 dark:bg-violet-500/35" />
                  <div className="h-24 flex-1 rounded-t-lg bg-violet-400 dark:bg-violet-500/50" />
                  <div className="h-40 flex-1 rounded-t-lg bg-gradient-to-t from-violet-600 to-fuchsia-500" />
                  <div className="h-32 flex-1 rounded-t-lg bg-violet-300 dark:bg-violet-500/35" />
                  <div className="h-44 flex-1 rounded-t-lg bg-violet-200 dark:bg-violet-500/25" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">
                      System status
                    </h2>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Live dashboard summary
                    </p>
                  </div>

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,.12)]" />
                </div>

                <dl className="mt-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      User accounts
                    </dt>
                    <dd className="font-black text-slate-900 dark:text-white">
                      {loading ? "—" : stats.users}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Active users
                    </dt>
                    <dd className="font-black text-emerald-600 dark:text-emerald-300">
                      {loading ? "—" : stats.activeUsers}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
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
                  <p className="text-[11px] font-bold uppercase tracking-[.14em] text-violet-600 dark:text-violet-300">
                    Workspace
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
                    Quick actions
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Jump straight to the tools you use most.
                  </p>
                </div>

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs font-bold text-violet-600 hover:text-violet-800 dark:text-violet-300"
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
                <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm font-medium text-slate-500 dark:border-white/15 dark:text-slate-400">
                  No actions match “{search}”.
                </div>
              )}
            </section>

            <section className="mt-10 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
                <h2 className="text-lg font-black text-slate-950 dark:text-white">
                  Recent activity
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Dashboard updates and next actions
                </p>

                <div className="mt-6 space-y-5">
                  <div className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-sm dark:bg-emerald-500/15">
                      ✓
                    </span>
                    <div>
                      <p className="text-sm font-bold">Dashboard data is ready</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        User and deposit information has been loaded.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-50 text-sm dark:bg-amber-500/15">
                      ₹
                    </span>
                    <div>
                      <p className="text-sm font-bold">Deposit review queue</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {loading
                          ? "Loading pending items…"
                          : `${stats.pendingDeposits} deposit request${
                              stats.pendingDeposits === 1 ? "" : "s"
                            } awaiting review.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-50 text-sm dark:bg-violet-500/15">
                      👥
                    </span>
                    <div>
                      <p className="text-sm font-bold">Account overview</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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

              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-lg shadow-violet-950/10 sm:p-6">
                <span className="text-[11px] font-bold uppercase tracking-[.14em] text-violet-200">
                  Need attention
                </span>

                <h2 className="mt-2 text-xl font-black">
                  Keep the panel moving.
                </h2>

                <p className="mt-2 max-w-md text-sm font-medium leading-6 text-violet-100">
                  Review pending deposits, check services, and keep your user
                  accounts up to date from the controls above.
                </p>

                <Link
                  href="/admin/deposits"
                  className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-violet-700 shadow-lg transition hover:bg-violet-50"
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