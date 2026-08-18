"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  Play,
  Send,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import {
  SiInstagram,
  SiYoutube,
  SiTiktok,
  SiFacebook,
  SiTelegram,
  SiX,
  SiSpotify,
  SiReddit,
} from "react-icons/si";

import type { IconType } from "react-icons";

type CategoryConfig = {
  id: number;
  name: string;
  platform: string;
  icon: string;
  iconStyle: string;
  glowEnabled: boolean;
  glowIntensity: number;
  badge: string | null;
  sortOrder: number;
  enabled: boolean;
};
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
  const [categoryConfigs, setCategoryConfigs] =
    useState<CategoryConfig[]>([]);

  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState<number | "">("");

  const [search, setSearch] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
  async function loadCategoryConfigs() {
    try {
      const response = await fetch("/api/categories", {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok) {
        setCategoryConfigs(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to load category configs:", error);
    }
  }

  loadCategoryConfigs();
}, []);

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
  const serviceCategories = new Map<string, string>();

  services.forEach((service) => {
    const value = service.category?.trim() || "Other";
    const key = value.toLowerCase();

    if (!serviceCategories.has(key)) {
      serviceCategories.set(key, value);
    }
  });

  const configured = categoryConfigs
    .filter((config) => config.name.trim())
    .filter((config) => {
      const key = config.name.trim().toLowerCase();
      return serviceCategories.has(key);
    })
    .sort((a, b) => {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder;
  }

  return a.name.localeCompare(b.name);
});

  const configuredNames = new Set(
    configured.map((config) => config.name.trim().toLowerCase())
  );

  const remaining = Array.from(serviceCategories.values())
    .filter(
      (name) => !configuredNames.has(name.toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b));

  return [
    ...configured.map((config) => config.name.trim()),
    ...remaining,
  ];
}, [services, categoryConfigs]);
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
  const icons = new Map<string, LucideIcon>();

  services.forEach((service) => {
    const categoryName =
      service.category?.trim() || "Other";

    const key = categoryName.toLowerCase();

    if (icons.has(key)) return;

    const config = categoryConfigs.find(
      (item) =>
        item.name.toLowerCase() ===
        categoryName.toLowerCase()
    );

    icons.set(
      key,
      config
        ? getCategoryLucideIcon(config.icon)
        : categoryIcon(categoryName)
    );
  });

  return icons;
}, [services, categoryConfigs]);

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
          
        </span>

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search"
          aria-label="Search services"
          className="h-12 w-full rounded-xl border border-violet-200 bg-violet-50 pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-violet-50 focus:ring-2 focus:ring-violet-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-lg font-bold text-slate-400 hover:bg-violet-100 hover:text-violet-700"
          >
            ×
          </button>
        )}
      </div>

{/* =====================================================
          CATEGORY
      ===================================================== */}

      <section>
        <label className="mb-2 block text-sm font-black text-slate-800">
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
            className="flex min-h-[64px] w-full items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-3 text-left transition hover:bg-violet-100"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 shadow-sm transition-all"
              style={(() => {
                const config = categoryConfigs.find(
                  (item) =>
                    item.name.toLowerCase() ===
                    category.toLowerCase()
                );

                if (!config?.glowEnabled) {
                  return undefined;
                }

                const intensity = Math.max(
                  0,
                  Math.min(100, config.glowIntensity)
                );

                return {
                  boxShadow: `0 0 ${
                    8 + intensity * 0.16
                  }px rgba(34, 211, 238, ${
                    0.12 + intensity * 0.004
                  })`,
                };
              })()}
            >
              {(() => {
                const platform = getCategoryPlatform(
                  category,
                  categoryConfigs,
                  services
                );

                const BrandIcon =
                  getPlatformIcon(platform);

                const config = categoryConfigs.find(
                  (item) =>
                    item.name.toLowerCase() ===
                    category.toLowerCase()
                );

                const intensity = Math.max(
                  0,
                  Math.min(
                    100,
                    config?.glowIntensity ?? 50
                  )
                );

                return BrandIcon ? (
                  <BrandIcon
                    className="h-4 w-4"
                    style={{
                      color: getPlatformColor(platform),
                      filter: config?.glowEnabled
                        ? `drop-shadow(0 0 ${
                            3 + intensity * 0.08
                          }px ${getPlatformColor(platform)})`
                        : undefined,
                    }}
                  />
                ) : (
                  <Sparkles className="h-4 w-4" />
                );
              })()}
            </span>

            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
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
            <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-violet-300 bg-violet-50 shadow-[0_18px_45px_rgba(124,58,237,0.16)]">
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
                            ? "bg-violet-700 text-white"
                            : "text-slate-800 hover:bg-violet-100"
                        }`}
                      >
                        <span
  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-black ${
    active
      ? "bg-white/20 text-white"
      : "bg-violet-50 text-violet-700"
  }`}
>
  {(() => {
    const platform = getCategoryPlatform(
      item,
      categoryConfigs,
      services
    );

    const BrandIcon = getPlatformIcon(platform);

    const config = categoryConfigs.find(
      (itemConfig) =>
        itemConfig.name.toLowerCase() ===
        item.toLowerCase()
    );

    const intensity = Math.max(
      0,
      Math.min(100, config?.glowIntensity ?? 50)
    );

    return BrandIcon ? (
      <BrandIcon
        className="h-4 w-4"
        style={
          config?.glowEnabled
            ? {
                filter: `drop-shadow(0 0 ${
                  3 + intensity * 0.08
                }px rgba(34,211,238,${
                  0.25 + intensity * 0.006
                }))`,
              }
            : undefined
        }
      />
    ) : (
      <Sparkles className="h-4 w-4" />
    );
  })()}
</span>
                      

                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                          {item}
                        </span>

                        {(() => {
                          const config = categoryConfigs.find(
                            (itemConfig) =>
                              itemConfig.name.toLowerCase() ===
                              item.toLowerCase()
                          );

                          return config?.badge ? (
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-black ${
                                active
                                  ? "bg-white/20 text-white"
                                  : "bg-violet-100 text-violet-700"
                              }`}
                            >
                              {config.badge}
                            </span>
                          ) : null;
                        })()}

                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            active
                              ? "bg-white/15 text-white"
                              : "bg-violet-100 text-violet-600"
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
        <label className="mb-2 block text-sm font-black text-slate-800">
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
                ? "border-violet-200 bg-violet-50 hover:bg-violet-100"
                : "cursor-not-allowed border-violet-100 bg-violet-100"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 shadow-sm">
              {selectedService
                ? (() => {
                    const BrandIcon = getPlatformIcon(
                      selectedService.platform
                    );

                    return BrandIcon ? (
                      <BrandIcon
                                      className="h-4 w-4"
                                      style={{
                                        color: getPlatformColor(
                                          selectedService.platform
                                        ),
                                      }}
                                    />
                    ) : (
                      "+"
                    );
                  })()
                : "+"}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
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
          <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-xl border border-violet-300 bg-violet-50 shadow-[0_18px_45px_rgba(124,58,237,0.16)]">
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
                          className={`w-full border-b border-violet-200 px-3 py-2.5 text-left transition last:border-b-0 ${
                            active
                              ? "bg-violet-700 text-white"
                              : "text-slate-800 hover:bg-violet-100"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
                                active
                                  ? "bg-white/20 text-white"
                                  : "bg-violet-50 text-violet-700"
                              }`}
                            >
                              {active ? (
                                "✓"
                              ) : (
                                (() => {
                                  const BrandIcon =
                                    getPlatformIcon(
                                      service.platform
                                    );

                                  return BrandIcon ? (
                                    <BrandIcon
                        className="h-4 w-4"
                        style={{
                          color: getPlatformColor(
                            service.platform
                          ),
                        }}
                      />
                                  ) : (
                                    "+"
                                  );
                                })()
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-start gap-2">
                                <span
                                  className={`min-w-0 flex-1 text-[12px] font-medium leading-5 ${
                                    active
                                      ? "text-white"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {service.name}
                                </span>

                                <span
                                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold ${
                                    active
                                      ? "bg-white/15 text-white"
                                      : "bg-violet-100 text-violet-600"
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
                                      : "bg-violet-100 text-violet-600"
                                  }`}
                                >
                                  Min{" "}
                                  {service.min.toLocaleString()}
                                </span>

                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold ${
                                    active
                                      ? "bg-white/15 text-white/80"
                                      : "bg-violet-100 text-violet-600"
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
          <label className="mb-2 block text-sm font-black text-slate-800">
            Description
          </label>

          <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-4">
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
          <label className="mb-2 block text-sm font-black text-slate-800">
            Link
          </label>

          <input
            type="url"
            value={link}
            onChange={(event) =>
              setLink(event.target.value)
            }
            placeholder="https://instagram.com/username"
            className="h-12 w-full rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-violet-50 focus:ring-2 focus:ring-violet-100"
          />
        </section>
      )}

      {/* =====================================================
          QUANTITY
      ===================================================== */}

      {selectedService && (
        <section>
          <label className="mb-2 block text-sm font-black text-slate-800">
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
            className={`h-12 w-full rounded-xl border bg-violet-50 px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-violet-50 focus:ring-2 ${
              quantity &&
              !validQuantity
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-violet-200 focus:border-violet-300 focus:ring-violet-100"
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
          <label className="mb-2 block text-sm font-black text-slate-800">
            Charge
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Rate
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                &#8377;{selectedService.rate}
                <span className="ml-1 text-[9px] font-semibold text-slate-400">
                  / 1K
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Total
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
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
    className="h-14 w-full rounded-xl bg-violet-600 text-base font-black text-white shadow-[0_10px_28px_rgba(124,58,237,0.30)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-[0_14px_32px_rgba(124,58,237,0.38)] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-violet-200 disabled:text-white disabled:opacity-100 disabled:shadow-none"
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
function getPlatformColor(platform: string): string {
  const value = platform.toLowerCase();

  if (value.includes("instagram")) return "#E4405F";
  if (value.includes("youtube")) return "#FF0000";
  if (value.includes("facebook")) return "#1877F2";
  if (value.includes("tiktok")) return "#25F4EE";
  if (value.includes("telegram")) return "#229ED9";
  if (value.includes("twitter") || value === "x") return "#111111";
  if (value.includes("spotify")) return "#1DB954";
  if (value.includes("reddit")) return "#FF4500";

  return "#7C3AED";
}

function getPlatformIcon(platform: string): IconType | null {
  const value = platform.toLowerCase();

  if (value.includes("instagram")) return SiInstagram;
  if (value.includes("youtube")) return SiYoutube;
  if (value.includes("facebook")) return SiFacebook;
  if (value.includes("tiktok")) return SiTiktok;
  if (value.includes("telegram")) return SiTelegram;
  if (value.includes("twitter") || value === "x") return SiX;
  if (value.includes("spotify")) return SiSpotify;
  if (value.includes("reddit")) return SiReddit;

  return null;
}

function getCategoryPlatform(
  categoryName: string,
  categoryConfigs: CategoryConfig[],
  services: Service[]
) {
  const config = categoryConfigs.find(
    (item) =>
      item.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (config?.platform) {
    return config.platform;
  }

  const service = services.find(
    (item) =>
      (item.category?.trim() || "Other").toLowerCase() ===
      categoryName.toLowerCase()
  );

  return service?.platform || "";
}
/* =========================================================
   CATEGORY ICON
========================================================= */

function categoryIcon(category: string) {
  const value = category.toLowerCase();

  if (value.includes("follower")) return UserPlus;
  if (value.includes("like")) return Heart;
  if (value.includes("view")) return Eye;
  if (value.includes("comment")) return MessageCircle;
  if (value.includes("share")) return Share2;
  if (value.includes("save")) return Bookmark;
  if (value.includes("story")) return Play;
  if (value.includes("subscriber")) return Users;
  if (value.includes("watch")) return Play;
  if (value.includes("traffic")) return Send;
  if (value.includes("member")) return Users;

  return Sparkles;
}
function getCategoryLucideIcon(icon: string): LucideIcon {
  switch (icon.toLowerCase()) {
    case "eye":
      return Eye;
    case "heart":
      return Heart;
    case "messagecircle":
      return MessageCircle;
    case "share2":
      return Share2;
    case "bookmark":
      return Bookmark;
    case "users":
      return Users;
    case "play":
      return Play;
    case "send":
      return Send;
    case "userplus":
      return UserPlus;
    case "sparkles":
    default:
      return Sparkles;
  }
}