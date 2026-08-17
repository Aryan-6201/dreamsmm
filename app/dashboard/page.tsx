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

              {/* ADD FUNDS */}

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

                <div className="absolute right-0 top-14 z-50 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">

                  <a
                    href="/orders"
                    className="flex items-center rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
                  >
                    Orders
                  </a>

                  <a
                    href="/services"
                    className="flex items-center rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
                  >
                    Services
                  </a>

                  <a
                    href="/transactions"
                    className="flex items-center rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
                  >
                    Transactions
                  </a>

                  <a
                    href="/tickets"
                    className="flex items-center rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
                  >
                    Support
                  </a>

                </div>

              </details>

            </div>

          </header>

          {/* ================= WELCOME ================= */}

          <section className="mt-7">

            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

              {/* WELCOME CARD */}

              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative">

                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5">

                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />

                    <span className="text-[8px] font-black uppercase tracking-[0.18em] text-violet-700">
                      Growth Workspace
                    </span>

                  </div>

                  <h1 className="max-w-2xl text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">
                    Welcome back, {firstName}.
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                    Build your next order with a clean, fast and powerful
                    social growth workflow.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">

                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[9px] font-bold text-slate-500">
                      ⚡ Fast delivery
                    </span>

                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[9px] font-bold text-slate-500">
                      🛡 Reliable services
                    </span>

                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[9px] font-bold text-slate-500">
                      💜 Premium panel
                    </span>

                  </div>

                </div>

              </div>

              {/* BALANCE CARD */}

              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-6 text-white shadow-xl shadow-violet-200">

                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/60">
                      Available Balance
                    </p>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                      ₹
                    </div>

                  </div>

                  <p className="mt-5 text-3xl font-black tracking-[-0.04em]">
                    ₹{Number(user.balance).toFixed(2)}
                  </p>

                  <p className="mt-2 text-[9px] font-medium text-white/60">
                    Ready to use for your next order
                  </p>

                  <a
                    href="/funds"
                    className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-[9px] font-black uppercase tracking-[0.12em] text-violet-700 transition hover:bg-violet-50"
                  >
                    Add Funds
                  </a>

                </div>

              </div>

            </div>

          </section>

          {/* ================= ORDER SECTION ================= */}

          <section className="mt-7">

            <div className="mb-5 flex items-end justify-between gap-4">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600">
                  New Order
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-900">
                  Create your order
                </h2>

                <p className="mt-1.5 text-xs font-medium text-slate-500">
                  Select a platform, choose a service and place your order.
                </p>

              </div>

              <a
                href="/orders"
                className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 sm:inline-flex"
              >
                Order History
              </a>

            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

              {/* ORDER FORM */}

              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[#02030a] p-5 shadow-xl sm:p-7">

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(139,92,246,.12),transparent_32%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,.08),transparent_28%)]" />

                <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:50px_50px]" />

                <div className="relative">

                  <div className="mb-6 flex items-center justify-between">

                    <div>

                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-300/60">
                        Order Builder
                      </p>

                      <p className="mt-1 text-lg font-black text-white">
                        Place a new order
                      </p>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-violet-300">
                      +
                    </div>

                  </div>

                  <OrderForm services={formattedServices} />

                </div>

              </div>

              {/* SIDE INFORMATION */}

              <aside className="space-y-4">

                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      ✓
                    </div>

                    <div>

                      <p className="text-sm font-black text-slate-800">
                        Simple ordering
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-slate-500">
                        Everything is handled from one place.
                      </p>

                    </div>

                  </div>

                </div>

                <Feature
                  icon="⚡"
                  title="Fast processing"
                  description="Orders are sent directly through your connected service system."
                />

                <Feature
                  icon="◈"
                  title="Transparent pricing"
                  description="See the service rate, quantity and estimated charge before ordering."
                />

                <Feature
                  icon="↗"
                  title="Track orders"
                  description="Open your order history anytime to check previous orders."
                />

              </aside>

            </div>

          </section>

          {/* ================= QUICK LINKS ================= */}

          <section className="mt-7 grid gap-4 sm:grid-cols-3">

            <a
              href="/services"
              className="group rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  ◇
                </div>

                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-500">
                  →
                </span>

              </div>

              <p className="mt-4 text-sm font-black text-slate-800">
                Browse Services
              </p>

              <p className="mt-1 text-[10px] font-medium leading-5 text-slate-500">
                Explore all available social growth services.
              </p>

            </a>

            <a
              href="/orders"
              className="group rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  #
                </div>

                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500">
                  →
                </span>

              </div>

              <p className="mt-4 text-sm font-black text-slate-800">
                Order History
              </p>

              <p className="mt-1 text-[10px] font-medium leading-5 text-slate-500">
                Review your previous orders and their status.
              </p>

            </a>

            <a
              href="/funds"
              className="group rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  ₹
                </div>

                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                  →
                </span>

              </div>

              <p className="mt-4 text-sm font-black text-slate-800">
                Add Funds
              </p>

              <p className="mt-1 text-[10px] font-medium leading-5 text-slate-500">
                Add balance whenever you need to place more orders.
              </p>

            </a>

          </section>

          {/* ================= FOOTER ================= */}

          <footer className="mt-10 border-t border-slate-200 py-6">

            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">

              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                DreamSMM
              </p>

              <p className="text-[9px] font-medium text-slate-400">
                Your social growth command center
              </p>

            </div>

          </footer>

        </div>
      </div>
    </main>
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