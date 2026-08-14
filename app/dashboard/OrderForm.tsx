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

type OrderFormProps = {
  services: Service[];
};

function normalize(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function cleanCategory(value: string | null | undefined) {
  const text = (value || "Other").trim().replace(/\s+/g, " ");

  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPlatformIcon(platform: string) {
  const value = normalize(platform);

  if (value.includes("instagram")) return "◎";
  if (value.includes("youtube")) return "▶";
  if (value.includes("tiktok")) return "♪";
  if (value.includes("facebook")) return "f";
  if (value.includes("telegram")) return "➤";
  if (value.includes("twitter") || value === "x") return "𝕏";
  if (value.includes("spotify")) return "●";
  if (value.includes("linkedin")) return "in";
  if (value.includes("snapchat")) return "◆";
  if (value.includes("reddit")) return "r";

  return "✦";
}

function formatRate(rate: string) {
  const value = Number(rate);

  if (!Number.isFinite(value)) return rate;

  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 4,
  });
}

export default function OrderForm({
  services,
}: OrderFormProps) {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Remove exact duplicates.
   */
  const uniqueServices = useMemo(() => {
    const seen = new Set<string>();

    return services.filter((service) => {
      const key = [
        normalize(service.platform),
        normalize(service.category),
        normalize(service.name),
        service.rate,
        service.min,
        service.max,
      ].join("|");

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [services]);

  /*
   * Available platforms.
   */
  const platforms = useMemo(() => {
    const map = new Map<string, string>();

    uniqueServices.forEach((service) => {
      const key = normalize(service.platform);

      if (!map.has(key)) {
        map.set(key, service.platform.trim());
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [uniqueServices]);

  /*
   * Search + platform.
   */
  const filteredByPlatform = useMemo(() => {
    return uniqueServices.filter((service) => {
      if (!platform) return true;

      return (
        normalize(service.platform) ===
        normalize(platform)
      );
    });
  }, [uniqueServices, platform]);

  /*
   * Search.
   */
  const searchedServices = useMemo(() => {
    const query = normalize(search);

    if (!query) return filteredByPlatform;

    return filteredByPlatform.filter((service) => {
      const searchable = [
        service.id,
        service.name,
        service.platform,
        service.category,
        service.description,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [filteredByPlatform, search]);

  /*
   * Categories.
   */
  const categories = useMemo(() => {
    const map = new Map<string, string>();

    searchedServices.forEach((service) => {
      const value = cleanCategory(service.category);
      const key = normalize(value);

      if (!map.has(key)) {
        map.set(key, value);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [searchedServices]);

  /*
   * Services shown in service picker.
   */
  const visibleServices = useMemo(() => {
    if (!category) return searchedServices;

    return searchedServices.filter(
      (service) =>
        normalize(cleanCategory(service.category)) ===
        normalize(category),
    );
  }, [searchedServices, category]);

  /*
   * Selected service.
   */
  const selectedService = useMemo(() => {
    return uniqueServices.find(
      (service) => service.id === selectedId,
    );
  }, [uniqueServices, selectedId]);

  /*
   * Quantity / price.
   */
  const numericQuantity = Number(quantity) || 0;

  const isQuantityValid =
    !!selectedService &&
    numericQuantity >= selectedService.min &&
    numericQuantity <= selectedService.max;

  const charge = selectedService
    ? (numericQuantity / 1000) *
      Number(selectedService.rate)
    : 0;

  /*
   * Select platform.
   */
  function selectPlatform(value: string) {
    setPlatform(value);
    setCategory("");
    setSelectedId(null);
    setCategoryOpen(false);
    setServiceOpen(false);
    setError("");
    setSuccess("");
  }

  /*
   * Select category.
   */
  function selectCategory(value: string) {
    setCategory(value);
    setSelectedId(null);
    setCategoryOpen(false);
    setServiceOpen(false);
    setLink("");
    setQuantity("");
    setError("");
    setSuccess("");
  }

  /*
   * Select service.
   */
  function selectService(service: Service) {
    setSelectedId(service.id);
    setPlatform(service.platform);
    setCategory(cleanCategory(service.category));

    setServiceOpen(false);
    setCategoryOpen(false);

    setLink("");
    setQuantity("");
    setError("");
    setSuccess("");
  }

  /*
   * Clear all.
   */
  function clearFilters() {
    setSearch("");
    setPlatform("");
    setCategory("");
    setSelectedId(null);
    setCategoryOpen(false);
    setServiceOpen(false);
    setError("");
    setSuccess("");
  }

  /*
   * Submit.
   */
  async function submitOrder(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

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

    if (!isQuantityValid) {
      setError(
        `Quantity must be between ${selectedService.min.toLocaleString()} and ${selectedService.max.toLocaleString()}.`,
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
          quantity: numericQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to place the order.",
        );
        return;
      }

      setSuccess(
        `Order #${data.order.id} placed successfully.`,
      );

      setLink("");
      setQuantity("");
    } catch (requestError) {
      console.error(
        "Order request error:",
        requestError,
      );

      setError(
        "Network error. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">

      {/* PREMIUM TOP BAR */}
      <div className="mb-6 flex flex-col gap-4">

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                Services online
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Place an Order
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose a service and configure your order.
            </p>
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-right shadow-sm sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Available
            </p>

            <p className="mt-0.5 text-sm font-black text-slate-800">
              {uniqueServices.length} services
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCategory("");
              setSelectedId(null);
              setError("");
              setSuccess("");
            }}
            placeholder="Search services, packages or service ID..."
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 sm:text-base"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("");
                setSelectedId(null);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-slate-400 hover:text-slate-700"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* PLATFORM CHIPS */}
      <div className="mb-6 overflow-hidden">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
            Platform
          </p>

          {(platform || category || search) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-violet-700 hover:text-violet-900"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => selectPlatform("")}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
              !platform
                ? "border-violet-300 bg-violet-600 text-white shadow-md shadow-violet-200"
                : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
            }`}
          >
            <span>✦</span>
            All
          </button>

          {platforms.map((item) => {
            const active =
              normalize(platform) ===
              normalize(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => selectPlatform(item)}
                className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
                  active
                    ? "border-violet-300 bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
                }`}
              >
                <span className="text-base">
                  {getPlatformIcon(item)}
                </span>

                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* ORDER BUILDER */}
      <div className="overflow-visible rounded-[26px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]">

        {/* HEADER */}
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-lg font-black text-violet-700">
              +
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 sm:text-lg">
                Service Configuration
              </h3>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Select your package and enter the order details.
              </p>
            </div>

          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-7">

          {/* CATEGORY */}
          <div>
            <FieldLabel>
              Category
            </FieldLabel>

            <CustomDropdown
              open={categoryOpen}
              onToggle={() => {
                setCategoryOpen((value) => !value);
                setServiceOpen(false);
              }}
              value={category || "Select category"}
              placeholder={!category}
            >
              <DropdownOption
                active={!category}
                onClick={() => selectCategory("")}
              >
                All Categories
              </DropdownOption>

              {categories.map((item) => (
                <DropdownOption
                  key={item}
                  active={
                    normalize(item) ===
                    normalize(category)
                  }
                  onClick={() =>
                    selectCategory(item)
                  }
                >
                  {item}
                </DropdownOption>
              ))}
            </CustomDropdown>
          </div>

          {/* SERVICE */}
          <div>
            <FieldLabel required>
              Service
            </FieldLabel>

            <CustomDropdown
              open={serviceOpen}
              onToggle={() => {
                setServiceOpen((value) => !value);
                setCategoryOpen(false);
              }}
              value={
                selectedService
                  ? `${selectedService.name}`
                  : "Select service"
              }
              placeholder={!selectedService}
              icon={
                selectedService
                  ? getPlatformIcon(
                      selectedService.platform,
                    )
                  : undefined
              }
            >
              <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {visibleServices.length} matching services
                </p>
              </div>

              {visibleServices.map((service) => {
                const active =
                  selectedService?.id === service.id;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() =>
                      selectService(service)
                    }
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                      active
                        ? "bg-violet-50 ring-1 ring-violet-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-black ${
                        active
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {getPlatformIcon(
                        service.platform,
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold leading-5 text-slate-800">
                        {service.name}
                      </span>

                      <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
                        <span>
                          ID: {service.id}
                        </span>

                        <span>
                          ₹{formatRate(service.rate)} / 1K
                        </span>

                        <span>
                          {service.min.toLocaleString()}–
                          {service.max.toLocaleString()}
                        </span>
                      </span>
                    </span>

                    {active && (
                      <span className="text-sm font-black text-violet-700">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}

              {visibleServices.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-6 text-center">
                  <p className="text-sm font-bold text-slate-700">
                    No services found
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Try another category or search.
                  </p>
                </div>
              )}
            </CustomDropdown>
          </div>

          {/* SELECTED SERVICE */}
          {selectedService && (
            <>
              {/* SERVICE SUMMARY */}
              <div className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50">

                <div className="flex items-start gap-4 p-5">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-lg font-black text-white shadow-lg shadow-violet-200">
                    {getPlatformIcon(
                      selectedService.platform,
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-violet-700 shadow-sm">
                        ID {selectedService.id}
                      </span>

                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
                        ACTIVE
                      </span>
                    </div>

                    <h4 className="mt-2 text-base font-black leading-6 text-slate-900">
                      {selectedService.name}
                    </h4>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {selectedService.platform} ·{" "}
                      {cleanCategory(
                        selectedService.category,
                      )}
                    </p>

                  </div>
                </div>

                <div className="grid grid-cols-3 border-t border-violet-100 bg-white/70">

                  <Metric
                    label="Rate / 1K"
                    value={`₹${formatRate(
                      selectedService.rate,
                    )}`}
                  />

                  <Metric
                    label="Minimum"
                    value={selectedService.min.toLocaleString()}
                  />

                  <Metric
                    label="Maximum"
                    value={selectedService.max.toLocaleString()}
                  />

                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <FieldLabel>
                  Description
                </FieldLabel>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                    {selectedService.description ||
                      "High quality service. Please check the service limits before placing your order."}
                  </p>
                </div>
              </div>

              {/* LINK */}
              <div>
                <FieldLabel required>
                  Link
                </FieldLabel>

                <input
                  type="url"
                  value={link}
                  onChange={(event) =>
                    setLink(event.target.value)
                  }
                  placeholder="https://instagram.com/..."
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              {/* QUANTITY */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <FieldLabel required>
                    Quantity
                  </FieldLabel>

                  <span className="text-xs font-bold text-slate-400">
                    {selectedService.min.toLocaleString()} –{" "}
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
                  className={`h-14 w-full rounded-2xl border bg-slate-50 px-4 text-base font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                    quantity &&
                    !isQuantityValid
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />

                {quantity &&
                  !isQuantityValid && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      Quantity must be between{" "}
                      {selectedService.min.toLocaleString()}{" "}
                      and{" "}
                      {selectedService.max.toLocaleString()}.
                    </p>
                  )}
              </div>

              {/* TIME */}
              <div>
                <FieldLabel>
                  Average Time
                </FieldLabel>

                <div className="flex h-14 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4">
                  <span className="text-sm font-semibold text-slate-500">
                    Provider dependent
                  </span>

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-500">
                    i
                  </span>
                </div>
              </div>

              {/* CHARGE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 shadow-lg shadow-slate-200">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Order total
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {numericQuantity > 0
                        ? `${numericQuantity.toLocaleString()} units`
                        : "Enter quantity"}
                    </p>
                  </div>

                  <p className="text-3xl font-black tracking-tight text-white">
                    ₹{charge.toFixed(2)}
                  </p>
                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-sm font-black text-red-600">
                    !
                  </span>

                  <p className="pt-1 text-sm font-semibold text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-black text-emerald-600">
                    ✓
                  </span>

                  <p className="pt-1 text-sm font-semibold text-emerald-700">
                    {success}
                  </p>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={
                  submitting ||
                  !link.trim() ||
                  !isQuantityValid
                }
                className="group relative h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 text-base font-black text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
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
                </span>

                <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                Your balance will be checked automatically
                when the order is submitted.
              </p>
            </>
          )}

          {/* EMPTY STATE */}
          {!selectedService && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-violet-600 shadow-sm">
                +
              </div>

              <h3 className="mt-4 text-base font-black text-slate-800">
                Select a service to continue
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Choose a platform, category and service
                above. The order details will appear here.
              </p>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-black text-slate-800 sm:text-[15px]">
      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );
}

function CustomDropdown({
  open,
  onToggle,
  value,
  placeholder,
  icon,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  value: string;
  placeholder?: boolean;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm outline-none transition ${
          open
            ? "border-violet-400 ring-4 ring-violet-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          {icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-base font-black text-violet-700">
              {icon}
            </span>
          )}

          <span
            className={`truncate text-sm font-semibold ${
              placeholder
                ? "text-slate-400"
                : "text-slate-800"
            }`}
          >
            {value}
          </span>
        </span>

        <span
          className={`shrink-0 text-lg text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
         ⌄
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[340px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition ${
        active
          ? "bg-violet-50 text-violet-800"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span>{children}</span>

      {active && (
        <span className="font-black text-violet-700">
          ✓
        </span>
      )}
    </button>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-r border-violet-100 px-3 py-3 last:border-r-0 sm:px-4">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-black text-slate-800 sm:text-sm">
        {value}
      </p>
    </div>
  );
}