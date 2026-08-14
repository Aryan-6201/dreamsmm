import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: {
      enabled: true,
    },
    orderBy: [
      {
        platform: "asc",
      },
      {
        category: "asc",
      },
      {
        id: "asc",
      },
    ],
  });

  /*
   * Remove duplicate services.
   *
   * Two records are treated as duplicates when they have the same:
   * platform + category + name.
   */
  const uniqueServices = Array.from(
    new Map(
      services.map((service) => {
        const key = [
          normalize(service.platform),
          normalize(service.category),
          normalize(service.name),
        ].join("|");

        return [key, service];
      })
    ).values()
  );

  /*
   * Group services by platform.
   */
  const platformGroups = new Map<
    string,
    {
      label: string;
      categories: Map<
        string,
        {
          label: string;
          services: typeof uniqueServices;
        }
      >;
    }
  >();

  for (const service of uniqueServices) {
    const platformKey = normalize(service.platform) || "other";
    const platformLabel = service.platform?.trim()
      ? service.platform.trim()
      : "Other";

    if (!platformGroups.has(platformKey)) {
      platformGroups.set(platformKey, {
        label: platformLabel,
        categories: new Map(),
      });
    }

    const platformGroup = platformGroups.get(platformKey)!;

    const categoryKey =
      normalize(service.category) || "general";

    const categoryLabel = service.category?.trim()
      ? service.category.trim()
      : "General";

    if (!platformGroup.categories.has(categoryKey)) {
      platformGroup.categories.set(categoryKey, {
        label: categoryLabel,
        services: [],
      });
    }

    platformGroup.categories
      .get(categoryKey)!
      .services.push(service);
  }

  const platforms = Array.from(platformGroups.values());

  return (
    <main className="min-h-screen bg-[#0b0f18] text-white">
      <Sidebar />

      <div className="min-h-screen lg:ml-[250px]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* Header */}
          <section className="rounded-3xl border border-white/[0.10] bg-[#111722] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3.5 py-2 text-xs font-semibold text-violet-200">
                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                  Service Marketplace
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Explore Services
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                  Choose from available social media services and place
                  your order directly from your DreamSMM account.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-[120px] rounded-2xl border border-white/[0.08] bg-[#171d29] px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Services
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {uniqueServices.length}
                  </p>
                </div>

                <div className="min-w-[120px] rounded-2xl border border-white/[0.08] bg-[#171d29] px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Platforms
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {platforms.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Platform navigation */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <a
              href="#all"
              className="shrink-0 rounded-xl border border-violet-400/20 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-200"
            >
              All Services
            </a>

            {platforms.map((platform) => (
              <a
                key={platform.label}
                href={`#platform-${normalize(platform.label).replace(/\s+/g, "-")}`}
                className="shrink-0 rounded-xl border border-white/[0.09] bg-[#111722] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/[0.16] hover:bg-[#171d29] hover:text-white"
              >
                {titleCase(platform.label)}
              </a>
            ))}
          </div>

          {/* Services */}
          {uniqueServices.length === 0 ? (
            <section
              id="all"
              className="mt-8 rounded-3xl border border-dashed border-white/[0.12] bg-[#111722] p-16 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl">
                ◈
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                No services available
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                Services will appear here once they are added and enabled.
              </p>
            </section>
          ) : (
            <div id="all" className="mt-8 space-y-12">
              {platforms.map((platform) => (
                <section
                  key={platform.label}
                  id={`platform-${normalize(platform.label).replace(/\s+/g, "-")}`}
                >
                  {/* Platform heading */}
                  <div className="mb-5 flex items-center gap-4">
                    <div className="h-10 w-1 rounded-full bg-violet-500" />

                    <div>
                      <h2 className="text-2xl font-bold text-white sm:text-3xl">
                        {titleCase(platform.label)}
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        {Array.from(platform.categories.values()).reduce(
                          (total, category) =>
                            total + category.services.length,
                          0
                        )}{" "}
                        services available
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {Array.from(platform.categories.values()).map(
                      (category) => (
                        <div key={category.label}>
                          {/* Category heading */}
                          <div className="mb-4 flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-100 sm:text-xl">
                              {titleCase(category.label)}
                            </h3>

                            <span className="rounded-full border border-white/[0.08] bg-[#171d29] px-2.5 py-1 text-xs font-medium text-gray-400">
                              {category.services.length}
                            </span>
                          </div>

                          {/* Service cards */}
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {category.services.map((service) => (
                              <article
                                key={service.id}
                                className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111722] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-[#151c28]"
                              >
                                {/* Header */}
                                <div className="relative flex items-start justify-between gap-4">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-300">
                                      ◈
                                    </div>

                                    <div className="min-w-0">
                                      <h4 className="truncate text-base font-bold text-white">
                                        {service.name}
                                      </h4>

                                      <p className="mt-1 text-sm font-medium text-violet-300">
                                        {service.platform}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Active
                                  </span>
                                </div>

                                {/* Description */}
                                <div className="mt-5 min-h-[48px]">
                                  <p className="text-sm leading-6 text-gray-400">
                                    {service.description ||
                                      "High-quality social media service with fast processing."}
                                  </p>
                                </div>

                                {/* Stats */}
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                  <div className="rounded-xl border border-white/[0.07] bg-[#171d29] p-3.5">
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                      Rate / 1K
                                    </p>

                                    <p className="mt-1.5 text-base font-bold text-white">
                                      ₹{service.rate.toString()}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-white/[0.07] bg-[#171d29] p-3.5">
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                      Range
                                    </p>

                                    <p className="mt-1.5 text-base font-bold text-white">
                                      {service.min.toLocaleString()} –{" "}
                                      {service.max.toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                {/* Order */}
                                <a
                                  href={`/dashboard?serviceId=${service.id}`}
                                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-sm font-bold text-white shadow-lg shadow-violet-500/10 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/20"
                                >
                                  Order Now
                                  <span className="transition-transform group-hover:translate-x-1">
                                    →
                                  </span>
                                </a>
                              </article>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Bottom info */}
          <section className="mt-12 grid gap-4 md:grid-cols-3">
            <InfoCard
              icon="✓"
              title="Reliable Services"
              description="Services are monitored and managed through your DreamSMM panel."
            />

            <InfoCard
              icon="⚡"
              title="Fast Processing"
              description="Place orders directly from your DreamSMM account."
            />

            <InfoCard
              icon="?"
              title="Need Help?"
              description="Contact support if you need help with an order."
              link="/tickets"
              linkText="Contact Support →"
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  description,
  link,
  linkText,
}: {
  icon: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[#111722] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-base font-bold text-violet-300">
        {icon}
      </div>

      <h3 className="mt-4 text-base font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-400">
        {description}
      </p>

      {link && linkText && (
        <a
          href={link}
          className="mt-4 inline-block text-sm font-semibold text-violet-300 transition hover:text-violet-200"
        >
          {linkText}
        </a>
      )}
    </div>
  );
}