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

function cleanCategory(value: string | null | undefined) {
  const text = (value || "Other").trim().replace(/\s+/g, " ");

  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function platformIcon(platform: string) {
  const value = normalize(platform);

  if (value === "instagram") return "📷";
  if (value === "youtube") return "▶️";
  if (value === "tiktok") return "♪";
  if (value === "facebook") return "f";
  if (value === "telegram") return "➤";
  if (value === "twitter" || value === "x") return "𝕏";

  return "✦";
}

export default function OrderForm({
  services,
}: {
  services: Service[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState("");

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
   * Search.
   */
  const searchResults = useMemo(() => {
    const query = normalize(search);

    if (!query) {
      return uniqueServices;
    }

    return uniqueServices.filter((service) => {
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
  }, [uniqueServices, search]);

  /*
   * Categories.
   */
  const categories = useMemo(() => {
    const map = new Map<string, string>();

    searchResults.forEach((service) => {
      const label = cleanCategory(service.category);
      map.set(normalize(label), label);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [searchResults]);

  /*
   * Services visible under selected category.
   */
  const categoryServices = useMemo(() => {
    if (!category) {
      return searchResults;
    }

    return searchResults.filter(
      (service) =>
        normalize(cleanCategory(service.category)) ===
        normalize(category),
    );
  }, [searchResults, category]);

  /*
   * Selected service.
   */
  const selectedService = useMemo(() => {
    return uniqueServices.find(
      (service) => String(service.id) === serviceId,
    );
  }, [uniqueServices, serviceId]);

  /*
   * Quantity / charge.
   */
  const quantityNumber = Number(quantity) || 0;

  const quantityValid =
    !!selectedService &&
    quantityNumber >= selectedService.min &&
    quantityNumber <= selectedService.max;

  const charge = selectedService
    ? (quantityNumber / 1000) *
      Number(selectedService.rate)
    : 0;

  function handleCategoryChange(value: string) {
    setCategory(value);
    setServiceId("");
    setLink("");
    setQuantity("");
    setError("");
    setSuccess("");
  }

  function handleServiceChange(value: string) {
    setServiceId(value);
    setLink("");
    setQuantity("");
    setError("");
    setSuccess("");
  }

  function handleSearch(value: string) {
    setSearch(value);
    setCategory("");
    setServiceId("");
    setError("");
    setSuccess("");
  }

  async function handleSubmit(
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
      setError("Please enter the link.");
      return;
    }

    if (!quantityValid) {
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
          quantity: quantityNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to place order.",
        );
        return;
      }

      setSuccess(
        `Order #${data.order.id} placed successfully.`,
      );

      setLink("");
      setQuantity("");
    } catch (error) {
      console.error("Order error:", error);

      setError(
        "Network error. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-3xl space-y-5"
    >

      {/* SEARCH */}
      <div>
        <label className="mb-2 block text-base font-bold text-gray-800">
          Search Service
        </label>

        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
            🔍
          </span>

          <input
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
            placeholder="Search service, package or ID..."
            className="h-14 w-full rounded-xl border border-gray-200 bg-[#f5faf9] pl-11 pr-11 text-base text-gray-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY */}
      <div>
        <label className="mb-2 block text-base font-bold text-gray-800">
          Category
        </label>

        <div className="relative">
          <select
            value={category}
            onChange={(event) =>
              handleCategoryChange(event.target.value)
            }
            className="h-14 w-full appearance-none rounded-xl border border-gray-200 bg-[#f5faf9] px-4 pr-11 text-base font-medium text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            <option value="">
              All Categories
            </option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            ▾
          </span>
        </div>
      </div>

      {/* SERVICE */}
      <div>
        <label className="mb-2 block text-base font-bold text-gray-800">
          Service <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <select
            value={serviceId}
            onChange={(event) =>
              handleServiceChange(event.target.value)
            }
            className="h-14 w-full appearance-none rounded-xl border border-gray-200 bg-[#f5faf9] px-4 pr-11 text-base font-medium text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            <option value="">
              Select a service
            </option>

            {categoryServices.map((service) => (
              <option
                key={service.id}
                value={service.id}
              >
                ID:{service.id} — {service.name}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            ▾
          </span>
        </div>
      </div>

      {/* DESCRIPTION */}
      {selectedService && (
        <div>
          <label className="mb-2 block text-base font-bold text-gray-800">
            Description
          </label>

          <div className="rounded-xl border border-gray-200 bg-[#f5faf9] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
                {platformIcon(
                  selectedService.platform,
                )}
              </span>

              <div>
                <p className="text-sm font-bold text-gray-800">
                  {selectedService.name}
                </p>

                <p className="text-xs text-gray-500">
                  ID: {selectedService.id}
                </p>
              </div>
            </div>

            <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
              {selectedService.description ||
                "High quality service. Please check the minimum and maximum quantity before placing your order."}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Info
                label="Platform"
                value={selectedService.platform}
              />

              <Info
                label="Category"
                value={cleanCategory(
                  selectedService.category,
                )}
              />

              <Info
                label="Min"
                value={selectedService.min.toLocaleString()}
              />

              <Info
                label="Max"
                value={selectedService.max.toLocaleString()}
              />
            </div>
          </div>
        </div>
      )}

      {/* LINK */}
      <div>
        <label className="mb-2 block text-base font-bold text-gray-800">
          Link <span className="text-red-500">*</span>
        </label>

        <input
          type="url"
          value={link}
          onChange={(event) =>
            setLink(event.target.value)
          }
          disabled={!selectedService}
          placeholder={
            selectedService
              ? "https://instagram.com/..."
              : "Select a service first"
          }
          className="h-14 w-full rounded-xl border border-gray-200 bg-[#f5faf9] px-4 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {/* QUANTITY */}
      <div>
        <label className="mb-2 block text-base font-bold text-gray-800">
          Quantity <span className="text-red-500">*</span>
        </label>

        <input
          type="number"
          min={selectedService?.min || undefined}
          max={selectedService?.max || undefined}
          value={quantity}
          onChange={(event) =>
            setQuantity(event.target.value)
          }
          disabled={!selectedService}
          placeholder={
            selectedService
              ? "Enter quantity"
              : "Select a service first"
          }
          className={`h-14 w-full rounded-xl border bg-[#f5faf9] px-4 text-base font-medium text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            quantity &&
            selectedService &&
            !quantityValid
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 focus:border-violet-400 focus:ring-violet-100"
          }`}
        />

        {selectedService && (
          <p className="mt-2 text-sm font-medium text-gray-500">
            Min: {selectedService.min.toLocaleString()}{" "}
            - Max:{" "}
            {selectedService.max.toLocaleString()}
          </p>
        )}
      </div>

      {/* AVERAGE TIME */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-base font-bold text-gray-800">
          Average Time

          <span
            title="Average processing time depends on the provider."
            className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-xs font-bold text-white"
          >
            i
          </span>
        </label>

        <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-[#f5faf9] px-4 text-base text-gray-500">
          Provider dependent
        </div>
      </div>

      {/* CHARGE */}
      <div>
        <label className="mb-2 block text-base font-bold text-gray-800">
          Charge
        </label>

        <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-[#f5faf9] px-4 text-lg font-bold text-gray-800">
          ₹{charge.toFixed(2)}
        </div>

        {selectedService && (
          <p className="mt-2 text-sm text-gray-500">
            ₹{selectedService.rate} per 1,000
          </p>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
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
          !selectedService ||
          !link.trim() ||
          !quantityValid
        }
        className="h-14 w-full rounded-xl bg-[#58c6cf] text-base font-black text-white shadow-sm transition hover:bg-[#46b8c1] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {submitting
          ? "Placing Order..."
          : "Submit"}
      </button>

    </form>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white p-2.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-gray-700">
        {value}
      </p>
    </div>
  );
}