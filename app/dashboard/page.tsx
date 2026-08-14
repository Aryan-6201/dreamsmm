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
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      balance: true,
    },
  });

  if (!user) redirect("/login");

  const services = await prisma.service.findMany({
    where: { enabled: true },
    orderBy: { id: "asc" },
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
  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 text-gray-900 selection:bg-violet-200">
      <Sidebar />

      <div className="relative lg:ml-[250px]">
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">

          <header className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  System operational
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Your workspace</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-black text-white">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="max-w-[180px] truncate text-sm font-bold text-gray-900">
                    {user.name || "User"}
                  </p>
                  <p className="max-w-[180px] truncate text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section className="relative mt-6 overflow-hidden rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm sm:p-9 lg:p-11">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-100 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-50 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">
                  Everything is running smoothly
                </span>
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                Welcome back,
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  {firstName}.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
                Your social media growth workspace is ready. Create orders,
                manage your balance and monitor everything from one place.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#new-order"
                  className="flex h-12 items-center gap-2 rounded-xl bg-gray-900 px-6 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-800"
                >
                  Create New Order →
                </a>

                <a
                  href="/funds"
                  className="flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-bold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
                >
                  <span className="text-violet-600">+</span>
                  Add Funds
                </a>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Available Balance
              </p>
              <p className="mt-3 text-3xl font-black text-gray-950">
                ₹{user.balance.toString()}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  AVAILABLE
                </span>
                <span className="text-sm text-gray-500">Ready to use</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Services
              </p>
              <p className="mt-3 text-3xl font-black text-gray-950">
                {services.length}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Active services available
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Account
              </p>
              <p className="mt-3 text-3xl font-black text-gray-950">
                Active
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Account in good standing
              </p>
            </div>

            <a
              href="/funds"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Wallet
              </p>
              <p className="mt-3 text-2xl font-black text-gray-950">
                Add Funds
              </p>
              <p className="mt-4 text-sm font-medium text-violet-600">
                Deposit money into your wallet →
              </p>
            </a>
          </section>

          <section
            id="new-order"
            className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]"
          >
            <div className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-6 sm:px-7">
                <div className="flex items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-xl font-bold text-violet-600">
                      +
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-gray-900">
                          Create New Order
                        </h2>
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                          LIVE
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Choose a service and configure your order.
                      </p>
                    </div>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Available
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-700">
                      {services.length} services
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <OrderForm services={formattedServices} />
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Quick Actions
                </p>

                <h3 className="mt-1 text-lg font-black text-gray-900">
                  Manage your account
                </h3>

                <div className="mt-5 space-y-2">
                  <QuickLink
                    href="/services"
                    title="Browse Services"
                    description="Explore available services"
                    icon="◈"
                  />
                  <QuickLink
                    href="/orders"
                    title="My Orders"
                    description="Track your orders"
                    icon="▣"
                  />
                  <QuickLink
                    href="/funds"
                    title="Add Funds"
                    description="Increase your balance"
                    icon="₹"
                  />
                </div>
              </div>

              <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-600">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-gray-900">
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Current Balance
                  </p>
                  <p className="mt-2 text-2xl font-black text-gray-950">
                    ₹{user.balance.toString()}
                  </p>
                </div>

                <a
                  href="/funds"
                  className="mt-3 flex h-11 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white transition hover:bg-gray-800"
                >
                  Manage Wallet
                </a>
              </div>

              <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    ?
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Need assistance?
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Get help with your account, payments or orders.
                    </p>
                  </div>
                </div>

                <a
                  href="/tickets"
                  className="mt-4 flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Open Support →
                </a>
              </div>
            </aside>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-3">
            <Feature
              icon="✓"
              title="Secure Account"
              description="Your account stays protected."
            />
            <Feature
              icon="⚡"
              title="Fast Processing"
              description="Orders are processed efficiently."
            />
            <Feature
              icon="◉"
              title={`${services.length}+ Services`}
              description="Multiple services available."
            />
          </section>

          <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-200 py-6 text-sm text-gray-400 sm:flex-row">
            <p>© {new Date().getFullYear()} DreamSMM. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="/services" className="hover:text-gray-700">Services</a>
              <a href="/tickets" className="hover:text-gray-700">Support</a>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Systems operational
              </span>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-violet-200 hover:bg-violet-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-violet-600">
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
