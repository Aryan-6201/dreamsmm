import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
export const dynamic = "force-dynamic";
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
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <Sidebar />

      <div className="min-h-screen lg:ml-[250px]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[32px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/80 to-indigo-50/70 p-6 shadow-[0_20px_70px_rgba(79,70,229,0.10)] sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Service Marketplace
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">
                  Explore Services
                </h1>

                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Browse available social media services, compare rates and
                  limits, then place your order directly from DreamSMM.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Services" value={String(uniqueServices.length)} icon="◎" />
                <StatCard label="Platforms" value={String(platforms.length)} icon="◈" />
              </div>
            </div>
          </section>

          {/* PLATFORM NAVIGATION */}
          <div className="mt-5 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              <a
                href="#all"
                className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-[10px] font-black text-violet-700 shadow-sm"
              >
                All Services
              </a>

              {platforms.map((platform) => (
                <a
                  key={platform.label}
                  href={`#platform-${normalize(platform.label).replace(/\s+/g, "-")}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                >
                  {titleCase(platform.label)}
                </a>
              ))}
            </div>
          </div>

          {/* SERVICES */}
          {uniqueServices.length === 0 ? (
            <section
              id="all"
              className="mt-7 rounded-[28px] border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl font-black text-violet-500">
                ◎
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-900">
                No services available
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-400">
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
                  {/* PLATFORM HEADING */}
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-lg font-black text-violet-600 ring-1 ring-violet-100">
                        {platformIcon(platform.label)}
                      </div>

                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                          {titleCase(platform.label)}
                        </h2>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {Array.from(platform.categories.values()).reduce(
                            (total, category) => total + category.services.length,
                            0,
                          )}{" "}
                          services available
                        </p>
                      </div>
                    </div>

                    <span className="hidden rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-violet-600 sm:inline-flex">
                      Available
                    </span>
                  </div>

                  <div className="space-y-8">
                    {Array.from(platform.categories.values()).map((category) => (
                      <div key={category.label}>
                        {/* CATEGORY */}
                        <div className="mb-4 flex items-center gap-3">
                          <h3 className="text-lg font-black text-slate-800 sm:text-xl">
                            {titleCase(category.label)}
                          </h3>

                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-black text-slate-400 shadow-sm">
                            {category.services.length}
                          </span>
                        </div>

                        {/* SERVICE CARDS */}
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {category.services.map((service, serviceIndex) => (
                            <PremiumServiceCard
                              key={service.id}
                              service={service}
                              category={category.label}
                              index={serviceIndex}
                            />
                          ))}
                        </div>
                        {false && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {category.services.map((service) => (
                            <article
                              key={service.id}
                              className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.045)] transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_45px_rgba(99,102,241,0.10)]"
                            >
                              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-100/50 blur-2xl transition group-hover:bg-violet-200/50" />

                              <div className="relative flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 text-xl font-black text-violet-600 ring-1 ring-violet-100">
                                    {platformIcon(service.platform)}
                                  </div>

                                  <div className="min-w-0">
                                    <h4 className="truncate text-base font-black text-slate-900">
                                      {service.name}
                                    </h4>
                                    <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-violet-500">
                                      {service.platform}
                                    </p>
                                  </div>
                                </div>

                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                              </div>

                              <div className="relative mt-5 min-h-[54px]">
                                <p className="text-xs font-medium leading-5 text-slate-500">
                                  {service.description ||
                                    "High-quality social media service with fast processing."}
                                </p>
                              </div>

                              <div className="relative mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3.5">
                                  <p className="text-[8px] font-black uppercase tracking-wider text-violet-500">
                                    Rate / 1K
                                  </p>
                                  <p className="mt-1.5 text-lg font-black text-violet-800">
                                    ₹{service.rate.toString()}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                                    Range
                                  </p>
                                  <p className="mt-1.5 text-xs font-black leading-5 text-slate-700">
                                    {service.min.toLocaleString()} –{" "}
                                    {service.max.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="relative mt-3 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3">
                                <div>
                                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                                    Service ID
                                  </p>
                                  <p className="mt-1 text-xs font-black text-slate-700">
                                    #{service.id}
                                  </p>
                                </div>

                                <span className="rounded-lg bg-white px-2.5 py-1.5 text-[9px] font-black text-slate-400 shadow-sm">
                                  {titleCase(category.label)}
                                </span>
                              </div>

                              <a
                                href={`/dashboard?serviceId=${service.id}`}
                                className="relative mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-xs font-black text-white shadow-[0_12px_28px_rgba(99,102,241,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(99,102,241,0.28)]"
                              >
                                Order Now
                                <span className="text-base transition-transform group-hover:translate-x-1">
                                  →
                                </span>
                              </a>
                            </article>
                          ))}
                        </div>}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <TrustStrip />
          <MarketplaceGuide />
          <ServiceFAQ />
          <CatalogFooter />

          {/* BOTTOM INFO */}
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


/* =========================================================
   PREMIUM SERVICE UI HELPERS
   ---------------------------------------------------------
   These helpers keep the page visually consistent while
   keeping the actual service data untouched.
========================================================= */

function serviceAccent(index: number) {
  const accents = [
    "from-violet-50 to-indigo-50",
    "from-indigo-50 to-blue-50",
    "from-fuchsia-50 to-violet-50",
    "from-purple-50 to-pink-50",
  ];

  return accents[index % accents.length];
}

function serviceTier(rate: string) {
  const numeric = Number(rate);

  if (!Number.isFinite(numeric)) {
    return "Standard";
  }

  if (numeric <= 10) return "Budget";
  if (numeric <= 50) return "Popular";
  if (numeric <= 200) return "Premium";

  return "Pro";
}

function serviceTierClass(rate: string) {
  const tier = serviceTier(rate);

  if (tier === "Budget") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tier === "Popular") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (tier === "Premium") {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }

  return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";
}

function compactNumber(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

    return value.toLocaleString();
}

function platformDescription(platform: string) {
  const value = normalize(platform);

  if (value.includes("instagram")) {
    return "Growth, engagement and visibility services for Instagram.";
  }

  if (value.includes("youtube")) {
    return "Audience and engagement services for YouTube creators.";
  }

  if (value.includes("facebook")) {
    return "Social growth and engagement services for Facebook.";
  }

  if (value.includes("tiktok")) {
    return "Discovery and engagement services for TikTok.";
  }

  if (value.includes("telegram")) {
    return "Channel, group and community growth services.";
  }

  if (value.includes("spotify")) {
    return "Audience and discovery services for Spotify.";
  }

  if (value.includes("linkedin")) {
    return "Professional audience and profile growth services.";
  }

  return `Available services for ${titleCase(platform)}.`;
}

function categoryIcon(category: string) {
  const value = normalize(category);

  if (value.includes("follower")) return "♙";
  if (value.includes("follow")) return "♙";
  if (value.includes("like")) return "♡";
  if (value.includes("view")) return "◉";
  if (value.includes("comment")) return "◌";
  if (value.includes("share")) return "↗";
  if (value.includes("save")) return "▱";
  if (value.includes("story")) return "◒";
  if (value.includes("subscriber")) return "♙";
  if (value.includes("watch")) return "◉";
  if (value.includes("traffic")) return "↗";
  if (value.includes("member")) return "♙";

  return "✦";
}

function CategoryHeader({
  category,
  count,
}: {
  category: string;
  count: number;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-violet-600 shadow-sm ring-1 ring-violet-100">
          {categoryIcon(category)}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black tracking-tight text-slate-800">
              {titleCase(category)}
            </h3>

            <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[8px] font-black text-slate-400">
              {count}
            </span>
          </div>

          <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
            Services available in this category
          </p>
        </div>
      </div>

      <span className="self-start rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 sm:self-auto">
        {count} services
      </span>
    </div>
  );
}

function PlatformHeader({
  platform,
  count,
  categories,
}: {
  platform: string;
  count: number;
  categories: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-r from-white via-violet-50/70 to-indigo-50/70 p-5 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black text-violet-600 shadow-sm ring-1 ring-violet-100">
            {platformIcon(platform)}
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
              Platform
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              {titleCase(platform)}
            </h2>

            <p className="mt-1 max-w-xl text-xs font-medium leading-5 text-slate-500">
              {platformDescription(platform)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 text-center shadow-sm">
            <p className="text-lg font-black text-violet-700">
              {count}
            </p>
            <p className="mt-0.5 text-[8px] font-black uppercase tracking-wider text-slate-400">
              Services
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 text-center shadow-sm">
            <p className="text-lg font-black text-indigo-700">
              {categories}
            </p>
            <p className="mt-0.5 text-[8px] font-black uppercase tracking-wider text-slate-400">
              Categories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[11px] font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}

function PremiumServiceCard({
  service,
  category,
  index,
}: {
  service: {
    id: number;
    name: string;
    platform: string;
    category: string | null;
    description: string | null;
    rate: unknown;
    min: number;
    max: number;
  };
  category: string;
  index: number;
}) {
  const tier = serviceTier(String(service.rate));

  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.045)] transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_50px_rgba(99,102,241,0.11)]">
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${serviceAccent(index)} opacity-80 blur-3xl transition group-hover:opacity-100`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 text-lg font-black text-violet-600 ring-1 ring-violet-100">
              {platformIcon(service.platform)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-black text-slate-500">
                  #{service.id}
                </span>

                <span
                  className={`rounded-md border px-2 py-1 text-[8px] font-black ${serviceTierClass(
                    String(service.rate),
                  )}`}
                >
                  {tier}
                </span>
              </div>

              <h4 className="mt-2 text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                {service.name}
              </h4>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-violet-500">
            Service overview
          </p>

          <p className="mt-1.5 min-h-[40px] text-xs font-medium leading-5 text-slate-500">
            {service.description ||
              "High-quality social media service with fast processing."}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ServiceMetric
            label="Rate / 1K"
            value={`₹${String(service.rate)}`}
          />

          <ServiceMetric
            label="Category"
            value={titleCase(category)}
          />

          <ServiceMetric
            label="Minimum"
            value={service.min.toLocaleString()}
          />

          <ServiceMetric
            label="Maximum"
            value={service.max.toLocaleString()}
          />
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/60 px-3.5 py-3">
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-violet-500">
              Order range
            </p>
            <p className="mt-1 text-[10px] font-black text-violet-800">
              {compactNumber(service.min)} — {compactNumber(service.max)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-black uppercase tracking-wider text-violet-400">
              Platform
            </p>
            <p className="mt-1 text-[10px] font-black text-violet-800">
              {titleCase(service.platform)}
            </p>
          </div>
        </div>

        <a
          href={`/dashboard?serviceId=${service.id}`}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-xs font-black text-white shadow-[0_12px_28px_rgba(99,102,241,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(99,102,241,0.30)]"
        >
          Order Now
          <span className="text-base transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>
    </article>
  );
}

function ServiceFAQ() {
  const questions = [
    {
      question: "How do I choose a service?",
      answer:
        "Start with the platform, then compare the category, rate, minimum and maximum quantity shown on each service card.",
    },
    {
      question: "What does Rate / 1K mean?",
      answer:
        "It is the displayed service rate for one thousand units. Your final charge is calculated from the quantity you enter in the order form.",
    },
    {
      question: "Why do services have different limits?",
      answer:
        "Each service can have its own minimum and maximum quantity. Always keep your order within the displayed range.",
    },
    {
      question: "Where does Order Now take me?",
      answer:
        "Order Now opens the main order panel with the selected service ID in the URL so the service can be selected for your order.",
    },
    {
      question: "Can I browse by category?",
      answer:
        "Yes. Services are grouped underneath each platform by category, making it easier to compare similar services together.",
    },
    {
      question: "What if a service is not available?",
      answer:
        "Only services returned by the current service catalog are shown on this page. If a service is missing, check the catalog again later or contact support.",
    },
  ];

  return (
    <section className="mt-12 rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.045)] sm:p-7">
      <div className="max-w-2xl">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
          Service guide
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          Frequently asked questions
        </h2>

        <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
          Quick answers to help you understand the catalog before placing an
          order.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {questions.map((item, index) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-violet-200 hover:bg-violet-50/40"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs font-black text-slate-800">
              <span>{item.question}</span>

              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-black text-violet-600 shadow-sm transition group-open:bg-violet-100">
                +
              </span>
            </summary>

            <p className="mt-3 border-t border-slate-200 pt-3 text-[10px] font-medium leading-5 text-slate-500">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CatalogFooter() {
  return (
    <section className="mt-8 overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-5 text-white shadow-[0_20px_50px_rgba(79,70,229,0.18)] sm:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
            Ready to order?
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight">
            Pick a service and get started.
          </h2>

          <p className="mt-2 max-w-xl text-xs font-medium leading-5 text-white/70">
            Use the service catalog to compare options, then open the order
            panel with your selected service.
          </p>
        </div>

        <a
          href="/dashboard"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-white px-6 text-xs font-black text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50"
        >
          Open Order Panel →
        </a>
      </div>
    </section>
  );
}

function MarketplaceGuide() {
  const steps = [
    {
      number: "01",
      title: "Choose a platform",
      text: "Find the social network or platform that matches your target.",
    },
    {
      number: "02",
      title: "Compare services",
      text: "Review category, rate, minimum and maximum limits before ordering.",
    },
    {
      number: "03",
      title: "Place your order",
      text: "Open the order form with the selected service ready to use.",
    },
  ];

  return (
    <section className="mt-12 rounded-[30px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-sm sm:p-7">
      <div className="max-w-2xl">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
          How it works
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          Choose the right service in three steps
        </h2>

        <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
          Everything you need to compare services is shown before you place
          an order.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span className="text-[10px] font-black text-violet-500">
              {step.number}
            </span>

            <h3 className="mt-2 text-sm font-black text-slate-900">
              {step.title}
            </h3>

            <p className="mt-2 text-[10px] font-medium leading-5 text-slate-500">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    ["✓", "Clear pricing", "Rates are shown directly on every service card."],
    ["↕", "Visible limits", "Minimum and maximum quantities are easy to compare."],
    ["→", "Quick ordering", "Order Now takes you directly to the order panel."],
    ["◎", "Organized catalog", "Services are grouped by platform and category."],
  ];

  return (
    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([icon, title, text]) => (
        <div
          key={title}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-600">
              {icon}
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-800">
                {title}
              </h3>
              <p className="mt-1 text-[9px] font-medium leading-4 text-slate-400">
                {text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="min-w-[118px] rounded-2xl border border-white bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-black text-violet-600">{icon}</span>
        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
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
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-base font-black text-violet-600 ring-1 ring-violet-100">
        {icon}
      </div>

      <h3 className="mt-4 text-base font-black text-slate-900">{title}</h3>

      <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
        {description}
      </p>

      {link && linkText && (
        <a
          href={link}
          className="mt-4 inline-block text-xs font-black text-violet-600 transition hover:text-violet-800"
        >
          {linkText}
        </a>
      )}
    </div>
  );
}

function platformIcon(platform: string) {
  const value = normalize(platform);

  if (value.includes("instagram")) return "◎";
  if (value.includes("youtube")) return "▶";
  if (value.includes("facebook")) return "f";
  if (value.includes("tiktok")) return "♪";
  if (value.includes("telegram")) return "➤";
  if (value.includes("twitter") || value === "x") return "𝕏";
  if (value.includes("spotify")) return "◉";
  if (value.includes("linkedin")) return "in";
  if (value.includes("reddit")) return "●";

  return "✦";
}
