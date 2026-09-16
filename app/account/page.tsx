import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Mail,
  ShieldCheck,
  UserRound,
  Wallet,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) redirect("/login");

  const session = await verifySession(token);

  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      balance: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  const [orderCount, transactionCount, totalSpentResult, pendingOrderCount] =
    await Promise.all([
      prisma.order.count({ where: { userId: session.userId } }),
      prisma.transaction.count({ where: { userId: session.userId } }),
      prisma.order.aggregate({
        where: { userId: session.userId },
        _sum: { charge: true },
      }),
      prisma.order.count({
        where: {
          userId: session.userId,
          status: { in: ["PENDING", "PROCESSING"] },
        },
      }),
    ]);

  const name = user.name?.trim() || "User";
  const initial = name.charAt(0).toUpperCase();
  const balance = user.balance.toString();
  const totalSpent = totalSpentResult._sum.charge?.toString() ?? "0";

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#fbfaff] text-slate-900">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#fbfaff]" />
        <div className="absolute -left-20 -top-24 h-[430px] w-[430px] rounded-full bg-violet-200/25 blur-[95px]" />
        <div className="absolute right-0 top-[12%] h-[380px] w-[380px] rounded-full bg-fuchsia-200/20 blur-[95px]" />
        <div className="absolute bottom-0 left-[35%] h-[320px] w-[420px] rounded-full bg-indigo-100/30 blur-[100px]" />
      </div>

      <Sidebar />

      <div className="relative z-10 box-border w-full min-w-0 overflow-x-hidden lg:ml-[260px] lg:w-[calc(100%-260px)]">
        <div className="h-[3px] bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500" />

        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.24em] text-violet-600">
                Account Center
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-[-.045em] text-slate-950 sm:text-4xl">
                My Account
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Manage your profile and view your DreamSMM activity.
              </p>
            </div>

            <a
              href="/funds"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-black text-white shadow-[0_10px_28px_rgba(109,40,217,.20)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(109,40,217,.26)]"
            >
              <Wallet className="h-4 w-4" />
              Add Funds
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <section className="mt-6 overflow-hidden rounded-[30px] border border-white bg-white/85 shadow-[0_22px_70px_rgba(76,29,149,.09)] backdrop-blur-xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-600 to-fuchsia-500 p-6 text-white sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/15 blur-[70px]" />
              <div className="pointer-events-none absolute -bottom-28 left-1/3 h-52 w-72 rounded-full bg-violet-300/20 blur-[75px]" />
              <div className="pointer-events-none absolute right-8 top-8 h-32 w-32 rounded-full border border-white/10" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-white/20 bg-white/15 text-3xl font-black shadow-lg backdrop-blur-xl">
                  {initial}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-2xl font-black tracking-[-.035em]">
                      {name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/30 bg-emerald-400/15 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-100">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-white/70">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-lg sm:min-w-[190px]">
                  <p className="text-[8px] font-black uppercase tracking-[.2em] text-white/55">
                    Available Balance
                  </p>
                  <p className="mt-1 text-2xl font-black tracking-tight">
                    ₹{balance}
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-white/55">
                    Ready to use
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
              <AccountStat
                icon={<ShoppingBag className="h-5 w-5" />}
                label="Total Orders"
                value={orderCount.toLocaleString()}
                tone="violet"
              />
              <AccountStat
                icon={<BarChart3 className="h-5 w-5" />}
                label="Transactions"
                value={transactionCount.toLocaleString()}
                tone="indigo"
              />
              <AccountStat
                icon={<CalendarDays className="h-5 w-5" />}
                label="Member Since"
                value={user.createdAt.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                tone="fuchsia"
              />
              <AccountStat
                icon={<ShoppingBag className="h-5 w-5" />}
                label="Pending Orders"
                value={pendingOrderCount.toLocaleString()}
                tone="violet"
              />
            </div>
          </section>

          <section className="mt-5 grid gap-5 md:grid-cols-3">
            <MiniPanel
              icon={<Wallet className="h-5 w-5" />}
              title="Total Spent"
              value={`₹${totalSpent}`}
              text="Your lifetime order value"
            />
            <MiniPanel
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Order Activity"
              value={`${orderCount} orders`}
              text={`${pendingOrderCount} currently pending`}
            />
            <MiniPanel
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Account Security"
              value="Protected"
              text="Session authentication enabled"
            />
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_18px_55px_rgba(76,29,149,.07)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 ring-1 ring-violet-100">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[.2em] text-violet-500">
                    Profile
                  </p>
                  <h3 className="mt-0.5 text-lg font-black text-slate-950">
                    Account Information
                  </h3>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoRow icon={<UserRound className="h-4 w-4" />} label="Name" value={name} />
                <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
                <InfoRow icon={<Wallet className="h-4 w-4" />} label="Balance" value={`₹${balance}`} />
                <InfoRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Joined"
                  value={user.createdAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_18px_55px_rgba(76,29,149,.07)] backdrop-blur-xl sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-violet-50 text-emerald-600 ring-1 ring-emerald-100">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-950">
                Account Status
              </h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                Your account is active and ready for ordering. Keep your login
                details private and contact support if you notice anything unusual.
              </p>

              <a
                href="/tickets"
                className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >
                Contact Support
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>

          <section className="mt-5 rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_18px_55px_rgba(76,29,149,.07)] backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[.2em] text-violet-500">
                  Shortcuts
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-950">
                  Account Actions
                </h3>
              </div>
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ActionButton href="/orders" title="My Orders" text="View order history" />
              <ActionButton href="/transactions" title="Transactions" text="Check wallet activity" />
              <ActionButton href="/tickets" title="Support" text="Contact support team" />
            </div>
          </section>

          <section className="mt-5 rounded-[26px] border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_14px_45px_rgba(76,29,149,.05)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-900">DreamSMM Premium Workspace</p>
                <p className="mt-1 text-[10px] font-medium text-slate-500">
                  Browse services, place orders, manage your balance and get support from one place.
                </p>
              </div>
              <a
                href="/services"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-[10px] font-black text-white transition hover:bg-violet-700"
              >
                Browse Services
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>

          <footer className="mt-6 flex items-center justify-center gap-3 pb-5 text-[8px] font-black uppercase tracking-[.25em] text-slate-300">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-violet-200" />
            DreamSMM
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-fuchsia-200" />
          </footer>
        </div>
      </div>
    </main>
  );
}

function MiniPanel({
  icon,
  title,
  value,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="group rounded-[24px] border border-white bg-white/85 p-5 shadow-[0_14px_45px_rgba(76,29,149,.06)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(76,29,149,.10)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
          {icon}
        </div>
        <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">
          {title}
        </p>
      </div>
      <p className="mt-4 text-xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-[10px] font-medium text-slate-400">{text}</p>
    </div>
  );
}

function ActionButton({
  href,
  title,
  text,
}: {
  href: string;
  title: string;
  text: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:border-violet-100 hover:bg-violet-50"
    >
      <div className="min-w-0">
        <p className="text-xs font-black text-slate-800 group-hover:text-violet-700">{title}</p>
        <p className="mt-1 text-[9px] font-medium text-slate-400">{text}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
    </a>
  );
}

function AccountStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "violet" | "indigo" | "fuchsia";
}) {
  const classes =
    tone === "violet"
      ? "from-violet-100 to-purple-50 text-violet-700 ring-violet-100"
      : tone === "indigo"
        ? "from-indigo-100 to-blue-50 text-indigo-700 ring-indigo-100"
        : "from-fuchsia-100 to-violet-50 text-fuchsia-700 ring-fuchsia-100";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${classes} ring-1`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-black text-slate-950">{value}</p>
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
