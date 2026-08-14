import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import OrderForm from "./OrderForm";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) redirect("/login");

  const session = await verifySession(token);

  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      name: true,
      email: true,
      balance: true,
    },
  });

  if (!user) redirect("/login");

  const services = await prisma.service.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const formattedServices = services.map((service) => ({
    id: service.id,
    name: service.name,
    platform: service.platform,
    category: service.category,
    description: service.description,
    rate: service.rate.toString(),
    min: service.min,
    max: service.max,
  }));

  const firstName =
    user.name?.trim().split(" ")[0] || "there";

  const initials = (
    user.name?.trim() ||
    user.email ||
    "US"
  )
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-slate-900">
      <Sidebar />

      <div className="lg:ml-[250px]">
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-8">

          {/* ================= HEADER ================= */}

          <header className="relative z-50 flex items-center justify-between gap-4">

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>

                <span className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-[11px]">
                  DreamSMM Dashboard
                </span>

              </div>

              <p className="mt-1.5 hidden text-sm font-medium text-slate-500 sm:block">
                Your social growth command center
              </p>

            </div>

            <div className="flex shrink-0 items-center gap-2">

              {/* OUTSIDE ADD FUNDS */}

              <a
                href="/funds"
                className="group inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-violet-200 sm:px-5"
              >
                <span className="text-lg font-black leading-none transition-transform group-hover:rotate-90">
                  +
                </span>

                <span>
                  Add Funds
                </span>
              </a>

              {/* THREE DOT MENU */}

              <details className="group relative">

                <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black leading-none text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 [&::-webkit-details-marker]:hidden">
                  <span className="mb-1">
                    ⋮
                  </span>
                </summary>

                <div className="absolute right-0 top-[calc(100%+10px)] w-[285px] overflow-hidden rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_25px_70px_rgba(15,23,42,0.16)]">

                  <div className="px-3 pb-3 pt-2">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Quick Actions
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Manage your workspace
                        </p>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-sm font-black text-violet-700">
                        ✦
                      </div>

                    </div>

                  </div>

                  <div className="h-px bg-slate-100" />

                  <MenuItem
                    href="/services"
                    icon="✦"
                    title="Browse Services"
                    description="Explore the service catalog"
                    iconClass="bg-violet-50 text-violet-700"
                  />

                  <MenuItem
                    href="/orders"
                    icon="▣"
                    title="Order History"
                    description="Track all your orders"
                    iconClass="bg-blue-50 text-blue-700"
                  />

                  <MenuItem
                    href="/tickets"
                    icon="?"
                    title="Create Ticket"
                    description="Contact support"
                    iconClass="bg-amber-50 text-amber-700"
                  />

                  <MenuItem
                    href="/funds"
                    icon="₹"
                    title="Add Funds"
                    description="Add money to your balance"
                    iconClass="bg-emerald-50 text-emerald-700"
                  />

                  <div className="my-1 h-px bg-slate-100" />

                  <MenuItem
                    href="/profile"
                    icon="◉"
                    title="My Profile"
                    description={user.email}
                    iconClass="bg-slate-100 text-slate-600"
                  />

                </div>
              </details>

              {/* PROFILE */}

              <div className="hidden h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 shadow-sm sm:flex sm:px-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-[10px] font-black text-white">
                  {initials}
                </div>

                <div className="max-w-[145px]">

                  <p className="truncate text-xs font-black text-slate-800">
                    {user.name || "User"}
                  </p>

                  <p className="truncate text-[10px] font-medium text-slate-400">
                    {user.email}
                  </p>

                </div>

              </div>

            </div>
          </header>

          {/* ================= HERO ================= */}

          <section className="relative mt-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.07)]">

            <div className="pointer-events-none absolute -right-32 -top-36 h-[440px] w-[440px] rounded-full bg-violet-200/40 blur-[100px]" />

            <div className="pointer-events-none absolute -bottom-40 left-[32%] h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-[100px]" />

            <div className="relative px-6 py-9 sm:px-10 sm:py-11 lg:px-12 lg:py-14">

              <div className="flex flex-wrap items-center gap-2">

                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[11px] font-black text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  All systems operational
                </span>

                <span className="rounded-full border border-violet-100 bg-violet-50 px-3.5 py-2 text-[11px] font-black text-violet-700">
                  {services.length} services live
                </span>

              </div>

              <div className="mt-7 max-w-5xl">

                <p className="text-sm font-black text-violet-600">
                  Welcome back, {firstName}
                </p>

                <h1 className="mt-2 text-[42px] font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-[64px]">
                  Everything you need
                  <span className="block bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    to grow online.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
                  Discover high-quality social media services,
                  configure your order and launch your campaign
                  from one clean workspace.
                </p>

              </div>

              <div className="mt-8 flex flex-wrap gap-3">

                <a
                  href="#new-order"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-black text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  Create New Order

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>

                <a
                  href="/services"
                  className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
                >
                  Explore Services
                </a>

              </div>

            </div>
          </section>

          {/* ================= STATS ================= */}

          <section className="mt-5 grid gap-4 sm:grid-cols-2">

            <StatCard
              label="Available Balance"
              value={`₹${user.balance.toString()}`}
              description="Ready to use"
              icon="₹"
              variant="violet"
            />

            <StatCard
              label="Active Services"
              value={String(services.length)}
              description="Live services in your catalog"
              icon="✦"
              variant="blue"
            />

          </section>

          {/* ================= ORDER AREA ================= */}

          <section
            id="new-order"
            className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"
          >

            <div className="overflow-visible rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_65px_rgba(15,23,42,0.06)]">

              <div className="border-b border-slate-100 px-5 py-6 sm:px-7">

                <div className="flex items-center justify-between gap-5">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-black text-white shadow-lg shadow-violet-200">
                      +
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-xl font-black tracking-tight text-slate-900">
                          Create New Order
                        </h2>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                          Live
                        </span>

                      </div>

                      <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                        Search, select and configure your service.
                      </p>

                    </div>

                  </div>

                  <div className="hidden text-right sm:block">

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Catalog
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-700">
                      {services.length} services
                    </p>

                  </div>

                </div>
              </div>

              <div className="p-5 sm:p-7 lg:p-8">
                <OrderForm services={formattedServices} />
              </div>

            </div>

            {/* ================= RIGHT PANEL ================= */}

            <aside className="space-y-4">

              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Services
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900">
                      {services.length}
                    </p>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                    ✦
                  </div>

                </div>

                <p className="mt-4 text-xs font-medium leading-5 text-slate-500">
                  Active services are ready to use from
                  your order workspace.
                </p>

                <a
                  href="/services"
                  className="mt-4 flex h-11 items-center justify-center rounded-xl bg-violet-50 text-xs font-black text-violet-800 transition hover:bg-violet-100"
                >
                  Browse Services →
                </a>

              </div>

              <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 p-6 text-white shadow-xl">

                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200/70">
                      Wallet
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                      ₹
                    </span>

                  </div>

                  <p className="mt-5 text-xs font-medium text-violet-200/70">
                    Available balance
                  </p>

                  <p className="mt-1 text-3xl font-black tracking-tight">
                    ₹{user.balance.toString()}
                  </p>

                  <a
                    href="/funds"
                    className="mt-5 flex h-11 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-900 transition hover:bg-violet-50"
                  >
                    + Add Funds
                  </a>

                </div>

              </div>

              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                    ?
                  </div>

                  <div>

                    <h3 className="text-sm font-black text-slate-900">
                      Need assistance?
                    </h3>

                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                      Need help with an order or account?
                      Create a support ticket.
                    </p>

                  </div>

                </div>

                <a
                  href="/tickets"
                  className="mt-4 flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                >
                  Create Ticket →
                </a>

              </div>

            </aside>

          </section>

          {/* ================= FEATURES ================= */}

          <section className="mt-5 grid gap-4 md:grid-cols-3">

            <Feature
              icon="✓"
              title="Secure"
              description="Protected account and order flow."
            />

            <Feature
              icon="⚡"
              title="Fast Processing"
              description="Designed for quick and reliable ordering."
            />

            <Feature
              icon="✦"
              title="Large Catalog"
              description={`${services.length} active services ready to explore.`}
            />

          </section>

          {/* ================= FOOTER ================= */}

          <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-6 text-xs text-slate-400 sm:flex-row">

            <p>
              © {new Date().getFullYear()} DreamSMM
            </p>

            <div className="flex items-center gap-5">

              <a
                href="/services"
                className="transition hover:text-slate-700"
              >
                Services
              </a>

              <a
                href="/orders"
                className="transition hover:text-slate-700"
              >
                Orders
              </a>

              <a
                href="/tickets"
                className="transition hover:text-slate-700"
              >
                Support
              </a>

              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>

            </div>

          </footer>

        </div>
      </div>
    </main>
  );
}

/* =========================================================
   MENU ITEM
========================================================= */

function MenuItem({
  href,
  icon,
  title,
  description,
  iconClass,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  iconClass: string;
}) {
  return (
    <a
      href={href}
      className="group/item flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-black text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
          {description}
        </p>

      </div>

      <span className="text-slate-300 transition group-hover/item:translate-x-1 group-hover/item:text-slate-700">
        →
      </span>
    </a>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
  variant,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
  variant: "violet" | "blue";
}) {
  const iconClass =
    variant === "violet"
      ? "bg-violet-50 text-violet-700"
      : "bg-blue-50 text-blue-700";

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-5">

        <div>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>

          <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-500">
            {description}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-700">
          {icon}
        </div>

        <div>

          <h3 className="text-sm font-black text-slate-800">
            {title}
          </h3>

          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}