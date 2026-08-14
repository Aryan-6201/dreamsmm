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
  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState<number | "">("");

  const [search, setSearch] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     CATEGORIES
     ---------------------------------------------------------
     Categories are intentionally independent of platform.
     This matches the reference UI: the user chooses the
     service category first, then chooses a service.
  ========================================================= */

  const categories = useMemo(() => {
    const map = new Map<string, string>();

    services.forEach((service) => {
      const value = service.category?.trim() || "Other";
      const key = value.toLowerCase();

      if (!map.has(key)) {
        map.set(key, value);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [services]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    services.forEach((service) => {
      const value = service.category?.trim() || "Other";
      const key = value.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return counts;
  }, [services]);

  const categoryIcons = useMemo(() => {
    const icons = new Map<string, string>();

    services.forEach((service) => {
      const categoryName =
        service.category?.trim() || "Other";
      const key = categoryName.toLowerCase();

      if (!icons.has(key)) {
        icons.set(
          key,
          platformIcon(service.platform)
        );
      }
    });

    return icons;
  }, [services]);

  const categoryQuery = search.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!categoryQuery) {
      return categories;
    }

    return categories.filter((item) => {
      if (item.toLowerCase().includes(categoryQuery)) {
        return true;
      }

      return services.some((service) => {
        const categoryName =
          service.category?.trim() || "Other";

        if (
          categoryName.toLowerCase() !==
          item.toLowerCase()
        ) {
          return false;
        }

        return (
          service.name
            .toLowerCase()
            .includes(categoryQuery) ||
          String(service.id).includes(categoryQuery) ||
          service.platform
            .toLowerCase()
            .includes(categoryQuery)
        );
      });
    });
  }, [
    categories,
    categoryQuery,
    services,
  ]);

  /* =========================================================
     SERVICES FOR CATEGORY
  ========================================================= */

  const categoryServices = useMemo(() => {
    if (!category) {
      return [];
    }

    return services.filter((service) => {
      const value =
        service.category?.trim() || "Other";

      return (
        value.toLowerCase() ===
        category.toLowerCase()
      );
    });
  }, [services, category]);

  const filteredServices = useMemo(() => {
    if (!categoryQuery) {
      return categoryServices;
    }

    return categoryServices.filter((service) => {
      return (
        service.name
          .toLowerCase()
          .includes(categoryQuery) ||
        String(service.id)
          .includes(categoryQuery) ||
        service.platform
          .toLowerCase()
          .includes(categoryQuery) ||
        (service.description || "")
          .toLowerCase()
          .includes(categoryQuery)
      );
    });
  }, [
    categoryServices,
    categoryQuery,
  ]);

  const selectedService = useMemo(() => {
    return services.find(
      (service) => service.id === serviceId
    );
  }, [services, serviceId]);

  const quantityNumber =
    Number(quantity) || 0;

  const validQuantity =
    !!selectedService &&
    quantityNumber >= selectedService.min &&
    quantityNumber <= selectedService.max;

  const total =
    selectedService &&
    quantityNumber > 0
      ? (quantityNumber / 1000) *
        Number(selectedService.rate)
      : 0;

  /* =========================================================
     SELECT CATEGORY
  ========================================================= */

  function selectCategory(value: string) {
    setCategory(value);
    setServiceId("");
    setSearch("");
    setError("");
    setSuccess("");
    setCategoryOpen(false);
    setServiceOpen(false);
  }

  /* =========================================================
     SELECT SERVICE
  ========================================================= */

  function selectService(id: number) {
    setServiceId(id);
    setError("");
    setSuccess("");
    setServiceOpen(false);
    setSearch("");
  }

  /* =========================================================
     EXISTING ORDER SUBMIT LOGIC
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
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

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to place your order."
        );
        return;
      }

      setSuccess(
        `Order #${data.order.id} placed successfully.`
      );

      setLink("");
      setQuantity("");
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500"
          aria-hidden="true"
        >
          ⌕
        </span>

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search"
          aria-label="Search services"
          className="h-12 w-full rounded-xl border border-slate-200 bg-[#eaf6f6] pl-11 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-lg font-bold text-slate-400 hover:bg-white hover:text-slate-700"
          >
            ×
          </button>
        )}
      </div>

      {/* =====================================================
          CATEGORY
      ===================================================== */}

      <section>
        <label className="mb-2 block text-sm font-black text-slate-700">
          Category
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setCategoryOpen((open) => !open);
              setServiceOpen(false);
            }}
            aria-expanded={categoryOpen}
            className="flex min-h-[50px] w-full items-center gap-3 rounded-xl border border-cyan-100 bg-[#dff1f1] px-3 text-left transition hover:bg-[#d8eeee]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-black text-cyan-700 shadow-sm">
              {category
                ? categoryIcon(category)
                : "+"}
            </span>

            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
              {category || "Select category"}
            </span>

            <span
              className={`shrink-0 text-sm font-black text-slate-400 transition-transform ${
                categoryOpen
                  ? "rotate-180"
                  : ""
              }`}
            >
              ▼
            </span>
          </button>

          {categoryOpen && (
            <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
              <div className="max-h-[320px] overflow-y-auto overscroll-contain py-1 [scrollbar-width:thin]">
                {filteredCategories.map(
                  (item) => {
                    const key =
                      item.toLowerCase();
                    const active =
                      key ===
                      category.toLowerCase();

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          selectCategory(item)
                        }
                        className={`flex min-h-[44px] w-full items-center gap-2.5 px-3 text-left transition ${
                          active
                            ? "bg-[#63c9d0] text-white"
                            : "text-slate-700 hover:bg-[#edf9f9]"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-black ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-[#eaf6f6] text-cyan-700"
                          }`}
                        >
                          {categoryIcons.get(
                            key
                          ) ||
                            categoryIcon(
                              item
                            )}
                        </span>

                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                          {item}
                        </span>

                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            active
                              ? "bg-white/15 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {categoryCounts.get(
                            key
                          ) || 0}
                        </span>
                      </button>
                    );
                  }
                )}

                {filteredCategories.length ===
                  0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm font-bold text-slate-600">
                      No category found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Try another search.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          SERVICE
      ===================================================== */}

      <section>
        <label className="mb-2 block text-sm font-black text-slate-700">
          Service
        </label>

        <div className="relative">
          <button
            type="button"
            disabled={!category}
            onClick={() => {
              if (!category) return;

              setServiceOpen(
                (open) => !open
              );
              setCategoryOpen(false);
            }}
            aria-expanded={serviceOpen}
            className={`flex min-h-[50px] w-full items-center gap-3 rounded-xl border px-3 text-left transition ${
              category
                ? "border-cyan-100 bg-[#dff1f1] hover:bg-[#d8eeee]"
                : "cursor-not-allowed border-slate-200 bg-slate-100"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-cyan-700 shadow-sm">
              {selectedService
                ? platformIcon(
                    selectedService.platform
                  )
                : "+"}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-700">
                {selectedService
                  ? selectedService.name
                  : category
                    ? "Select service"
                    : "Select category first"}
              </span>

              {selectedService && (
                <span className="mt-0.5 block truncate text-[9px] font-medium text-slate-400">
                  #{selectedService.id}
                  {" · "}
                  {selectedService.platform}
                </span>
              )}
            </span>

            <span
              className={`shrink-0 text-sm font-black text-slate-400 transition-transform ${
                serviceOpen
                  ? "rotate-180"
                  : ""
              }`}
            >
              ▼
            </span>
          </button>

          {serviceOpen &&
            category && (
              <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                <div className="max-h-[360px] overflow-y-auto overscroll-contain py-1 [scrollbar-width:thin]">
                  {filteredServices.map(
                    (service) => {
                      const active =
                        service.id ===
                        serviceId;

                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() =>
                            selectService(
                              service.id
                            )
                          }
                          className={`w-full border-b border-slate-100 px-3 py-2.5 text-left transition last:border-b-0 ${
                            active
                              ? "bg-[#63c9d0] text-white"
                              : "text-slate-700 hover:bg-[#edf9f9]"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
                                active
                                  ? "bg-white/20 text-white"
                                  : "bg-[#eaf6f6] text-cyan-700"
                              }`}
                            >
                              {active
                                ? "✓"
                                : platformIcon(
                                    service.platform
                                  )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-start gap-2">
                                <span
                                  className={`min-w-0 flex-1 text-[12px] font-medium leading-5 ${
                                    active
                                      ? "text-white"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {service.name}
                                </span>

                                <span
                                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold ${
                                    active
                                      ? "bg-white/15 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  #{service.id}
                                </span>
                              </span>

                              <span className="mt-1.5 flex flex-wrap gap-1.5">
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold ${
                                    active
                                      ? "bg-white/15 text-white/80"
                                      : "bg-slate-50 text-slate-400"
                                  }`}
                                >
                                  Min{" "}
                                  {service.min.toLocaleString()}
                                </span>

                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold ${
                                    active
                                      ? "bg-white/15 text-white/80"
                                      : "bg-slate-50 text-slate-400"
                                  }`}
                                >
                                  Max{" "}
                                  {service.max.toLocaleString()}
                                </span>

                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[8px] font-bold ${
                                    active
                                      ? "bg-white/15 text-white"
                                      : "bg-emerald-50 text-emerald-600"
                                  }`}
                                >
                                  &#8377;{service.rate}/1K
                                </span>
                              </span>
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}

                  {filteredServices.length ===
                    0 && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm font-bold text-slate-600">
                        No service found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try another search or category.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </section>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      {selectedService && (
        <section>
          <label className="mb-2 block text-sm font-black text-slate-700">
            Description
          </label>

          <div className="rounded-xl border border-cyan-100 bg-[#e7f5f5] px-4 py-4">
            <div className="whitespace-pre-wrap break-words text-[11px] font-medium leading-5 text-slate-600">
              {selectedService.description ||
                "No description available."}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          LINK
      ===================================================== */}

      {selectedService && (
        <section>
          <label className="mb-2 block text-sm font-black text-slate-700">
            Link
          </label>

          <input
            type="url"
            value={link}
            onChange={(event) =>
              setLink(event.target.value)
            }
            placeholder="https://instagram.com/username"
            className="h-12 w-full rounded-xl border border-cyan-100 bg-[#eaf6f6] px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          />
        </section>
      )}

      {/* =====================================================
          QUANTITY
      ===================================================== */}

      {selectedService && (
        <section>
          <label className="mb-2 block text-sm font-black text-slate-700">
            Quantity
          </label>

          <input
            type="number"
            min={selectedService.min}
            max={selectedService.max}
            value={quantity}
            onChange={(event) =>
              setQuantity(
                event.target.value
              )
            }
            placeholder="Enter quantity"
            className={`h-12 w-full rounded-xl border bg-[#eaf6f6] px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
              quantity &&
              !validQuantity
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-cyan-100 focus:border-cyan-300 focus:ring-cyan-100"
            }`}
          />

          <p className="mt-2 text-xs font-medium text-slate-500">
            Min:{" "}
            {selectedService.min.toLocaleString()}
            {" - "}
            Max:{" "}
            {selectedService.max.toLocaleString()}
          </p>

          {quantity &&
            !validQuantity && (
              <p className="mt-1 text-xs font-bold text-red-600">
                Quantity must be between{" "}
                {selectedService.min.toLocaleString()}{" "}
                and{" "}
                {selectedService.max.toLocaleString()}.
              </p>
            )}
        </section>
      )}

      {/* =====================================================
          RATE / CHARGE
      ===================================================== */}

      {selectedService && (
        <section>
          <label className="mb-2 block text-sm font-black text-slate-700">
            Charge
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-cyan-100 bg-[#eaf6f6] px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Rate
              </p>
              <p className="mt-1 text-sm font-black text-slate-700">
                &#8377;{selectedService.rate}
                <span className="ml-1 text-[9px] font-semibold text-slate-400">
                  / 1K
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-cyan-100 bg-[#eaf6f6] px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Total
              </p>
              <p className="mt-1 text-sm font-black text-slate-700">
                &#8377;{total.toFixed(2)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          FEEDBACK
      ===================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-bold text-red-700">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-bold text-emerald-700">
            ✓ {success}
          </p>
        </div>
      )}

      {/* =====================================================
          ORDER BUTTON
      ===================================================== */}

      {selectedService && (
        <button
          type="submit"
          disabled={
            submitting ||
            !link.trim() ||
            !validQuantity
          }
          className="h-12 w-full rounded-xl bg-[#5fc7ce] text-sm font-black text-white shadow-[0_8px_22px_rgba(54,180,190,0.22)] transition hover:bg-[#50bbc3] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting
            ? "Placing Order..."
            : "Place Order"}
        </button>
      )}
    </form>
  );
}

/* =========================================================
   PLATFORM ICON
========================================================= */

function platformIcon(platform: string) {
  const value = platform.toLowerCase();

  if (value.includes("instagram")) return "IG";
  if (value.includes("youtube")) return "YT";
  if (value.includes("facebook")) return "FB";
  if (value.includes("tiktok")) return "TK";
  if (value.includes("telegram")) return "TG";
  if (value.includes("twitter") || value === "x") return "X";
  if (value.includes("spotify")) return "SP";
  if (value.includes("linkedin")) return "IN";
  if (value.includes("reddit")) return "RD";

  return "+";
}
/* =========================================================
   CATEGORY ICON
========================================================= */

function categoryIcon(category: string) {
  const value = category.toLowerCase();

  if (value.includes("follower")) return "F";
  if (value.includes("like")) return "L";
  if (value.includes("view")) return "V";
  if (value.includes("comment")) return "C";
  if (value.includes("share")) return "S";
  if (value.includes("save")) return "SV";
  if (value.includes("story")) return "ST";
  if (value.includes("subscriber")) return "SUB";
  if (value.includes("watch")) return "W";
  if (value.includes("traffic")) return "TR";
  if (value.includes("member")) return "M";

  return "+";
}


