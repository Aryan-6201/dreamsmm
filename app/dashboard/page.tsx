import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  UserRound,
  Wallet,
  Plus,
  BarChart3,
  Check,
  ClipboardList,
  Headphones,
  Sparkles,
  Zap,
  MessageCircle,
} from "lucide-react";

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

  const balance = user.balance.toString();

  const [services, orderCount] = await Promise.all([
    prisma.service.findMany({
      where: {
        enabled: true,
      },
      orderBy: {
        id: "asc",
      },
    }),

    prisma.order.count({
      where: {
        userId: session.userId,
      },
    }),
  ]);

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

  return (
    <main className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#fbfaff] text-slate-900 selection:bg-violet-200 selection:text-violet-900">

      {/* =========================================================
          LIGHTWEIGHT PREMIUM BACKGROUND
          Kept visually similar, but avoids multiple huge blur layers.
      ========================================================= */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#fbfaff]" />

        <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-violet-200/20 blur-[80px]" />

        <div className="absolute right-0 top-[10%] h-[360px] w-[360px] rounded-full bg-fuchsia-200/15 blur-[80px]" />

        <div
          className="absolute inset-0 opacity-[.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(91,33,182,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(91,33,182,.05) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      {/* =========================================================
          SIDEBAR
      ========================================================= */}

      <Sidebar />

      {/* =========================================================
          MAIN
      ========================================================= */}

      <div className="relative z-10 w-full min-w-0 max-w-full overflow-x-hidden box-border lg:ml-[260px] lg:w-[calc(100%-260px)]">

        {/* Luxury beam */}

        <div className="relative h-[3px] overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500">

          <div className="absolute inset-y-0 left-0 w-1/3 bg-white/70 blur-sm" />

        </div>

        <div className="mx-auto max-w-[1580px] px-4 py-4 sm:px-6 lg:px-8">

          

          {/* =====================================================
              STATUS BAR
          ===================================================== */}

          <div className="mt-3 flex items-center justify-between px-1">

            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[.20em] text-slate-400">

              <span className="relative flex h-1.5 w-1.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />

              </span>

              All systems operational

            </div>

            <div className="hidden items-center gap-2 sm:flex">

              <span className="rounded-full border border-white bg-white/60 px-3 py-1.5 text-[8px] font-bold text-slate-400 shadow-sm backdrop-blur-lg">
                {services.length} active services
              </span>

              <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[8px] font-black text-violet-600">
                Premium
              </span>

            </div>

          </div>

          {/* =====================================================
              STATS
          ===================================================== */}

          <section className="mt-4 grid gap-4 sm:grid-cols-3">

            <PremiumStat
              icon={<UserRound className="h-4 w-4" />}
              value={user.name || "User"}
              label="Account"
              tone="violet"
            />

            <PremiumStat
              icon={<BarChart3 className="h-4 w-4" />}
              value={orderCount.toLocaleString()}
              label="Total orders"
              tone="indigo"
            />

            <PremiumStat
              icon={<Wallet className="h-4 w-4" />}
              value={`₹${balance}`}
              label="Available balance"
              tone="fuchsia"
            />

          </section>

          {/* =====================================================
              MAIN WORKSPACE
          ===================================================== */}

          <section
            id="new-order"
            className="mt-4 grid w-full min-w-0 max-w-full items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,315px)]"
          >

            {/* ===================================================
                ORDER COMMAND CENTER
            =================================================== */}

            <section className="relative w-full min-w-0 max-w-full overflow-visible rounded-[34px] border border-white bg-white/[.82] shadow-[0_18px_55px_rgba(76,29,149,.07)] backdrop-blur-lg">

              <div className="pointer-events-none absolute -inset-px rounded-[34px] bg-gradient-to-br from-violet-200/35 via-transparent to-fuchsia-200/30" />

              {/* Top reflection */}

              <div className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />

              <div className="relative z-10 p-4 sm:p-6 lg:p-7">

                <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-2/3 -translate-x-1/2 rounded-full bg-violet-400/[.08] blur-[70px]" />

                <OrderForm services={formattedServices} />

              </div>

            </section>

            {/* ===================================================
                PREMIUM RIGHT RAIL
            =================================================== */}

            <aside className="space-y-4">

              {/* =================================================
                  WALLET
              ================================================= */}

              <div className="group relative overflow-hidden rounded-[31px] bg-gradient-to-br from-violet-700 via-indigo-600 to-fuchsia-500 p-5 text-white shadow-[0_20px_60px_rgba(109,40,217,.18)]">

                {/* Glow */}

                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/20 blur-[70px]" />

                <div className="pointer-events-none absolute -bottom-24 left-[-30px] h-48 w-48 rounded-full bg-indigo-300/20 blur-[70px]" />

                {/* Rings */}

                <div className="pointer-events-none absolute right-[-55px] top-[-55px] h-52 w-52 rounded-full border border-white/[.12]" />

                <div className="pointer-events-none absolute right-[-78px] top-[-78px] h-64 w-64 rounded-full border border-white/[.08]" />

                {/* Shine */}

                <div className="pointer-events-none absolute -left-24 top-0 h-24 w-80 rotate-[-18deg] bg-white/[.10] blur-2xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-[.20em] text-white/80 backdrop-blur-lg">

                      <span className="h-1 w-1 rounded-full bg-white shadow-[0_0_8px_white]" />

                      Wallet

                    </span>

                    <Wallet className="h-5 w-5 text-white/80" />

                  </div>

                  <p className="mt-5 text-[9px] font-black uppercase tracking-[.18em] text-white/55">
                    Available balance
                  </p>

                  <p className="mt-1 text-3xl font-black tracking-[-.045em]">
                    ₹{balance}
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.9)]" />

                    <span className="text-[9px] font-bold text-white/55">
                      Ready to use
                    </span>

                  </div>

                  <a
                    href="/funds"
                    className="group/wallet mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-xs font-black text-violet-700 shadow-[0_10px_30px_rgba(255,255,255,.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-violet-50"
                  >

                    <Plus className="h-4 w-4 transition duration-300 group-hover/wallet:rotate-90" />

                    Add Funds

                    <ArrowRight className="h-3.5 w-3.5 transition duration-300 group-hover/wallet:translate-x-1" />

                  </a>

                </div>

              </div>

              {/* =================================================
                  QUICK ACTIONS
              ================================================= */}

              <div className="group rounded-[30px] border border-white bg-white/[.72] p-5 shadow-[0_16px_48px_rgba(76,29,149,.06)] backdrop-blur-lg transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(76,29,149,.12)]">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[7px] font-black uppercase tracking-[.22em] text-violet-500">
                      Control center
                    </p>

                    <h3 className="mt-1 text-base font-black text-slate-950">
                      Quick Actions
                    </h3>

                  </div>

                  <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 ring-1 ring-violet-100">

                    <Sparkles className="h-4 w-4" />

                  </div>

                </div>

                <div className="mt-4 space-y-2">

                  <QuickLink
                    href="/services"
                    icon={<Zap className="h-4 w-4" />}
                    title="Browse Services"
                    description="Explore available services"
                  />

                  <QuickLink
                    href="/orders"
                    icon={<ClipboardList className="h-4 w-4" />}
                    title="Order History"
                    description="Track your orders"
                  />

                  <QuickLink
                    href="/tickets"
                    icon={<Headphones className="h-4 w-4" />}
                    title="Support Tickets"
                    description="Get help when needed"
                  />

                </div>

              </div>

              {/* =================================================
                  SUPPORT
              ================================================= */}

              <div className="group relative overflow-hidden rounded-[29px] border border-white bg-white/[.65] p-5 shadow-[0_22px_70px_rgba(76,29,149,.065)] backdrop-blur-lg">

                <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-violet-300/20 blur-[55px]" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 ring-1 ring-violet-100">

                      <Headphones className="h-4 w-4" />

                    </div>

                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-emerald-600">
                      Online
                    </span>

                  </div>

                  <h3 className="mt-4 text-sm font-black text-slate-950">
                    Need assistance?
                  </h3>

                  <p className="mt-1 text-[10px] font-medium leading-5 text-slate-500">
                    Need help with an order or account? Create a support ticket.
                  </p>

                  <a
                    href="/tickets"
                    className="group/support mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                  >

                    Create Ticket

                    <ArrowUpRight className="h-3.5 w-3.5 transition group-hover/support:-translate-y-0.5 group-hover/support:translate-x-0.5" />

                  </a>

                </div>

              </div>

            </aside>

          </section>

          {/* =====================================================
              TRUST STRIP
          ===================================================== */}

          <section className="mt-4 grid gap-3 sm:grid-cols-3">

            <TrustItem
              icon={<Zap className="h-4 w-4" />}
              title="Fast ordering"
              text="Quick service selection"
            />

            <TrustItem
              icon={<Check className="h-4 w-4" />}
              title="Live catalog"
              text={`${services.length} active services`}
            />

            <TrustItem
              icon={<Headphones className="h-4 w-4" />}
              title="Support ready"
              text="Help whenever needed"
            />

          </section>

          {/* =====================================================
              FOOTER BRAND
          ===================================================== */}

          <div className="mt-7 flex items-center justify-center gap-3 text-[8px] font-black uppercase tracking-[.25em] text-slate-300">

            <span className="h-px w-14 bg-gradient-to-r from-transparent to-violet-200" />

            DreamSMM

            <span className="h-px w-14 bg-gradient-to-l from-transparent to-fuchsia-200" />

          </div>

          <footer className="mt-3 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white bg-white/[.45] px-4 py-4 text-[9px] font-medium text-slate-400 shadow-[0_10px_35px_rgba(76,29,149,.035)] backdrop-blur-lg sm:flex-row">

            <p>
              © {new Date().getFullYear()} DreamSMM
            </p>

            <div className="flex items-center gap-4">

              <a
                href="/services"
                className="transition hover:text-violet-600"
              >
                Services
              </a>

              <a
                href="/orders"
                className="transition hover:text-violet-600"
              >
                Orders
              </a>

              <a
                href="/tickets"
                className="transition hover:text-violet-600"
              >
                Support
              </a>

              <span className="flex items-center gap-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,.6)]" />

                Operational

              </span>

            </div>

          </footer>

        </div>

      </div>
      <a
        href="https://wa.me/918271782948"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition duration-300 hover:scale-110 hover:bg-green-600"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </main>
  );
}

/* =============================================================
   PREMIUM STAT
============================================================= */

function PremiumStat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: "violet" | "indigo" | "fuchsia";
}) {
  const toneClass =
    tone === "violet"
      ? "from-violet-100 to-purple-50 text-violet-700 ring-violet-100"
      : tone === "indigo"
        ? "from-indigo-100 to-blue-50 text-indigo-700 ring-indigo-100"
        : "from-fuchsia-100 to-violet-50 text-fuchsia-700 ring-fuchsia-100";

  return (
    <div className="group relative min-h-[104px] overflow-hidden rounded-[26px] border border-white bg-white/[.86] p-5 shadow-[0_18px_60px_rgba(76,29,149,.075)] backdrop-blur-lg transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(76,29,149,.13)] sm:min-h-[118px] sm:p-6">

      <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/80 to-transparent" />

      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-300/15 blur-3xl transition duration-500 group-hover:bg-fuchsia-300/20" />

      <div className="relative flex h-full items-center gap-4">

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClass} ring-1 shadow-sm transition duration-300 group-hover:scale-105 sm:h-16 sm:w-16`}
        >
          <span className="[&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-7 sm:[&>svg]:w-7">
            {icon}
          </span>
        </div>

        <div className="min-w-0 flex-1">

          <p className="truncate text-[25px] font-black leading-tight tracking-[-.04em] text-slate-950 sm:text-[30px]">
            {value}
          </p>

          <p className="mt-1.5 text-[10px] font-black uppercase tracking-[.17em] text-slate-500 sm:text-[11px]">
            {label}
          </p>

        </div>

      </div>

    </div>
  );
}

/* =============================================================
   QUICK LINK
============================================================= */

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-100/90 bg-white/[.60] p-3.5 shadow-[0_7px_22px_rgba(76,29,149,.035)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-100 hover:bg-violet-50/80 hover:shadow-[0_14px_35px_rgba(76,29,149,.09)]"
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600 shadow-sm ring-1 ring-violet-100 transition duration-300 group-hover:scale-105">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-xs font-black text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400">
          {description}
        </p>

      </div>

      <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600" />

    </a>
  );
}

/* =============================================================
   TRUST ITEM
============================================================= */

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative flex items-center gap-3 overflow-hidden rounded-[22px] border border-white bg-white/[.58] px-4 py-3.5 shadow-[0_12px_40px_rgba(76,29,149,.045)] backdrop-blur-lg transition duration-300 hover:-translate-y-0.5 hover:bg-white/[.78] hover:shadow-[0_18px_50px_rgba(76,29,149,.08)]">

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100 transition duration-300 group-hover:scale-105">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-black text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] font-medium text-slate-400">
          {text}
        </p>

      </div>

    </div>
  );
}