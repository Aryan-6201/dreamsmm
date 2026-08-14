"use client";

import { useMemo, useState } from "react";

type Service = {
  id: number;
  name: string;
  platform: string;
  category: string | null;
  description: string | null;
  rate: string;
  min: number;
  max: number;
};

export default function OrderForm({
  services,
}: {
  services: Service[];
}) {
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
    const map = new Map<string, string>();

    services.forEach((service) => {
      const value = service.platform?.trim();
      if (!value) return;

      const key = value.toLowerCase();

      if (!map.has(key)) {
        map.set(key, value);
      }
    });

    return Array.from(map.values());
  }, [services]);

  const platformServices = useMemo(() => {
    if (!platform) return [];

    return services.filter(
      (service) =>
        service.platform.toLowerCase() ===
        platform.toLowerCase()
    );
  }, [services, platform]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();

    platformServices.forEach((service) => {
      const value =
        service.category?.trim() || "Other";

      const key = value.toLowerCase();

      if (!map.has(key)) {
        map.set(key, value);
      }
    });

    return Array.from(map.values());
  }, [platformServices]);

  const categoryServices = useMemo(() => {
    if (!category) return [];

    return platformServices.filter((service) => {
      const value =
        service.category?.trim() || "Other";

      return (
        value.toLowerCase() ===
        category.toLowerCase()
      );
    });
  }, [platformServices, category]);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categoryServices;

    return categoryServices.filter((service) => {
      return (
        service.name.toLowerCase().includes(query) ||
        String(service.id).includes(query) ||
        service.description
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [categoryServices, search]);

  const selectedService = useMemo(() => {
    return services.find(
      (service) => service.id === serviceId
    );
  }, [services, serviceId]);

  const quantityNumber = Number(quantity) || 0;

  const validQuantity =
    selectedService &&
    quantityNumber >= selectedService.min &&
    quantityNumber <= selectedService.max;

  const total =
    selectedService && quantityNumber > 0
      ? (quantityNumber / 1000) *
        Number(selectedService.rate)
      : 0;

  function selectPlatform(value: string) {
    setPlatform(value);
    setCategory("");
    setServiceId("");
    setSearch("");
    setError("");
    setSuccess("");
    setStep(2);
  }

  function selectCategory(value: string) {
    setCategory(value);
    setServiceId("");
    setSearch("");
    setError("");
    setSuccess("");
    setStep(3);
  }

  function selectService(id: number) {
    setServiceId(id);
    setError("");
    setSuccess("");
    setStep(4);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    if (!selectedService) {
      setError("Please select a service.");
      return;
    }

    if (!link.trim()) {
      setError("Please enter the target link.");
      return;
    }

    if (!quantity.trim()) {
      setError("Please enter a quantity.");
      return;
    }

    if (!validQuantity) {
      setError(
        `Quantity must be between ${selectedService.min.toLocaleString()} and ${selectedService.max.toLocaleString()}.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          link: link.trim(),
          quantity: quantityNumber,
        }),
      });

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(
          data?.error ||
            data?.message ||
            `Order failed (${response.status}).`
        );
        return;
      }

      setSuccess(
        data?.order?.id
          ? `Order #${data.order.id} placed successfully.`
          : "Order placed successfully."
      );

      setLink("");
      setQuantity("");
    } catch (err) {
      console.error("ORDER ERROR:", err);

      setError(
        "Unable to connect to the order server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8"
    >
      {/* PREMIUM STEP NAV */}
      <div className="mb-7 rounded-[22px] border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-4 gap-1">
          {[
            [1, "Platform"],
            [2, "Category"],
            [3, "Service"],
            [4, "Order"],
          ].map(([number, label]) => {
            const current = Number(number);
            const active = step === current;
            const complete = step > current;

            return (
              <button
                key={current}
                type="button"
                onClick={() => {
                  if (current <= step) setStep(current as 1 | 2 | 3 | 4);
                }}
                className={`rounded-xl px-2 py-3 text-center transition ${
                  active
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : complete
                      ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
                      : "text-slate-400"
                }`}
              >
                <span className="block text-[9px] font-black uppercase tracking-widest opacity-70">
                  0{current}
                </span>
                <span className="mt-0.5 block text-[10px] font-black sm:text-xs">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH */}

      {step === 3 && <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-900">
              Find a service
            </p>

            <p className="mt-1 text-xs font-medium text-slate-400">
              Search by name, description or service ID
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">
            {services.length} total
          </span>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search services..."
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400 hover:text-slate-800"
            >
              ×
            </button>
          )}
        </div>
      </section>}

      {/* PLATFORM */}

      {step === 1 && <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
            Step 01
          </p>
          <p className="mt-1 text-xl font-black text-slate-900">
            Choose platform
          </p>

          <p className="mt-1 text-xs font-medium text-slate-400">
            Click directly on the platform you want
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {platforms.map((item) => {
            const active =
              platform.toLowerCase() ===
              item.toLowerCase();

            const count = services.filter(
              (service) =>
                service.platform.toLowerCase() ===
                item.toLowerCase()
            ).length;

            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  selectPlatform(item)
                }
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-violet-300 bg-violet-50 shadow-lg shadow-violet-100"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                }`}
              >
                {active && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-black text-white">
                    ✓
                  </span>
                )}

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black ${
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {platformIcon(item)}
                </div>

                <p
                  className={`mt-3 text-sm font-black ${
                    active
                      ? "text-violet-900"
                      : "text-slate-800"
                  }`}
                >
                  {item}
                </p>

                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  {count} services
                </p>
              </button>
            );
          })}
        </div>
        </section>
      )}

      {/* CATEGORY */}

      {step === 2 && platform && (
        <section>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mb-4 text-xs font-black text-slate-500 hover:text-violet-700"
          >
            ← Back to category
          </button>

          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">
                Choose category
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Select what you want to order
              </p>
            </div>

            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-violet-700">
              {platform}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-4 text-xs font-black text-slate-500 hover:text-violet-700"
          >
            ← Back to platforms
          </button>

          {categories.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((item) => {
                const active =
                  category.toLowerCase() ===
                  item.toLowerCase();

                const count =
                  platformServices.filter(
                    (service) =>
                      (
                        service.category?.trim() ||
                        "Other"
                      ).toLowerCase() ===
                      item.toLowerCase()
                  ).length;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      selectCategory(item)
                    }
                    className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? "border-violet-300 bg-violet-50 shadow-lg shadow-violet-100"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black ${
                          active
                            ? "bg-violet-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {categoryIcon(item)}
                      </div>

                      <div>
                        <p
                          className={`text-sm font-black ${
                            active
                              ? "text-violet-900"
                              : "text-slate-800"
                          }`}
                        >
                          {item}
                        </p>

                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                          {count} services
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-lg font-black ${
                        active
                          ? "text-violet-600"
                          : "text-slate-200 group-hover:text-violet-400"
                      }`}
                    >
                      {active ? "✓" : "→"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No categories available"
              description="There are currently no active services for this platform."
            />
          )}
        </section>
      )}

      {/* SERVICES */}

      {step === 3 && platform && category && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">
                Choose service
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Click once to select your service
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500">
              {filteredServices.length} results
            </span>
          </div>

          <div className="space-y-3">
            {filteredServices.map((service) => {
              const active =
                service.id === serviceId;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() =>
                    selectService(service.id)
                  }
                  className={`group w-full rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-violet-300 bg-violet-50 shadow-lg shadow-violet-100"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
                        active
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {active
                        ? "✓"
                        : platformIcon(
                            service.platform
                          )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-sm font-black leading-5 ${
                            active
                              ? "text-violet-950"
                              : "text-slate-800"
                          }`}
                        >
                          {service.name}
                        </p>

                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500">
                          #{service.id}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                          Min{" "}
                          {service.min.toLocaleString()}
                        </span>

                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                          Max{" "}
                          {service.max.toLocaleString()}
                        </span>

                        <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                          Available
                        </span>
                      </div>
                    </div>

                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-base font-black text-violet-700">
                        ₹{service.rate}
                      </p>

                      <p className="mt-1 text-[10px] font-bold text-slate-400">
                        per 1K
                      </p>
                    </div>
                  </div>

                  {active && (
                    <div className="mt-4 rounded-xl border border-violet-100 bg-white p-3">
                      <p className="text-xs font-medium leading-5 text-slate-500">
                        {service.description ||
                          "High-quality service with fast processing."}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <EmptyState
              title="No matching services"
              description="Try another search or choose a different category."
            />
          )}
        </section>
      )}

      {/* ORDER DETAILS */}

      {step === 4 && selectedService && (
        <section className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 sm:p-7">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="mb-5 text-xs font-black text-slate-500 hover:text-violet-700"
          >
            ← Back to services
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-black text-white shadow-lg shadow-violet-200">
              ✓
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Selected
                </span>

                <span className="text-[11px] font-bold text-slate-400">
                  #{selectedService.id}
                </span>
              </div>

              <h3 className="mt-2 text-base font-black leading-6 text-slate-900 sm:text-lg">
                {selectedService.name}
              </h3>

              <p className="mt-1 text-xs font-medium text-slate-500">
                ₹{selectedService.rate} per 1,000
              </p>
            </div>
          </div>

          <div className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
            Step 04 · Final details
          </div>

          <div className="mb-5 text-sm font-medium text-slate-500">
            Add your target link and quantity, then place the order.
          </div>

          {/* LINK */}

          <div className="mt-7">
            <label className="mb-2 block text-sm font-black text-slate-800">
              Target link
            </label>

            <input
              type="text"
              inputMode="url"
              value={link}
              onChange={(event) =>
                setLink(event.target.value)
              }
              placeholder="https://instagram.com/your-post"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* QUANTITY */}

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-sm font-black text-slate-800">
                Quantity
              </label>

              <span className="text-[11px] font-bold text-slate-400">
                {selectedService.min.toLocaleString()}
                {" — "}
                {selectedService.max.toLocaleString()}
              </span>
            </div>

            <input
              type="number"
              min={selectedService.min}
              max={selectedService.max}
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              placeholder="Enter quantity"
              className={`h-14 w-full rounded-2xl border bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                quantity && !validQuantity
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
              }`}
            />

            {quantity && !validQuantity && (
              <p className="mt-2 text-xs font-bold text-red-600">
                Quantity must be between{" "}
                {selectedService.min.toLocaleString()}{" "}
                and{" "}
                {selectedService.max.toLocaleString()}.
              </p>
            )}
          </div>

          {/* SUMMARY */}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Summary
              label="Platform"
              value={selectedService.platform}
            />

            <Summary
              label="Rate"
              value={`₹${selectedService.rate} / 1K`}
            />

            <Summary
              label="Total"
              value={`₹${total.toFixed(2)}`}
              highlight
            />
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-bold text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-bold text-emerald-700">
                ✓ {success}
              </p>
            </div>
          )}

          {/* PLACE ORDER */}

          <button
            type="submit"
            disabled={submitting}
            className="group mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-sm font-black text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Placing Order...
              </>
            ) : (
              <>
                Place Order

                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </button>
        </section>
      )}

      {/* INITIAL STATE */}

      {step === 1 && !platform && (
        <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-black text-violet-600 shadow-sm">
            ✦
          </div>

          <h3 className="mt-4 text-base font-black text-slate-800">
            Build your order
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
            Choose a platform, category and service above.
            Your order details will appear here.
          </p>
        </div>
      )}
    </form>
  );
}

/* =========================================================
   PLATFORM ICON
========================================================= */

function platformIcon(platform: string) {
  const value = platform.toLowerCase();

  if (value.includes("instagram")) return "◎";
  if (value.includes("youtube")) return "▶";
  if (value.includes("facebook")) return "f";
  if (value.includes("tiktok")) return "♪";
  if (value.includes("telegram")) return "➤";
  if (value.includes("twitter")) return "𝕏";
  if (value === "x") return "𝕏";
  if (value.includes("spotify")) return "●";
  if (value.includes("linkedin")) return "in";
  if (value.includes("reddit")) return "●";

  return "✦";
}

/* =========================================================
   CATEGORY ICON
========================================================= */

function categoryIcon(category: string) {
  const value = category.toLowerCase();

  if (value.includes("follower")) return "♙";
  if (value.includes("like")) return "♡";
  if (value.includes("view")) return "◉";
  if (value.includes("comment")) return "◌";
  if (value.includes("share")) return "⌁";
  if (value.includes("save")) return "▱";
  if (value.includes("story")) return "◌";
  if (value.includes("subscriber")) return "♙";
  if (value.includes("watch")) return "◉";
  if (value.includes("traffic")) return "↗";
  if (value.includes("member")) return "♙";

  return "◇";
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
        ◇
      </div>

      <p className="mt-3 text-sm font-black text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function Summary({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-violet-200 bg-violet-100/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 truncate text-base font-black ${
          highlight
            ? "text-violet-800"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}