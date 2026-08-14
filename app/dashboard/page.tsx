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

  const firstName =
    user.name?.split(" ")[0] || "there";

  const initials = (
    user.name || user.email
  )
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <Sidebar />

      <div className="lg:ml-[250px]">
        <div className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6 lg:px-10">

          {/* TOP NAV */}
          <header className="flex items-center justify-between py-2">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Dashboard
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Your growth workspace
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">

              <a
                href="/funds"
                className="group flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                <span className="hidden sm:inline">
                  Add Funds
                </span>
              </a>

              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 shadow-sm">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-black text-white">
                  {initials}
                </div>

                <div className="hidden max-w-[140px] sm:block">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {user.name || "User"}
                  </p>

                  <p className="truncate text-[10px] text-slate-400">
                    {user.email}
                  </p>
                </div>

              </div>
            </div>
          </header>

          {/* PREMIUM HERO */}
          <section className="relative mt-5 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">

            <div className="absolute right-[-100px] top-[-130px] h-[330px] w-[330px] rounded-full bg-violet-200/40 blur-[80px]" />

            <div className="absolute bottom-[-120px] left-[35%] h-[280px] w-[280px] rounded-full bg-indigo-100/60 blur-[80px]" />

            <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">

              <div className="flex flex-wrap items-center gap-2">

                <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  All systems operational
                </span>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                  {services.length} services available
                </span>

              </div>

              <div className="mt-7 max-w-4xl">

                <p className="text-sm font-bold text-violet-600">
                  Welcome back, {firstName}
                </p>

                <h1 className="mt-2 text-4xl font-black leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                  Grow your social presence
                  <span className="block bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    without the busywork.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
                  Browse premium social media services, configure
                  your order and launch your campaign from one
                  simple workspace.
                </p>

              </div>

              <div className="mt-8 flex flex-wrap gap-3">

                <a
                  href="#order"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  Start an Order
                  <span className="text-base">
                    →
                  </span>
                </a>

                <a
                  href="/services"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
                >
                  Browse Services
                </a>

              </div>

            </div>
          </section>

          {/* STATS */}
          <section className="mt-5 grid gap-4 sm:grid-cols-2">

            <StatCard
              label="Available Balance"
              value={`₹${user.balance.toString()}`}
              caption="Ready for your next order"
              icon="₹"
              variant="violet"
            />

            <StatCard
              label="Active Services"
              value={String(services.length)}
              caption="Services currently available"
              icon="✦"
              variant="blue"
            />

          </section>

          {/* MAIN WORKSPACE */}
          <section
            id="order"
            className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]"
          >

            {/* ORDER BUILDER */}
            <div className="overflow-visible rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">

              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-xl font-black text-white shadow-lg shadow-violet-200">
                      +
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                          Create New Order
                        </h2>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                          Live
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Select a service and configure your campaign.
                      </p>
                    </div>

                  </div>

                  <div className="hidden text-right sm:block">

                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Catalog
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-700">
                      {services.length} services
                    </p>

                  </div>

                </div>
              </div>

              <div className="p-5 sm:p-7">
                <OrderForm services={formattedServices} />
              </div>

            </div>

            {/* SIDE PANEL */}
            <aside className="space-y-4">

              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Quick access
                </p>

                <h3 className="mt-2 text-lg font-black text-slate-900">
                  Everything you need
                </h3>

                <div className="mt-5 space-y-2">

                  <QuickLink
                    href="/services"
                    icon="✦"
                    title="Browse Services"
                    description="Explore the full catalog"
                  />

                  <QuickLink
                    href="/orders"
                    icon="▣"
                    title="My Orders"
                    description="Track your campaigns"
                  />

                  <QuickLink
                    href="/tickets"
                    icon="?"
                    title="Support"
                    description="Get help when you need it"
                  />

                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-xl shadow-violet-200">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg">
                  ⚡
                </div>

                <h3 className="mt-5 text-xl font-black">
                  Ready to grow?
                </h3>

                <p className="mt-2 text-sm leading-6 text-violet-100">
                  Choose a service, enter your target and let
                  DreamSMM handle the rest.
                </p>

                <a
                  href="#order"
                  className="mt-5 flex h-11 items-center justify-center rounded-xl bg-white text-sm font-black text-violet-700 transition hover:bg-violet-50"
                >
                  Create Order →
                </a>

              </div>

            </aside>
          </section>

          {/* FEATURES */}
          <section className="mt-5 grid gap-4 md:grid-cols-3">

            <Feature
              icon="✓"
              title="Secure"
              description="Protected account and order flow."
            />

            <Feature
              icon="⚡"
              title="Fast"
              description="Fast processing across supported services."
            />

            <Feature
              icon="✦"
              title="Large Catalog"
              description={`${services.length} active services available.`}
            />

          </section>

          {/* FOOTER */}
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

function StatCard({
  label,
  value,
  caption,
  icon,
  variant,
}: {
  label: string;
  value: string;
  caption: string;
  icon: string;
  variant: "violet" | "blue";
}) {
  const iconStyle =
    variant === "violet"
      ? "bg-violet-50 text-violet-700"
      : "bg-blue-50 text-blue-700";

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-500">
            {caption}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-base font-black ${iconStyle}`}
        >
          {icon}
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
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-violet-100 hover:bg-violet-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-black text-violet-700 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-slate-400">
          {description}
        </p>
      </div>

      <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-600">
        →
      </span>
    </a>
  );
}

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
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-700">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-800">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

      </div>
    </div>
  );
}