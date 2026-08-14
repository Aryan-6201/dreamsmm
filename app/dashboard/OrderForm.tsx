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

function normalize(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function categoryName(value: string | null | undefined) {
  const text = (value || "Other").trim().replace(/\s+/g, " ");

  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function platformIcon(platform: string) {
  const key = normalize(platform);

  if (key === "instagram") return "◎";
  if (key === "youtube") return "▶";
  if (key === "tiktok") return "♪";
  if (key === "facebook") return "f";
  if (key === "telegram") return "➤";
  if (key === "twitter" || key === "x") return "𝕏";

  return "✦";
}

export default function OrderForm({
  services,
}: {
  services: Service[];
}) {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Remove exact duplicate services.
   */
  const uniqueServices = useMemo(() => {
    const seen = new Set<string>();

    return services.filter((service) => {
      const key = [
        normalize(service.platform),
        normalize(service.category),
        normalize(service.name),
      ].join("|");

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [services]);

  /*
   * Platforms.
   */
  const platforms = useMemo(() => {
    return Array.from(
      new Map(
        uniqueServices.map((service) => [
          normalize(service.platform),
          service.platform.trim(),
        ]),
      ).values(),
    ).sort();
  }, [uniqueServices]);

  /*
   * Categories for selected platform.
   */
  const categories = useMemo(() => {
    const map = new Map<string, string>();

    uniqueServices.forEach((service) => {
      if (
        platform &&
        normalize(service.platform) !== normalize(platform)
      ) {
        return;
      }

      const label = categoryName(service.category);
      map.set(normalize(label), label);
    });

    return Array.from(map.values()).sort();
  }, [uniqueServices, platform]);

  /*
   * Search + filters.
   */
  const filteredServices = useMemo(() => {
    const query = normalize(search);

    return uniqueServices.filter((service) => {
      if (
        platform &&
        normalize(service.platform) !== normalize(platform)
      ) {
        return false;
      }

      if (
        category &&
        normalize(categoryName(service.category)) !== normalize(category)
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

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
  }, [
    uniqueServices,
    search,
    platform,
    category,
  ]);

  const selectedService = useMemo(() => {
    return uniqueServices.find(
      (service) => service.id === selectedId,
    );
  }, [uniqueServices, selectedId]);

  const quantityNumber = Number(quantity) || 0;

  const quantityValid =
    !!selectedService &&
    quantityNumber >= selectedService.min &&
    quantityNumber <= selectedService.max;

  const totalCharge = selectedService
    ? (quantityNumber / 1000) *
      Number(selectedService.rate)
    : 0;

  function changePlatform(value: string) {
    setPlatform(value);
    setCategory("");
    setSelectedId(null);
    setError("");
    setSuccess("");
  }

  function changeCategory(value: string) {
    setCategory(value);
    setSelectedId(null);
    setError("");
    setSuccess("");
  }

  function selectService(service: Service) {
    setSelectedId(service.id);
    setPlatform(service.platform);
    setCategory(categoryName(service.category));
    setError("");
    setSuccess("");

    window.setTimeout(() => {
      document
        .getElementById("order-details")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  function clearFilters() {
    setSearch("");
    setPlatform("");
    setCategory("");
    setSelectedId(null);
  }

  async function placeOrder(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedService) {
      setError("Please select a package first.");
      return;
    }

    if (!link.trim()) {
      setError("Please enter the target link.");
      return;
    }

    if (!quantityValid) {
      setError(
        `Quantity must be between ${selectedService.min.toLocaleString()} and ${selectedService.max.toLocaleString()}.`,
      );
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
          serviceId: selectedService.id,
          link: link.trim(),
          quantity: quantityNumber,
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
        "Order request failed:",
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
    <div className="space-y-6">

      {/* SEARCH */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-gray-900">
              Find a service
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Search by service name, package, platform,
              category or ID.
            </p>
          </div>

          <span className="hidden text-sm font-semibold text-gray-400 sm:block">
            {filteredServices.length} results
          </span>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-400">
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search Instagram followers, YouTube views, ID 11032..."
            className="h-16 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-14 text-base font-medium text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* FILTERS */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">

        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">
            Platform
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <Filter
              active={!platform}
              onClick={() => changePlatform("")}
            >
              All
            </Filter>

            {platforms.map((item) => (
              <Filter
                key={item}
                active={
                  normalize(platform) ===
                  normalize(item)
                }
                onClick={() =>
                  changePlatform(item)
                }
              >
                <span className="text-base">
                  {platformIcon(item)}
                </span>
                {item}
              </Filter>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-5">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">
              Category
            </p>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <Filter
                active={!category}
                onClick={() => changeCategory("")}
              >
                All categories
              </Filter>

              {categories.map((item) => (
                <Filter
                  key={item}
                  active={
                    normalize(category) ===
                    normalize(item)
                  }
                  onClick={() =>
                    changeCategory(item)
                  }
                >
                  {item}
                </Filter>
              ))}
            </div>
          </div>
        )}

        {(search || platform || category) && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-sm font-bold text-violet-700 hover:text-violet-900"
          >
            Clear all filters
          </button>
        )}
      </section>

      {/* MAIN */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

        {/* PACKAGES */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900">
                Packages
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Select the package you want.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500">
              {filteredServices.length}
            </span>
          </div>

          <div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">
            {filteredServices.map((service) => {
              const active =
                service.id === selectedId;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() =>
                    selectService(service)
                  }
                  className={`w-full rounded-2xl border p-4 text-left transition sm:p-5 ${
                    active
                      ? "border-violet-400 bg-violet-50 shadow-md ring-4 ring-violet-100"
                      : "border-gray-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex gap-4">

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
                        active
                          ? "bg-violet-600 text-white"
                          : "bg-violet-50 text-violet-700"
                      }`}
                    >
                      {platformIcon(
                        service.platform,
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500">
                          ID: {service.id}
                        </span>

                        <span className="text-xs font-bold text-violet-700">
                          {service.platform}
                        </span>

                        <span className="text-xs text-gray-400">
                          {categoryName(
                            service.category,
                          )}
                        </span>
                      </div>

                      <h4 className="mt-2 text-base font-bold leading-6 text-gray-900 sm:text-lg">
                        {service.name}
                      </h4>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span>
                          Min{" "}
                          {service.min.toLocaleString()}
                        </span>

                        <span>
                          Max{" "}
                          {service.max.toLocaleString()}
                        </span>

                        <span className="font-black text-violet-700">
                          ₹{service.rate} / 1K
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-black ${
                        active
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-gray-200 text-transparent"
                      }`}
                    >
                      ✓
                    </div>

                  </div>
                </button>
              );
            })}

            {filteredServices.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-gray-400 shadow-sm">
                  ⌕
                </div>

                <h4 className="mt-4 text-lg font-black text-gray-800">
                  No services found
                </h4>

                <p className="mt-2 text-sm text-gray-500">
                  Try another search or clear your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white"
                >
                  Show all services
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ORDER BUILDER */}
        <section
          id="order-details"
          className="h-fit xl:sticky xl:top-5"
        >
          <form
            onSubmit={placeOrder}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md sm:p-6"
          >

            <div className="border-b border-gray-100 pb-5">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-700">
                Order Summary
              </p>

              <h3 className="mt-1 text-xl font-black text-gray-900">
                Place your order
              </h3>
            </div>

            {!selectedService ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-700">
                  +
                </div>

                <h4 className="mt-5 text-base font-black text-gray-800">
                  Select a package
                </h4>

                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
                  Choose a package from the list and
                  its order details will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5 pt-5">

                {/* SELECTED */}
                <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                  <div className="flex gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-violet-700 shadow-sm">
                      {platformIcon(
                        selectedService.platform,
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-violet-700">
                        ID: {selectedService.id}
                      </p>

                      <p className="mt-1 text-sm font-black leading-5 text-gray-900">
                        {selectedService.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        ₹{selectedService.rate} / 1K
                      </p>
                    </div>

                  </div>
                </div>

                {/* LINK */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Link <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="url"
                    value={link}
                    onChange={(event) =>
                      setLink(event.target.value)
                    }
                    placeholder="https://instagram.com/..."
                    className="h-13 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {/* QUANTITY */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-sm font-bold text-gray-800">
                      Quantity{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <span className="text-xs font-semibold text-gray-500">
                      {selectedService.min.toLocaleString()}{" "}
                      –{" "}
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
                    className={`h-13 w-full rounded-xl border bg-white px-4 text-base font-bold text-gray-900 outline-none placeholder:text-gray-400 focus:ring-4 ${
                      quantity &&
                      !quantityValid
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-violet-500 focus:ring-violet-100"
                    }`}
                  />

                  {quantity &&
                    !quantityValid && (
                      <p className="mt-2 text-xs font-semibold text-red-600">
                        Quantity must be between{" "}
                        {selectedService.min.toLocaleString()}{" "}
                        and{" "}
                        {selectedService.max.toLocaleString()}.
                      </p>
                    )}
                </div>

                {/* PRICE */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">
                      Rate
                    </span>

                    <span className="text-sm font-bold text-gray-800">
                      ₹{selectedService.rate} / 1K
                    </span>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-4">
                    <span className="text-sm font-semibold text-gray-500">
                      Total Charge
                    </span>

                    <span className="text-2xl font-black text-gray-950">
                      ₹{totalCharge.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-semibold text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {/* SUCCESS */}
                {success && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-semibold text-emerald-700">
                      ✓ {success}
                    </p>
                  </div>
                )}

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !link.trim() ||
                    !quantityValid
                  }
                  className="h-14 w-full rounded-xl bg-gradient-to-r from-violet-700 to-indigo-700 text-base font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting
                    ? "Placing Order..."
                    : `Place Order • ₹${totalCharge.toFixed(2)}`}
                </button>

                <p className="text-center text-xs leading-5 text-gray-400">
                  Your balance is checked securely when
                  the order is submitted.
                </p>

              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

function Filter({
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
      className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
        active
          ? "border-violet-300 bg-violet-100 text-violet-900"
          : "border-gray-200 bg-white text-gray-600 hover:border-violet-200 hover:text-violet-800"
      }`}
    >
      {children}
    </button>
  );
}