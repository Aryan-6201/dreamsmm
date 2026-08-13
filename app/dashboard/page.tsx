import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import OrderForm from "./OrderForm";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySession(token);

  if (!session) {
    redirect("/login");
  }

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

  if (!user) {
    redirect("/login");
  }

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

  const firstName = user.name?.split(" ")[0] || "there";
  const initials = (user.name || user.email)
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#02030a] text-white selection:bg-violet-400/30">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,.13),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(59,130,246,.10),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(124,58,237,.08),transparent_35%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:56px_56px]" />


      <Sidebar />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden lg:pl-[250px]">
        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-violet-600/[0.08] blur-[130px]" />
        <div className="absolute right-[-180px] top-[15%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.06] blur-[130px]" />
        <div className="absolute bottom-[-250px] left-[35%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.035] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative lg:ml-[250px]">

        <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-7 lg:px-10 lg:py-8">

          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <header className="flex items-center justify-between">

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                  System operational
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-600">
                Your workspace
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035] backdrop-blur-xl text-gray-500 transition hover:border-white/[0.20] hover:bg-white/[0.05] hover:text-white"
              >
                <span className="text-lg">♢</span>

                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-violet-400" />
              </button>

              <div className="flex items-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.035] backdrop-blur-xl px-2.5 py-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-[11px] font-black shadow-lg shadow-violet-500/20">
                  {initials}
                </div>

                <div className="hidden sm:block">
                  <p className="max-w-[140px] truncate text-xs font-bold text-gray-200">
                    {user.name || "User"}
                  </p>

                  <p className="max-w-[140px] truncate text-[9px] text-gray-600">
                    {user.email}
                  </p>
                </div>

              </div>

            </div>

          </header>

          {/* ====================================================== */}
          {/* HERO */}
          {/* ====================================================== */}

          <section className="relative mt-7 overflow-hidden rounded-[30px] border border-white/[0.11] bg-white/[0.045] backdrop-blur-3xl p-7 shadow-2xl shadow-black/30 sm:p-9 lg:p-11">

            <div className="absolute right-[-100px] top-[-160px] h-[450px] w-[450px] rounded-full bg-violet-600/[0.09] blur-[110px]" />

            <div className="absolute bottom-[-180px] left-[35%] h-[350px] w-[350px] rounded-full bg-indigo-500/[0.05] blur-[110px]" />

            <div className="absolute right-12 top-12 hidden h-40 w-40 rounded-full border border-white/[0.035] lg:block" />

            <div className="absolute right-24 top-24 hidden h-16 w-16 rounded-full border border-violet-400/[0.08] lg:block" />

            <div className="relative z-10">

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" />

                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                  Everything is running smoothly
                </span>
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-[62px] lg:leading-[1.02]">
                Welcome back,
                <br />

                <span className="bg-gradient-to-r from-white via-white to-violet-400 bg-clip-text text-transparent">
                  {firstName}.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-500 sm:text-[15px]">
                Your social media growth workspace is ready.
                Create orders, manage your balance and monitor everything
                from one powerful dashboard.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <a
                  href="#new-order"
                  className="group flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-xs font-black text-black shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-gray-100"
                >
                  Create New Order

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>

                <a
                  href="/funds"
                  className="flex h-12 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.045] backdrop-blur-2xl px-6 text-xs font-bold text-gray-300 transition hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
                >
                  <span className="text-violet-400">+</span>
                  Add Funds
                </a>

              </div>

            </div>
          </section>

          {/* ====================================================== */}
          {/* STATS */}
          {/* ====================================================== */}

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Balance */}
            <div className="group relative overflow-hidden rounded-2xl border border-violet-500/15 bg-gradient-to-br from-[#17152b] to-[#0a0c12] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30">

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/[0.08] blur-3xl transition group-hover:bg-violet-500/[0.15]" />

              <div className="relative">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">
                      Available Balance
                    </p>

                    <p className="mt-3 text-[28px] font-black tracking-tight">
                      ₹{user.balance.toString()}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-400/[0.08] text-violet-300">
                    ₹
                  </div>

                </div>

                <div className="mt-4 flex items-center gap-2">

                  <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-[8px] font-bold text-emerald-400">
                    AVAILABLE
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ready to use
                  </span>

                </div>

              </div>
            </div>

            {/* Services */}
            <div className="group rounded-2xl border border-white/[0.09] bg-white/[0.032] backdrop-blur-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[0.20]">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">
                    Services
                  </p>

                  <p className="mt-3 text-[28px] font-black">
                    {services.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/[0.07] text-blue-400">
                  ◈
                </div>

              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                <span className="text-[9px] text-gray-600">
                  Active services
                </span>
              </div>

            </div>

            {/* Account */}
            <div className="group rounded-2xl border border-white/[0.09] bg-white/[0.032] backdrop-blur-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[0.20]">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">
                    Account
                  </p>

                  <p className="mt-3 text-[28px] font-black">
                    Active
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/[0.07] text-emerald-400">
                  ✓
                </div>

              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]" />

                <span className="text-[9px] text-gray-600">
                  Account in good standing
                </span>
              </div>

            </div>

            {/* Wallet */}
            <a
              href="/funds"
              className="group rounded-2xl border border-white/[0.09] bg-white/[0.032] backdrop-blur-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-500/25"
            >

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">
                    Wallet
                  </p>

                  <p className="mt-3 text-[24px] font-black">
                    Add Funds
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/[0.08] text-xl text-violet-300">
                  +
                </div>

              </div>

              <p className="mt-4 text-[9px] text-gray-600 group-hover:text-gray-400">
                Deposit money into your wallet →
              </p>

            </a>

          </section>

          {/* ====================================================== */}
          {/* WORKSPACE */}
          {/* ====================================================== */}

          <section
            id="new-order"
            className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]"
          >

            {/* Order area */}
            <div className="overflow-hidden rounded-[26px] border border-white/[0.11] bg-white/[0.035] backdrop-blur-3xl">

              <div className="border-b border-white/[0.075] px-6 py-6 sm:px-7">

                <div className="flex items-center justify-between gap-5">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 text-xl text-violet-300">
                      +
                    </div>

                    <div>
                      <div className="flex items-center gap-2">

                        <h2 className="text-lg font-bold">
                          Create New Order
                        </h2>

                        <span className="rounded-md border border-emerald-400/10 bg-emerald-400/[0.06] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-emerald-400">
                          Live
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-gray-600">
                        Choose a service and configure your order.
                      </p>
                    </div>

                  </div>

                  <div className="hidden text-right sm:block">

                    <p className="text-[8px] uppercase tracking-[0.18em] text-gray-700">
                      Available
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-300">
                      {services.length} services
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-6 sm:p-7">
                <OrderForm services={formattedServices} />
              </div>

            </div>

            {/* Right side */}
            <aside className="space-y-5">

              {/* Quick Actions */}
              <div className="rounded-[26px] border border-white/[0.11] bg-white/[0.035] backdrop-blur-3xl p-5">

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">
                  Quick Actions
                </p>

                <h3 className="mt-1 text-base font-bold">
                  Manage your account
                </h3>

                <div className="mt-5 space-y-2">

                  <a
                    href="/services"
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-white/[0.12] hover:bg-white/[0.045]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/[0.08] text-blue-400">
                      ◈
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-semibold">
                        Browse Services
                      </p>

                      <p className="mt-1 text-[9px] text-gray-600">
                        Explore available services
                      </p>
                    </div>

                    <span className="text-gray-700 transition group-hover:translate-x-1 group-hover:text-gray-300">
                      →
                    </span>
                  </a>

                  <a
                    href="/orders"
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-white/[0.12] hover:bg-white/[0.045]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-400/[0.08] text-violet-400">
                      ▣
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-semibold">
                        My Orders
                      </p>

                      <p className="mt-1 text-[9px] text-gray-600">
                        Track your orders
                      </p>
                    </div>

                    <span className="text-gray-700 transition group-hover:translate-x-1 group-hover:text-gray-300">
                      →
                    </span>
                  </a>

                  <a
                    href="/funds"
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-white/[0.12] hover:bg-white/[0.045]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-emerald-400">
                      ₹
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-semibold">
                        Add Funds
                      </p>

                      <p className="mt-1 text-[9px] text-gray-600">
                        Increase your balance
                      </p>
                    </div>

                    <span className="text-gray-700 transition group-hover:translate-x-1 group-hover:text-gray-300">
                      →
                    </span>
                  </a>

                </div>
              </div>

              {/* Profile */}
              <div className="relative overflow-hidden rounded-[26px] border border-white/[0.11] bg-gradient-to-br from-[#111426] to-[#090c12] p-5">

                <div className="absolute right-[-50px] top-[-50px] h-40 w-40 rounded-full bg-violet-500/[0.08] blur-3xl" />

                <div className="relative">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-black shadow-lg shadow-violet-500/20">
                      {initials}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold">
                        {user.name || "User"}
                      </p>

                      <p className="truncate text-[9px] text-gray-600">
                        {user.email}
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 rounded-xl border border-white/[0.075] bg-black/20 p-4">

                    <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-gray-700">
                      Current Balance
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      ₹{user.balance.toString()}
                    </p>

                  </div>

                  <a
                    href="/funds"
                    className="mt-3 flex h-10 items-center justify-center rounded-xl bg-white text-xs font-bold text-black transition hover:bg-gray-200"
                  >
                    Manage Wallet
                  </a>

                </div>
              </div>

              {/* Support */}
              <div className="rounded-[26px] border border-white/[0.11] bg-white/[0.035] backdrop-blur-3xl p-5">

                <div className="flex gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/[0.08] text-blue-400">
                    ?
                  </div>

                  <div>
                    <h3 className="text-sm font-bold">
                      Need assistance?
                    </h3>

                    <p className="mt-1 text-[9px] leading-5 text-gray-600">
                      Get help with your account, payments or orders.
                    </p>
                  </div>

                </div>

                <a
                  href="/tickets"
                  className="mt-4 flex h-10 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035] backdrop-blur-xl text-xs font-semibold text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Open Support →
                </a>

              </div>

            </aside>

          </section>

          {/* ====================================================== */}
          {/* FEATURE STRIP */}
          {/* ====================================================== */}

          <section className="mt-5 grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl border border-white/[0.075] bg-white/[0.035] backdrop-blur-3xl p-5 transition hover:border-white/[0.12]">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/[0.07] text-emerald-400">
                  ✓
                </div>

                <div>
                  <h3 className="text-xs font-bold">
                    Secure Account
                  </h3>

                  <p className="mt-1 text-[9px] text-gray-600">
                    Your account stays protected.
                  </p>
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-white/[0.075] bg-white/[0.035] backdrop-blur-3xl p-5 transition hover:border-white/[0.12]">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/[0.07] text-violet-300">
                  ⚡
                </div>

                <div>
                  <h3 className="text-xs font-bold">
                    Fast Processing
                  </h3>

                  <p className="mt-1 text-[9px] text-gray-600">
                    Orders are processed efficiently.
                  </p>
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-white/[0.075] bg-white/[0.035] backdrop-blur-3xl p-5 transition hover:border-white/[0.12]">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/[0.07] text-blue-400">
                  ◉
                </div>

                <div>
                  <h3 className="text-xs font-bold">
                    {services.length}+ Services
                  </h3>

                  <p className="mt-1 text-[9px] text-gray-600">
                    Multiple services available.
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* ====================================================== */}
          {/* FOOTER */}
          {/* ====================================================== */}

          <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.05] py-6 text-[9px] text-gray-700 sm:flex-row">

            <p>
              © {new Date().getFullYear()} DreamSMM. All rights reserved.
            </p>

            <div className="flex items-center gap-5">

              <a
                href="/services"
                className="transition hover:text-gray-400"
              >
                Services
              </a>

              <a
                href="/tickets"
                className="transition hover:text-gray-400"
              >
                Support
              </a>

              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Systems operational
              </span>

            </div>

          </footer>

        </div>
      </div>
    </main>
  );
}