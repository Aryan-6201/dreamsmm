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

const platformOrder = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Facebook",
  "Telegram",
  "X",
];

const platformIcons: Record<string, string> = {
  instagram: "◎",
  youtube: "▶",
  facebook: "f",
  tiktok: "♪",
  telegram: "➤",
  twitter: "𝕏",
  x: "𝕏",
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function displayCategory(value: string | null | undefined) {
  const clean = (value || "").trim().replace(/\s+/g, " ");
  if (!clean) return "Other";
  return clean
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

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

  const uniqueServices = useMemo(() => {
    const seen = new Set<string>();

    return services.filter((service) => {
      const key = [
        normalize(service.platform),
        normalize(service.category) || "other",
        normalize(service.name),
      ].join("|");

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [services]);

  const platforms = useMemo(() => {
    const unique = Array.from(
      new Map(
        uniqueServices
          .filter((service) => service.platform?.trim())
          .map((service) => [normalize(service.platform), service.platform.trim()])
      ).values()
    );

    return unique.sort((a, b) => {
      const ai = platformOrder.findIndex(
        (item) => normalize(item) === normalize(a)
      );
      const bi = platformOrder.findIndex(
        (item) => normalize(item) === normalize(b)
      );

      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [uniqueServices]);

  const platformServices = useMemo(() => {
    if (!platform) return [];
    return uniqueServices.filter(
      (service) => normalize(service.platform) === normalize(platform)
    );
  }, [uniqueServices, platform]);

  const categoryGroups = useMemo(() => {
    const groups = new Map<string, Service[]>();

    for (const service of platformServices) {
      const label = displayCategory(service.category);
      const key = normalize(label);

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(service);
    }

    return groups;
  }, [platformServices]);

  const categories = useMemo(() => {
    return Array.from(categoryGroups.entries())
      .map(([key, items]) => ({
        key,
        label: displayCategory(items[0]?.category),
        services: items,
      }))
      .sort((a, b) => {
        if (a.key === "other") return 1;
        if (b.key === "other") return -1;
        return a.label.localeCompare(b.label);
      });
  }, [categoryGroups]);

  const categoryServices = useMemo(() => {
    return category ? categoryGroups.get(normalize(category)) || [] : [];
  }, [category, categoryGroups]);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categoryServices;

    return categoryServices.filter(
      (service) =>
        service.name.toLowerCase().includes(q) ||
        service.description?.toLowerCase().includes(q)
    );
  }, [categoryServices, search]);

  const selected = useMemo(
    () => uniqueServices.find((service) => service.id === serviceId),
    [uniqueServices, serviceId]
  );

  const qty = Number(quantity) || 0;
  const quantityValid =
    !!selected && qty >= selected.min && qty <= selected.max;

  const total = selected
    ? (qty / 1000) * Number(selected.rate)
    : 0;

  const icon = platformIcons[normalize(platform)] ?? "✦";

  function choosePlatform(value: string) {
    setPlatform(value);
    setCategory("");
    setServiceId("");
    setSearch("");
    setError("");
    setSuccess("");
    setStep(2);
  }

  function chooseCategory(value: string) {
    setCategory(value);
    setServiceId("");
    setSearch("");
    setError("");
    setSuccess("");
    setStep(3);
  }

  function chooseService(id: number) {
    setServiceId(id);
    setError("");
    setSuccess("");
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
    } catch (requestError) {
      console.error("Order request failed:", requestError);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="relative">
      <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
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
                    if (current < step) {
                      setStep(current as 1 | 2 | 3 | 4);
                    }
                  }}
                  className={`flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2.5 text-left transition ${
                    active ? "bg-violet-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${
                      active
                        ? "border-violet-200 bg-violet-100 text-violet-700"
                        : done
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}
                  >
                    {done ? "✓" : number}
                  </span>

                  <span
                    className={`hidden truncate text-sm font-bold sm:block ${
                      active ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </button>

                {current < 4 && (
                  <span
                    className={`mx-1 h-px flex-1 ${
                      done ? "bg-emerald-200" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {step === 1 && (
        <section>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Step 01
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Choose your platform
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Start by selecting where you want to grow. We&apos;ll only show
              services relevant to that platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {platforms.map((item) => {
              const active = normalize(item) === normalize(platform);
              const itemIcon = platformIcons[normalize(item)] ?? "✦";
              const count = uniqueServices.filter(
                (service) => normalize(service.platform) === normalize(item)
              ).length;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => choosePlatform(item)}
                  className={`group rounded-2xl border p-5 text-left shadow-sm transition ${
                    active
                      ? "border-violet-300 bg-violet-50"
                      : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/50"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-black ${
                      active
                        ? "border-violet-200 bg-violet-100 text-violet-700"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    {itemIcon}
                  </div>

                  <p className="mt-4 text-base font-black text-gray-900">
                    {item}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {count} services available
                  </p>

                  <span className="mt-4 block text-sm font-bold text-violet-600">
                    Continue →
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

      {step === 2 && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Step 02
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                What do you need?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Pick one category to narrow down the service list.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Change platform
            </button>
          </div>

          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
              {icon}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-500">
                Selected platform
              </p>
              <p className="mt-1 text-base font-black text-gray-900">
                {platform}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => chooseCategory(item.label)}
                className="group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
                    {categoryIcon(item.label)}
                  </div>

                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-500">
                    {item.services.length}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-black text-gray-900">
                  {item.label}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Browse {item.services.length}{" "}
                  {item.label.toLowerCase()} services
                </p>

                <span className="mt-5 block text-sm font-bold text-violet-600">
                  View services →
                </span>
              </button>
            ))}
          </div>

          {categories.length === 0 && (
            <EmptyState
              title="No categories found"
              text="The enabled services for this platform could not be grouped."
            />
          )}
        </section>
      )}

      {step === 3 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Step 03
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                Select a service
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {platform} · {category}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Change category
            </button>
          </div>

          <div className="relative mb-4">
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${category.toLowerCase()} services...`}
              className="h-13 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {filteredServices.length} services
            </span>
            <span className="text-sm text-gray-400">
              {platform}
            </span>
          </div>

          <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
            {filteredServices.map((service) => {
              const active = service.id === serviceId;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => chooseService(service.id)}
                  className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition ${
                    active
                      ? "border-violet-300 bg-violet-50"
                      : "border-gray-200 bg-white hover:border-violet-200 hover:bg-gray-50"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-violet-500" />
                  )}

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                        active
                          ? "border-violet-200 bg-violet-100 text-violet-700"
                          : "border-gray-200 bg-gray-50 text-gray-500"
                      }`}
                    >
                      {icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-gray-900 sm:text-base">
                        {service.name}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Min {service.min.toLocaleString()}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-300" />
                        <span className="text-xs text-gray-500">
                          Max {service.max.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-violet-700 sm:text-base">
                        ₹{service.rate}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">per 1K</p>
                    </div>

                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                        active
                          ? "border-violet-300 bg-violet-100 text-violet-700"
                          : "border-gray-200 text-transparent"
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

      {step === 4 && selected && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Step 04
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                Build your order
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Add the target and quantity, then review your total.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Change service
            </button>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                {icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  {platform} · {category}
                </p>
                <p className="mt-1 text-base font-black text-gray-900">
                  {selected.name}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  ₹{selected.rate} / 1K ·{" "}
                  {selected.min.toLocaleString()}–
                  {selected.max.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Target URL
            </label>

            <input
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://instagram.com/your-profile"
              className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">
                Quantity
              </label>

              <span className="text-sm text-gray-500">
                {selected.min.toLocaleString()} –{" "}
                {selected.max.toLocaleString()}
              </span>
            </div>

            <input
              type="number"
              min={selected.min}
              max={selected.max}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Enter quantity"
              className={`h-14 w-full rounded-2xl border bg-white px-4 text-base font-bold text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 ${
                quantity && !quantityValid
                  ? "border-red-300 focus:ring-4 focus:ring-red-100"
                  : "border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              }`}
            />

            {quantity && !quantityValid && (
              <p className="mt-2 text-sm font-semibold text-red-500">
                Enter a quantity between{" "}
                {selected.min.toLocaleString()} and{" "}
                {selected.max.toLocaleString()}.
              </p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-600">
                  Estimated total
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {qty ? qty.toLocaleString() : "0"} units
                </p>
              </div>

              <p className="text-3xl font-black tracking-tight text-gray-900">
                ₹{total.toFixed(2)}
              </p>
            </div>

            <div className="my-4 h-px bg-gray-100" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Summary label="Platform" value={platform} />
              <Summary label="Category" value={category} />
              <Summary label="Service" value={selected.name} />
              <Summary label="Rate" value={`₹${selected.rate} / 1K`} />
            </div>

            {link && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="truncate text-sm text-gray-500">{link}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-3 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-3 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-600">
                ✓ {success}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!link.trim() || !quantityValid || submitting}
            className="mt-5 h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Placing Order..." : "Place Order →"}
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="mt-3 w-full py-2 text-sm font-bold text-gray-400 transition hover:text-gray-700"
          >
            Start over
          </button>
        </section>
      )}
    </form>
  );
}

function categoryIcon(category: string) {
  const key = normalize(category);

  const icons: Record<string, string> = {
    followers: "♙",
    likes: "♡",
    views: "◉",
    comments: "◌",
    engagement: "✦",
    saves: "▱",
    shares: "⌁",
    story: "◌",
    other: "◇",
  };

  return icons[key] ?? "◇";
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
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-gray-800">
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
    <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
        ◇
      </div>
      <p className="mt-4 text-base font-bold text-gray-700">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{text}</p>
    </div>
  );
}
