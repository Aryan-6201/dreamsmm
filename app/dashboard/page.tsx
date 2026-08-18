import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Bell,
  Clipboard,
  Headphones,
  LogOut,
  Plus,
  ShoppingBag,
  Sparkles,
  UserRound,
  Wallet,
  Zap,
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

  const firstName =
    user.name?.trim().split(" ")[0] || "there";

  const initials = (
    user.name?.trim() ||
    user.email ||
    "US"
  )
    .slice(0, 2)
    .toUpperCase();

  const balance = user.balance.toString();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#06040b] text-[#f8f7ff]">
      <Sidebar />

      <div className="lg:ml-[250px]">
        {/* Aqua top strip */}
        <div className="h-2 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#7c3aed]" />

        <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
          {/* TOP BAR */}
          <header className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-400">
                DreamSMM
              </p>
              <h1 className="mt-1 text-xl font-black tracking-tight text-[#f8f7ff] sm:text-2xl">
                New Order
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <a
                href="/funds"
                className="hidden h-10 items-center gap-2 rounded-xl bg-[#100b1a] px-3.5 text-sm font-black text-[#f8f7ff] shadow-sm ring-1 ring-[#251b35] transition hover:-translate-y-0.5 hover:ring-violet-400 sm:inline-flex"
              >
                <Wallet className="h-4 w-4 text-[#a855f7]" />
                <span>₹{balance}</span>
              </a>

              <a
                href="/funds"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#7c3aed] px-3.5 text-sm font-black text-white shadow-lg shadow-violet-900/30 transition hover:-translate-y-0.5 hover:bg-[#a855f7]"
              >
                <Plus className="h-4 w-4" />
                Add Funds
              </a>

              <div className="hidden h-10 items-center gap-2 rounded-xl bg-[#100b1a] px-2.5 shadow-sm ring-1 ring-[#251b35] sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-[9px] font-black text-white">
                  {initials}
                </div>
                <div className="max-w-[130px]">
                  <p className="truncate text-[11px] font-black text-[#f8f7ff]">
                    {user.name || "User"}
                  </p>
                  <p className="truncate text-[9px] font-medium text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* STATS */}
          <section className="mt-5 grid gap-4 md:grid-cols-3">
            <DashboardStat
              icon={<UserRound className="h-5 w-5" />}
              value={user.name || "User"}
              label="Welcome to panel"
              tone="blue"
            />

            <DashboardStat
              icon={<ShoppingBag className="h-5 w-5" />}
              value={orderCount.toLocaleString()}
              label="Panel orders"
              tone="cyan"
            />

            <DashboardStat
              icon={<Wallet className="h-5 w-5" />}
              value={`₹${balance}`}
              label="Account balance"
              tone="teal"
            />
          </section>

          {/* MAIN WORKSPACE */}
          <section
            id="new-order"
            className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
          >
            {/* ORDER FORM */}
            <div className="overflow-visible rounded-[22px] border border-[#251b35] bg-[#100b1a] shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
              <div className="border-b border-[#251b35] px-5 py-6 sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#241044] text-[#c084fc]">
                      <ShoppingBag className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-[#f8f7ff]">
                          Create New Order
                        </h2>
                        <span className="rounded-full bg-emerald-950/40 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-300">
                          Live
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-slate-400">
                        Search, select and configure your service.
                      </p>
                    </div>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Catalog
                    </p>
                    <p className="mt-1 text-sm font-black text-[#e9e5f2]">
                      {services.length} services
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-7">
                <OrderForm services={formattedServices} />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <aside className="space-y-4">
              <div className="rounded-[20px] border border-[#251b35] bg-[#100b1a] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Quick access
                    </p>
                    <h3 className="mt-1 text-base font-black text-[#f8f7ff]">
                      Manage account
                    </h3>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#241044] text-[#c084fc]">
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
                    icon={<Clipboard className="h-4 w-4" />}
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

              <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#241044] via-[#7c3aed] to-[#151022] p-5 text-white shadow-[0_18px_45px_rgba(76,29,149,0.28)]">
                <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[#100b1a]/20 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">
                      Wallet
                    </span>
                    <Wallet className="h-5 w-5 text-white/80" />
                  </div>

                  <p className="mt-5 text-xs font-medium text-white/70">
                    Available balance
                  </p>

                  <p className="mt-1 text-3xl font-black tracking-tight">
                    ₹{balance}
                  </p>

                  <a
                    href="/funds"
                    className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#100b1a] text-sm font-black text-[#c084fc] transition hover:bg-[#241044]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Funds
                  </a>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#251b35] bg-[#100b1a] p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#241044] text-[#c084fc]">
                    <Headphones className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#f8f7ff]">
                      Need assistance?
                    </h3>
                    <p className="mt-1 text-xs font-medium leading-5 text-[#a7a0b5]">
                      Need help with an order or account? Create a support ticket.
                    </p>
                  </div>
                </div>

                <a
                  href="/tickets"
                  className="mt-4 flex h-10 items-center justify-center rounded-xl border border-[#251b35] bg-[#151022] text-xs font-black text-[#e9e5f2] transition hover:border-violet-200 hover:bg-[#241044] hover:text-[#c084fc]"
                >
                  Create Ticket
                </a>
              </div>
            </aside>
          </section>

          <footer className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-[#251b35] py-5 text-[10px] font-medium text-slate-400 sm:flex-row">
            <p>© {new Date().getFullYear()} DreamSMM</p>

            <div className="flex items-center gap-4">
              <a href="/services" className="hover:text-[#a855f7]">
                Services
              </a>
              <a href="/orders" className="hover:text-[#a855f7]">
                Orders
              </a>
              <a href="/tickets" className="hover:text-[#a855f7]">
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

function DashboardStat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: "blue" | "cyan" | "teal";
}) {
  const toneClass =
    tone === "blue"
      ? "bg-[#241044] text-[#c084fc]"
      : tone === "cyan"
        ? "bg-[#241044] text-[#c084fc]"
        : "bg-[#241044] text-[#c084fc]";

  return (
    <div className="rounded-[24px] border border-[#251b35] bg-[#100b1a] p-6 shadow-[0_14px_40px_rgba(91,33,182,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(91,33,182,0.11)] sm:p-7">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
            tone === "blue"
              ? "bg-[#241044] text-[#c084fc]"
              : tone === "cyan"
                ? "bg-[#241044] text-[#c084fc]"
                : "bg-[#241044] text-[#c084fc]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-2xl font-black tracking-tight text-[#f8f7ff] sm:text-[28px]">{value}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

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
      className="group flex items-center gap-3 rounded-xl border border-[#251b35] bg-[#151022] p-3 transition hover:border-[#251b35] hover:bg-[#241044]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#241044] text-[#c084fc] shadow-sm">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-[#f8f7ff]">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400">
          {description}
        </p>
      </div>

      <span className="text-[#6f6680] transition group-hover:translate-x-0.5 group-hover:text-[#a855f7]">
        →
      </span>
    </a>
  );
}