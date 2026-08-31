
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  Headphones,
  Plus,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import OrderForm from "./OrderForm";

export default async function DashboardPage() {
  const token = (await cookies()).get("session")?.value;

  if (!token) redirect("/login");

  const session = await verifySession(token);

  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, balance: true },
  });

  if (!user) redirect("/login");

  const [services, orderCount] = await Promise.all([
    prisma.service.findMany({
      where: { enabled: true },
      orderBy: { id: "asc" },
    }),
    prisma.order.count({
      where: { userId: session.userId },
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

  const balance = user.balance.toString();

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-fuchsia-100/70 blur-3xl" />
      </div>

      <Sidebar />

      <div className="relative min-w-0 lg:ml-[260px]">
        <div className="h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500" />

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-800 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-9">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-violet-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  All systems operational
                </span>

                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  Welcome back, {user.name || "User"}.
                </h1>

                <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-violet-100">
                  Place a new order, manage your services, and track your
                  account in one place.
                </p>
              </div>

              <a
                href="/funds"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-violet-700 shadow-lg transition hover:bg-violet-50"
              >
                <Plus className="h-4 w-4" />
                Add funds
              </a>
            </div>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <Stat
              icon={<UserRound />}
              label="Account"
              value={user.name || "User"}
            />

            <Stat
              icon={<BarChart3 />}
              label="Total orders"
              value={orderCount.toLocaleString()}
            />

            <Stat
              icon={<Wallet />}
              label="Available balance"
              value={`₹${balance}`}
            />
          </section>

          <section
            id="new-order"
            className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
          >
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/5 sm:p-7">
              <OrderForm services={formattedServices} />
            </section>

            <aside className="space-y-4">
              <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-xl shadow-violet-300">
                <Wallet className="h-6 w-6 text-violet-200" />

                <p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-violet-200">
                  Available balance
                </p>

                <p className="mt-1 text-3xl font-black">₹{balance}</p>

                <a
                  href="/funds"
                  className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-violet-700 transition hover:bg-violet-50"
                >
                  <Plus className="h-4 w-4" />
                  Add funds
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-600">
                  Quick actions
                </p>

                <h2 className="mt-2 text-lg font-black">
                  Manage your account
                </h2>

                <div className="mt-4 space-y-2">
                  <Quick
                    href="/services"
                    icon={<Zap />}
                    title="Browse services"
                    text="Explore active services"
                  />

                  <Quick
                    href="/orders"
                    icon={<ClipboardList />}
                    title="Order history"
                    text="Track your orders"
                  />

                  <Quick
                    href="/tickets"
                    icon={<Headphones />}
                    title="Support tickets"
                    text="Get help when needed"
                  />
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-6 grid gap-3 md:grid-cols-3">
            <Trust
              icon={<Zap />}
              title="Fast ordering"
              text="Quick service selection"
            />

            <Trust
              icon={<Check />}
              title="Live catalog"
              text={`${services.length} active services`}
            />

            <Trust
              icon={<Headphones />}
              title="Support ready"
              text="Help whenever needed"
            />
          </section>

          <footer className="py-8 text-center text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} DreamSMM
          </footer>
        </div>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-950/5">
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="truncate text-xl font-black">{value}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function Quick({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-violet-200 hover:bg-violet-50"
    >
      <span className="text-violet-600">{icon}</span>

      <span className="min-w-0 flex-1">
        <b className="block text-xs">{title}</b>
        <small className="text-[10px] font-medium text-slate-400">
          {text}
        </small>
      </span>

      <ArrowRight className="h-4 w-4 text-slate-300" />
    </a>
  );
}

function Trust({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="text-violet-600">{icon}</span>

      <div>
        <b className="block text-xs">{title}</b>
        <p className="mt-1 text-[10px] font-medium text-slate-400">{text}</p>
      </div>
    </div>
  );
}