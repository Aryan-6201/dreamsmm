import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const platforms = [...new Set(services.map((service) => service.platform))];

  return (
    <main className="min-h-screen bg-[#070a11] text-white">
      <Sidebar />

      <div className="min-h-screen lg:ml-[250px]">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

          {/* Header */}
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#635bff]/20 bg-[#635bff]/10 px-3 py-1.5 text-xs font-medium text-[#9b94ff]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8b7cff] shadow-[0_0_8px_#8b7cff]" />
                Service Marketplace
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Explore Services
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Choose from our available social media services and start
                growing your account.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-xl border border-white/[0.07] bg-[#0c1019] px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                  Services
                </p>
                <p className="mt-1 text-lg font-bold">
                  {services.length}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-[#0c1019] px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                  Platforms
                </p>
                <p className="mt-1 text-lg font-bold">
                  {platforms.length}
                </p>
              </div>
            </div>
          </div>

          {/* Platform filters - visual for now */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
            <button className="shrink-0 rounded-xl bg-[#635bff] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#635bff]/20">
              All Services
            </button>

            {platforms.map((platform) => (
              <button
                key={platform}
                className="shrink-0 rounded-xl border border-white/[0.07] bg-[#0c1019] px-4 py-2.5 text-xs font-medium text-gray-500 transition hover:border-white/[0.12] hover:text-gray-200"
              >
                {platform}
              </button>
            ))}
          </div>

          {/* Services */}
          {services.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-[#0c1019] p-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-xl text-gray-500">
                ◈
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No services available
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                Services will appear here once they are added and enabled.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#635bff]/25 hover:bg-[#0e121c]"
                >
                  {/* Glow */}
                  <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#635bff]/10 opacity-0 blur-3xl transition group-hover:opacity-100" />

                  {/* Service header */}
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#635bff]/15 to-[#925cf6]/10 text-[#9b94ff]">
                        ◈
                      </div>

                      <div>
                        <h2 className="font-semibold text-white">
                          {service.name}
                        </h2>

                        <p className="mt-1 text-xs font-medium text-[#8b7cff]">
                          {service.platform}
                        </p>
                      </div>
                    </div>

                    <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/10 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </div>

                  {/* Description */}
                  <div className="relative mt-5 min-h-[42px]">
                    <p className="text-sm leading-5 text-gray-500">
                      {service.description ||
                        "High-quality social media service with fast processing."}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="relative mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/[0.05] bg-black/20 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-600">
                        Rate / 1K
                      </p>

                      <p className="mt-1.5 font-semibold text-white">
                        ₹{service.rate.toString()}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.05] bg-black/20 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-600">
                        Range
                      </p>

                      <p className="mt-1.5 font-semibold text-white">
                        {service.min.toLocaleString()} –{" "}
                        {service.max.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Order */}
                  <a
                    href="/dashboard"
                    className="relative mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#635bff] to-[#8b5cf6] text-sm font-semibold text-white shadow-lg shadow-[#635bff]/10 transition-all hover:-translate-y-0.5 hover:shadow-[#635bff]/20"
                  >
                    Order Now
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </article>
              ))}
            </div>
          )}

          {/* Bottom info */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                ✓
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Reliable Services
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Services are monitored and managed through your panel.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                ⚡
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Fast Processing
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Place orders directly from your DreamSMM account.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                ?
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Need Help?
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Contact support if you need help with an order.
              </p>

              <a
                href="/tickets"
                className="mt-3 inline-block text-xs font-semibold text-[#8b7cff] hover:text-[#aaa3ff]"
              >
                Contact Support →
              </a>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
