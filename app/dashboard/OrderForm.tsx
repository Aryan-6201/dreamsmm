"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ChevronDown,
  Search,
  X,
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
  const [selectedPlatform, setSelectedPlatform] = useState("all");

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
const platforms = useMemo(() => {
  const seen = new Map<string, string>();

  services.forEach((service) => {
    const value = service.platform?.trim();
    if (!value) return;
    const key = value.toLowerCase();
    if (!seen.has(key)) seen.set(key, value);
  });

  const preferred = [
    "instagram", "youtube", "telegram", "facebook",
    "tiktok", "twitter", "x", "spotify", "reddit",
  ];

  const sorted = Array.from(seen.entries()).sort((a, b) => {
    const ai = preferred.findIndex((item) => a[0].includes(item));
    const bi = preferred.findIndex((item) => b[0].includes(item));
    if (ai !== -1 && bi === -1) return -1;
    if (ai === -1 && bi !== -1) return 1;
    if (ai !== -1 && bi !== -1 && ai !== bi) return ai - bi;
    return a[1].localeCompare(b[1]);
  });

  return [
    { key: "all", label: "All", platform: "all" },
    ...sorted.map(([key, label]) => ({ key, label, platform: label })),
  ];
}, [services]);

const categories = useMemo(() => {
  const serviceCategories = new Map<string, string>();

  services.forEach((service) => {
    if (
      selectedPlatform !== "all" &&
      service.platform?.trim().toLowerCase() !== selectedPlatform
    ) {
      return;
    }

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
}, [services, categoryConfigs, selectedPlatform]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    services.forEach((service) => {
      if (
        selectedPlatform !== "all" &&
        service.platform?.trim().toLowerCase() !== selectedPlatform
      ) {
        return;
      }

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

  useEffect(() => {
  if (!category && categories.length > 0) {
    setCategory(categories[0]);
  }
}, [categories, category]);

useEffect(() => {
  if (!category) return;

  const firstService = services.find((service) => {
    const serviceCategory =
      service.category?.trim() || "Other";

    return (
      serviceCategory.toLowerCase() ===
      category.toLowerCase()
    );
  });

  if (firstService && serviceId === "") {
    setServiceId(firstService.id);
  }
}, [category, services, serviceId]);

  /* =========================================================
     SERVICES FOR CATEGORY
  ========================================================= */

  const categoryServices = useMemo(() => {
    if (!category) {
      return [];
    }

    return services.filter((service) => {
      if (
        selectedPlatform !== "all" &&
        service.platform?.trim().toLowerCase() !== selectedPlatform
      ) {
        return false;
      }
      const value =
        service.category?.trim() || "Other";

      return (
        value.toLowerCase() ===
        category.toLowerCase()
      );
    });
  }, [services, category, selectedPlatform]);

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
    selectedService && quantityNumber > 0
      ? (quantityNumber / 1000) *
        Number(selectedService.rate)
      : 0;

  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    async function loadDiscount() {
      try {
        const response = await fetch("/api/me", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        const discount = Number(data.user?.discountPercent ?? 0);

        if (Number.isFinite(discount) && discount >= 0 && discount <= 100) {
          setDiscountPercent(discount);
        }
      } catch (error) {
        console.error("Failed to load discount:", error);
      }
    }

    loadDiscount();
  }, []);

  const discountAmount =
    total > 0
      ? total * (discountPercent / 100)
      : 0;

  const discountedTotal = total - discountAmount;

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
      className="block w-full min-w-0 max-w-full space-y-5 overflow-x-hidden box-border"
    >
      {/* =====================================================
          PLATFORM QUICK FILTER
          Click a platform icon to see only its services
      ===================================================== */}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-black text-slate-700">
            Platform
          </label>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {selectedPlatform === "all"
              ? `${services.length} services`
              : `${services.filter(
                  (service) =>
                    service.platform?.trim().toLowerCase() ===
                    selectedPlatform
                ).length} services`}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {platforms.map((item) => {
            const active = selectedPlatform === item.key;
            const BrandIcon =
              item.key === "all"
                ? null
                : getPlatformIcon(item.platform);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setSelectedPlatform(item.key);
                  setCategory("");
                  setServiceId("");
                  setSearch("");
                  setError("");
                  setSuccess("");
                }}
                className={`flex h-11 min-w-0 w-full items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-black transition-colors ${
                  active
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-violet-100 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50"
                }`}
                aria-pressed={active}
                title={item.label}
              >
                {BrandIcon ? (
                  <BrandIcon
                    className="h-4 w-4 shrink-0"
                    style={{
                      color: active
                        ? "#ffffff"
                        : getPlatformColor(item.platform),
                    }}
                  />
                ) : (
                  <Sparkles className="h-4 w-4 shrink-0" />
                )}

                <span className="hidden sm:inline truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500"
          aria-hidden="true"
        >
          <Search className="h-5 w-5" />
        </span>

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search"
          aria-label="Search services"
          className="h-12 w-full rounded-xl border border-violet-100 bg-violet-50 pl-11 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-violet-50 focus:ring-2 focus:ring-violet-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-lg font-bold text-slate-400 hover:bg-white hover:text-slate-700"
          >
            
            <X className="h-4 w-4" />
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

        <div className="relative min-w-0 max-w-full">
          <button
            type="button"
            onClick={() => {
              setCategoryOpen((open) => !open);
              setServiceOpen(false);
            }}
            aria-expanded={categoryOpen}
            className={`group flex min-h-[58px] w-full min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-2xl border bg-white px-4 text-left shadow-[0_8px_24px_rgba(76,29,149,.045)] transition-all duration-200 "border-violet-100 hover:border-violet-200 hover:shadow-[0_10px_28px_rgba(76,29,149,.07)]"`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black shadow-sm ring-1 ring-slate-100">
              {(() => {
                const platform = getCategoryPlatform(
                  category,
                  categoryConfigs,
                  services
                );

                const BrandIcon =
                  getPlatformIcon(platform);
return BrandIcon ? (
                  <BrandIcon
                    className="h-4 w-4"
                    style={{ color: getPlatformColor(platform) }}
                  />
                ) : (
                  <Sparkles className="h-4 w-4" />
                );
              })()}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block min-w-0 max-w-full truncate text-[13px] font-bold leading-5 text-slate-700">
                {category || "Select category"}
              </span>
              {category && (
                <span className="block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  {categoryServices.length} services available
                </span>
              )}
            </span>

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-violet-50">
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  categoryOpen ? "rotate-180 text-violet-500" : ""
                }`}
              />
            </span>
          </button>

          {categoryOpen && (
            <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
              <div className="max-h-[420px] overflow-y-auto overscroll-contain py-1 [scrollbar-width:thin]">
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
                        className={`flex min-h-[54px] w-full items-center gap-2.5 px-4 text-left transition ${
                          active
                            ? "bg-violet-600 text-white"
                            : "text-slate-700 hover:bg-violet-50"
                        }`}
                      >
                        <span
  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-slate-100"
>
  {(() => {
    const platform = getCategoryPlatform(
      item,
      categoryConfigs,
      services
    );

    const BrandIcon = getPlatformIcon(platform);

    return BrandIcon ? (
                          <BrandIcon
                            className="h-4 w-4"
                            style={{
                              color: getPlatformColor(
                                getCategoryPlatform(
                                  item,
                                  categoryConfigs,
                                  services
                                )
                              ),
                            }}
                          />
                        ) : (
                          <Sparkles className="h-4 w-4 text-slate-400" />
                        );
  })()}
</span>
                      

                        <span className="min-w-0 max-w-full flex-1 break-words whitespace-normal text-[13px] font-medium">
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

        <div className="relative min-w-0 max-w-full">
          <button
            type="button"
            disabled={!category}
            onClick={() => {
              if (!category) return;

              setServiceOpen((open) => !open);
              setCategoryOpen(false);
            }}
            aria-expanded={serviceOpen}
            className={`group flex min-h-[58px] w-full min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-2xl border bg-white px-4 text-left shadow-[0_8px_24px_rgba(76,29,149,.045)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
              serviceOpen
                ? "border-violet-300 ring-2 ring-violet-100"
                : "border-violet-100 hover:border-violet-200 hover:shadow-[0_10px_28px_rgba(76,29,149,.07)]"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-700">
              {selectedService
                ? (() => {
                    const BrandIcon = getPlatformIcon(
                      selectedService.platform
                    );

                    return BrandIcon ? (
                      <BrandIcon
                        className="h-[18px] w-[18px]"
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
              <span className="block min-w-0 max-w-full truncate text-[13px] font-bold leading-5 text-slate-700">
                {selectedService?.name ||
                  (category ? "Select service" : "Select category first")}
              </span>

              {selectedService ? (
                <span className="block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  #{selectedService.id} Ã‚Â· Min {selectedService.min.toLocaleString()} Ã‚Â· Max {selectedService.max.toLocaleString()}
                </span>
              ) : (
                <span className="block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  {category
                    ? `${filteredServices.length} services available`
                    : "Choose a category first"}
                </span>
              )}
            </span>

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-violet-50">
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  serviceOpen ? "rotate-180 text-violet-500" : ""
                }`}
              />
            </span>
          </button>

          {serviceOpen &&
            category && (
              <div className="absolute left-0 right-0 z-[60] mt-2 overflow-hidden rounded-2xl border border-violet-100 bg-white p-1.5 shadow-[0_20px_50px_rgba(91,33,182,0.14)]">
                <div className="max-h-[440px] overflow-y-auto overscroll-contain py-1 [scrollbar-width:thin]">
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
                          className={`w-full border-b border-slate-100 px-4 py-3.5 text-left transition last:border-b-0 ${
                            active
                              ? "bg-violet-600 text-white"
                              : "text-slate-700 hover:bg-violet-50"
                          }`}
                        >
                          <div className="flex min-w-0 w-full items-center gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                                active
                                  ? "bg-white/20"
                                  : "bg-violet-50"
                              }`}
                            >
                              {(() => {
                                const BrandIcon =
                                  getPlatformIcon(service.platform);

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
                              })()}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span
                                className={`block break-words text-[12px] font-semibold leading-5 ${
                                  active ? "text-white" : "text-slate-700"
                                }`}
                              >
                                {service.name}
                              </span>

                              <span
                                className={`mt-1 block text-[9px] font-medium ${
                                  active ? "text-white/65" : "text-slate-400"
                                }`}
                              >
                                #{service.id} Ã‚Â· Min {service.min.toLocaleString()} Ã‚Â· Max {service.max.toLocaleString()}
                              </span>
                            </span>

                            <span
                              className={`w-[68px] max-w-[68px] shrink-0 overflow-hidden rounded-xl px-2.5 py-2 text-right ${
                                active
                                  ? "bg-white/15 text-white"
                                  : "bg-violet-50 text-violet-700"
                              }`}
                            >
                              <span className="block text-[8px] font-bold uppercase tracking-wider opacity-60">
                                Rate
                              </span>
                              <span className="block text-[12px] font-black">
                                &#8377;{service.rate}
                              </span>
                              <span className="block text-[7px] font-bold opacity-60">
                                / 1K
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
          <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white">
            <div className="flex items-center justify-between border-b border-violet-100/80 px-4 py-3">
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-600">
                Service information
              </span>
              <span className="rounded-md bg-white px-2 py-1 text-[8px] font-bold text-slate-400 shadow-sm">
                #{selectedService.id}
              </span>
            </div>

            <div className="px-4 py-4">
              <div className="whitespace-pre-wrap break-words text-[11px] font-medium leading-[1.75] text-slate-600">
                {selectedService.description?.trim() ||
                  "No additional service information available."}
              </div>
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
            className="h-12 w-full rounded-xl border border-violet-100 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-violet-50 focus:ring-2 focus:ring-violet-100"
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
            className={`h-12 w-full rounded-xl border bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
              quantity &&
              !validQuantity
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-violet-100 focus:border-violet-300 focus:ring-violet-100"
            }`}
          />

          <p className="mt-2 text-[10px] font-medium text-slate-400">
            Allowed: {selectedService.min.toLocaleString()} Ã¢â‚¬â€œ {selectedService.max.toLocaleString()}
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
          <div className="flex min-h-[56px] items-center justify-between gap-4 rounded-xl border border-violet-100 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(76,29,149,.04)]">
  <div>
    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
      Total charge
    </span>
    {discountPercent > 0 && (
      <p className="mt-1 text-[10px] font-bold text-emerald-600">
        {discountPercent}% discount applied
      </p>
    )}
  </div>

  <div className="text-right">
    {discountPercent > 0 && (
      <p className="text-xs font-semibold text-slate-400 line-through">
        &#8377;{total.toFixed(2)}
      </p>
    )}
    <span className="text-xl font-black tracking-tight text-slate-900">
      &#8377;{discountedTotal.toFixed(2)}
    </span>
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
            ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ {success}
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

  if (value.includes("instagram")) return "#E1306C";
  if (value.includes("youtube")) return "#FF0000";
  if (value.includes("facebook")) return "#1877F2";
  if (value.includes("tiktok")) return "#111111";
  if (value.includes("telegram")) return "#229ED9";
  if (value.includes("twitter") || value === "x") return "#000000";
  if (value.includes("spotify")) return "#1DB954";
  if (value.includes("reddit")) return "#FF4500";
  if (value.includes("linkedin")) return "#0A66C2";
  if (value.includes("discord")) return "#5865F2";
  if (value.includes("twitch")) return "#9146FF";
  if (value.includes("pinterest")) return "#E60023";
  if (value.includes("snapchat")) return "#FFFC00";
  if (value.includes("whatsapp")) return "#25D366";

  return "#64748B";
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











