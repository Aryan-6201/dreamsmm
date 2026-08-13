"use client";

import { useMemo, useState } from "react";

type Service = {
  id: number;
  name: string;
  platform: string;
  description: string | null;
  category: string | null;
  rate: string;
  min: number;
  max: number;
};

const platformIcons: Record<string, string> = {
  instagram: "◎",
  youtube: "▶",
  facebook: "f",
  tiktok: "♪",
  telegram: "➤",
  twitter: "𝕏",
  x: "𝕏",
};

const platformOrder = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Facebook",
  "Telegram",
  "X",
];

export default function OrderForm({ services }: { services: Service[] }) {
  const [platform, setPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const platforms = useMemo(() => {
    const unique = Array.from(
      new Set(services.map((s) => s.platform).filter(Boolean))
    );

    return unique.sort((a, b) => {
      const ai = platformOrder.findIndex(
        (p) => p.toLowerCase() === a.toLowerCase()
      );
      const bi = platformOrder.findIndex(
        (p) => p.toLowerCase() === b.toLowerCase()
      );

      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [services]);

  const platformServices = useMemo(() => {
    if (!platform) return [];
    return services.filter(
      (s) => s.platform.toLowerCase() === platform.toLowerCase()
    );
  }, [services, platform]);

  // Categories come directly from the Service.category field in Prisma.
  const categoryGroups = useMemo(() => {
    const groups: Record<string, Service[]> = {};

    platformServices.forEach((service) => {
      const name = service.category?.trim() || "Other";

      if (!groups[name]) groups[name] = [];
      groups[name].push(service);
    });

    return groups;
  }, [platformServices]);

  const categories = useMemo(
    () => Object.keys(categoryGroups).sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    }),
    [categoryGroups]
  );

  const categoryServices = category
    ? categoryGroups[category] ?? []
    : [];

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return categoryServices;

    return categoryServices.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [categoryServices, search]);

  const selected = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  const qty = Number(quantity) || 0;

  const quantityValid =
    !!selected && qty >= selected.min && qty <= selected.max;

  const total = selected
    ? (qty / 1000) * Number(selected.rate)
    : 0;

  const icon =
    platformIcons[platform.toLowerCase()] ?? "✦";

  function choosePlatform(value: string) {
    setPlatform(value);
    setCategory("");
    setServiceId("");
    setSearch("");
    setStep(2);
  }

  function chooseCategory(value: string) {
    setCategory(value);
    setServiceId("");
    setSearch("");
    setStep(3);
  }

  function chooseService(id: number) {
    setServiceId(id);
    setStep(4);
  }

  function resetAll() {
    setPlatform("");
    setCategory("");
    setServiceId("");
    setSearch("");
    setLink("");
    setQuantity("");
    setError("");
    setSuccess("");
    setStep(1);
  }

async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!selected || !link.trim() || !quantityValid || submitting) {
    return;
  }

  setSubmitting(true);
  setError("");
  setSuccess("");

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serviceId: selected.id,
        link: link.trim(),
        quantity: qty,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to place order.");
      return;
    }

    setSuccess(
      `Order #${data.order.id} placed successfully. ₹${data.order.charge} charged.`
    );

    setLink("");
    setQuantity("");
  } catch (error) {
    console.error("Order request failed:", error);
    setError("Network error. Please try again.");
  } finally {
    setSubmitting(false);
  }
}

  return (
    <form onSubmit={submit} className="relative">

      {/* =========================================================
          PROGRESS
      ========================================================= */}

      <div className="mb-7 rounded-2xl border border-white/[0.06] bg-black/20 p-3 backdrop-blur-xl">
        <div className="flex items-center gap-1">
          {[
            ["01", "Platform"],
            ["02", "Category"],
            ["03", "Service"],
            ["04", "Order"],
          ].map(([number, label], index) => {
            const current = index + 1;
            const active = current === step;
            const done = current < step;

            return (
              <div key={number} className="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  disabled={current > step}
                  onClick={() => {
                    if (current < step) setStep(current as 1 | 2 | 3 | 4);
                  }}
                  className={`flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left transition ${
                    active
                      ? "bg-violet-500/[0.10]"
                      : "hover:bg-white/[0.025]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[7px] font-black ${
                      active
                        ? "border-violet-400/30 bg-violet-400/10 text-violet-200"
                        : done
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-white/[0.07] bg-white/[0.02] text-gray-700"
                    }`}
                  >
                    {done ? "✓" : number}
                  </span>

                  <span
                    className={`hidden truncate text-[8px] font-bold sm:block ${
                      active ? "text-gray-200" : "text-gray-600"
                    }`}
                  >
                    {label}
                  </span>
                </button>

                {current < 4 && (
                  <span
                    className={`mx-1 h-px flex-1 ${
                      done ? "bg-emerald-400/20" : "bg-white/[0.05]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          STEP 1 — PLATFORM
      ========================================================= */}

      {step === 1 && (
        <section>
          <div className="mb-6">
            <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-violet-300/60">
              Step 01
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">
              Choose your platform
            </h2>

            <p className="mt-2 max-w-xl text-[10px] leading-5 text-gray-600">
              Start by selecting where you want to grow. We&apos;ll only show
              services relevant to that platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {platforms.map((item) => {
              const active =
                item.toLowerCase() === platform.toLowerCase();

              const itemIcon =
                platformIcons[item.toLowerCase()] ?? "✦";

              const count = services.filter(
                (s) => s.platform.toLowerCase() === item.toLowerCase()
              ).length;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => choosePlatform(item)}
                  className={`group relative overflow-hidden rounded-[22px] border p-5 text-left transition duration-300 ${
                    active
                      ? "border-violet-400/25 bg-gradient-to-br from-violet-500/[0.12] to-indigo-500/[0.04] shadow-[0_18px_50px_rgba(99,102,241,.10)]"
                      : "border-white/[0.07] bg-white/[0.025] hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.045]"
                  }`}
                >
                  {active && (
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
                  )}

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-lg font-black ${
                      active
                        ? "border-violet-300/15 bg-violet-400/10 text-violet-200"
                        : "border-white/[0.07] bg-black/20 text-gray-500"
                    }`}
                  >
                    {itemIcon}
                  </div>

                  <p className="mt-4 text-xs font-black">
                    {item}
                  </p>

                  <p className="mt-1 text-[8px] text-gray-600">
                    {count} services available
                  </p>

                  <span className="absolute bottom-5 right-5 text-gray-700 transition group-hover:translate-x-1 group-hover:text-gray-300">
                    →
                  </span>
                </button>
              );
            })}
          </div>

          {platforms.length === 0 && (
            <EmptyState
              title="No platforms available"
              text="There are currently no enabled services."
            />
          )}
        </section>
      )}

      {/* =========================================================
          STEP 2 — CATEGORY
      ========================================================= */}

      {step === 2 && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-violet-300/60">
                Step 02
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">
                What do you need?
              </h2>

              <p className="mt-2 max-w-xl text-[10px] leading-5 text-gray-600">
                Pick a category to narrow down the service list.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[8px] font-bold text-gray-500 hover:text-white"
            >
              Change platform
            </button>
          </div>

          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-violet-400/10 bg-violet-400/[0.045] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
              {icon}
            </div>

            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-violet-300/60">
                Selected platform
              </p>

              <p className="mt-1 text-xs font-black">
                {platform}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((item) => {
              const count = categoryGroups[item]?.length ?? 0;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => chooseCategory(item)}
                  className="group relative rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-violet-400/[0.045]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-black/20 text-violet-300">
                      {categoryIcon(item)}
                    </div>

                    <span className="rounded-full border border-white/[0.06] bg-black/20 px-2 py-1 text-[7px] font-bold text-gray-600">
                      {count}
                    </span>
                  </div>

                  <h3 className="mt-5 text-sm font-black">
                    {item}
                  </h3>

                  <p className="mt-1 text-[8px] text-gray-600">
                    Browse {count} {item.toLowerCase()} services
                  </p>

                  <span className="mt-5 block text-[8px] font-bold text-gray-700 transition group-hover:text-violet-300">
                    View services →
                  </span>
                </button>
              );
            })}
          </div>

          {categories.length === 0 && (
            <EmptyState
              title="No categories found"
              text="The enabled services for this platform could not be grouped."
            />
          )}
        </section>
      )}

      {/* =========================================================
          STEP 3 — SERVICE
      ========================================================= */}

      {step === 3 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-violet-300/60">
                Step 03
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">
                Select a service
              </h2>

              <p className="mt-2 text-[10px] text-gray-600">
                {platform} · {category}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[8px] font-bold text-gray-500 hover:text-white"
            >
              Change category
            </button>
          </div>

          <div className="relative mb-4">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
              ⌕
            </span>

            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${category.toLowerCase()} services...`}
              className="h-12 w-full rounded-2xl border border-white/[0.08] bg-black/20 pl-11 pr-10 text-xs text-white outline-none backdrop-blur-xl transition placeholder:text-gray-700 focus:border-violet-400/30 focus:ring-4 focus:ring-violet-500/[0.05]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <span className="text-[8px] text-gray-700">
              Showing {filteredServices.length} services
            </span>

            <span className="text-[8px] text-gray-700">
              Sorted for {platform}
            </span>
          </div>

          <div className="max-h-[450px] space-y-2 overflow-y-auto pr-1">
            {filteredServices.map((service) => {
              const active = service.id === serviceId;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => chooseService(service.id)}
                  className={`group relative w-full overflow-hidden rounded-[20px] border p-4 text-left transition duration-300 ${
                    active
                      ? "border-violet-400/25 bg-violet-500/[0.08]"
                      : "border-white/[0.06] bg-white/[0.018] hover:border-white/[0.13] hover:bg-white/[0.035]"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-violet-400 to-indigo-500" />
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        active
                          ? "border-violet-300/15 bg-violet-400/10 text-violet-200"
                          : "border-white/[0.06] bg-black/20 text-gray-600"
                      }`}
                    >
                      {icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[10px] font-bold text-gray-200">
                        {service.name}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-[8px] text-gray-600">
                          Min {service.min.toLocaleString()}
                        </span>

                        <span className="h-0.5 w-0.5 rounded-full bg-gray-700" />

                        <span className="text-[8px] text-gray-600">
                          Max {service.max.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-violet-300">
                        ₹{service.rate}
                      </p>

                      <p className="mt-1 text-[7px] text-gray-700">
                        per 1K
                      </p>
                    </div>

                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[7px] ${
                        active
                          ? "border-violet-300/30 bg-violet-400/10 text-violet-200"
                          : "border-white/[0.07] text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <EmptyState
              title="No matching services"
              text="Try a different search term."
            />
          )}
        </section>
      )}

      {/* =========================================================
          STEP 4 — ORDER
      ========================================================= */}

      {step === 4 && selected && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-violet-300/60">
                Step 04
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">
                Build your order
              </h2>

              <p className="mt-2 text-[10px] text-gray-600">
                Add the target and quantity, then review your total.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[8px] font-bold text-gray-500 hover:text-white"
            >
              Change service
            </button>
          </div>

          {/* Selected service */}
          <div className="relative overflow-hidden rounded-[24px] border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.10] via-white/[0.025] to-transparent p-5">
            <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-violet-500/[0.10] blur-[75px]" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.08] text-lg text-violet-200">
                {icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-violet-300/60">
                  {platform} · {category}
                </p>

                <p className="mt-1 text-sm font-black">
                  {selected.name}
                </p>

                <p className="mt-1 text-[8px] text-gray-600">
                  ₹{selected.rate} / 1K · {selected.min.toLocaleString()}–
                  {selected.max.toLocaleString()}
                </p>
              </div>

              <div className="hidden rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 text-right sm:block">
                <p className="text-[7px] uppercase tracking-[0.15em] text-gray-700">
                  Rate
                </p>

                <p className="mt-1 text-xs font-black text-violet-300">
                  ₹{selected.rate}
                </p>
              </div>
            </div>
          </div>

          {/* Target */}
          <div className="mt-5">
            <label className="mb-2 block text-[8px] font-bold uppercase tracking-[0.18em] text-gray-500">
              Target URL
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                ↗
              </span>

              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://instagram.com/your-profile"
                className="h-14 w-full rounded-2xl border border-white/[0.08] bg-black/20 pl-11 pr-4 text-xs text-white outline-none backdrop-blur-xl transition placeholder:text-gray-700 focus:border-violet-400/30 focus:ring-4 focus:ring-violet-500/[0.05]"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[8px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Quantity
              </label>

              <span className="text-[8px] text-gray-700">
                {selected.min.toLocaleString()} –{" "}
                {selected.max.toLocaleString()}
              </span>
            </div>

            <input
              type="number"
              min={selected.min}
              max={selected.max}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className={`h-14 w-full rounded-2xl border bg-black/20 px-4 text-sm font-black text-white outline-none backdrop-blur-xl transition placeholder:text-gray-700 ${
                quantity && !quantityValid
                  ? "border-red-400/25 focus:ring-4 focus:ring-red-500/[0.05]"
                  : "border-white/[0.08] focus:border-violet-400/30 focus:ring-4 focus:ring-violet-500/[0.05]"
              }`}
            />

            {quantity && !quantityValid && (
              <p className="mt-2 text-[8px] font-semibold text-red-400">
                Enter a quantity between{" "}
                {selected.min.toLocaleString()} and{" "}
                {selected.max.toLocaleString()}.
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-gray-600">
                  Estimated total
                </p>

                <p className="mt-1 text-[9px] text-gray-700">
                  {qty ? qty.toLocaleString() : "0"} units
                </p>
              </div>

              <p className="text-3xl font-black tracking-[-0.04em]">
                ₹{total.toFixed(2)}
              </p>
            </div>

            <div className="my-4 h-px bg-white/[0.06]" />

            <div className="grid gap-3 sm:grid-cols-2">
              <Summary label="Platform" value={platform} />
              <Summary label="Category" value={category} />
              <Summary label="Service" value={selected.name} />
              <Summary
                label="Rate"
                value={`₹${selected.rate} / 1K`}
              />
            </div>

            {link && (
              <div className="mt-4 rounded-xl border border-white/[0.05] bg-black/20 p-3">
                <p className="truncate text-[8px] text-gray-600">
                  {link}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-3 rounded-2xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3">
              <p className="text-[9px] font-semibold text-red-300">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mb-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3">
              <p className="text-[9px] font-semibold text-emerald-300">
                ✓ {success}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!link.trim() || !quantityValid || submitting}
            className="group relative mt-5 h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_55px_rgba(99,102,241,.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_65px_rgba(99,102,241,.32)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
          >
            <span className="relative">
              {submitting ? (
                <>
                  <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Placing Order...
                </>
              ) : (
                <>
                  Place Order
                  <span className="ml-3 text-sm transition group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="mt-3 w-full text-center text-[8px] font-bold text-gray-700 transition hover:text-gray-400"
          >
            Start over
          </button>
        </section>
      )}
    </form>
  );
}

function categoryIcon(category: string) {
  const icons: Record<string, string> = {
    Followers: "♙",
    Likes: "♡",
    Views: "◉",
    Comments: "◌",
    Engagement: "✦",
    Saves: "▱",
    Shares: "⌁",
    Story: "◌",
    Other: "◇",
  };

  return icons[category] ?? "◇";
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-gray-700">
        {label}
      </p>

      <p className="mt-1 truncate text-[9px] font-semibold text-gray-400">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="mt-3 rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-black/20 text-gray-600">
        ◇
      </div>

      <p className="mt-4 text-xs font-bold text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-[9px] text-gray-700">
        {text}
      </p>
    </div>
  );
}