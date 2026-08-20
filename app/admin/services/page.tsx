"use client";

import { useEffect, useState } from "react";

type Service = {
  id: number;
  name: string;
  platform: string;
  category: string | null;
  description: string | null;
  rate: string;
  min: number;
  max: number;
  enabled: boolean;
  refill: boolean;
  providerId: string | null;
  providerName: string | null;
};
type Category = {
  id: number;
  name: string;
  platform: string;
  enabled: boolean;
  sortOrder: number;
};

type ImportedProviderService = {
  averageTime?: string | number | null;
  service: string;
  name: string;
  type?: string;
  category?: string;
  description?: string;
  rate: string;
  min: number;
  max: number;
  refill?: boolean | string;
};

type FormState = {
  name: string;
  platform: string;
  category: string;
  description: string;
  rate: string;
  min: string;
  max: string;
  enabled: boolean;
  refill: boolean;
  providerId: string;
  providerName: string;
};

const emptyForm: FormState = {
  name: "",
  platform: "",
  category: "",
  description: "",
  rate: "",
  min: "",
  max: "",
  enabled: true,
  refill: false,
  providerId: "",
  providerName: "",
};

const inputClass =
  "w-full rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-blue-500/40";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryPlatform, setNewCategoryPlatform] = useState("Other");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const [providerServiceId, setProviderServiceId] = useState("");
  const [providerMarkup, setProviderMarkup] = useState("");
  const [providerAutoSync, setProviderAutoSync] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importedService, setImportedService] =
    useState<ImportedProviderService | null>(null);

  async function loadServices() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/services", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load services.");
      }

      setServices(data.services || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load services."
      );
    } finally {
      setLoading(false);
    }
  }
  async function loadCategories() {
  try {
    const response = await fetch("/api/categories", {
      cache: "no-store",
    });

    const data = await response.json();

    if (response.ok) {
      setCategories(data.categories || []);
    }
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

useEffect(() => {
  loadServices();
  loadCategories();
}, []);

  async function createCategory() {
    const name = newCategoryName.trim();

    if (!name) {
      setMessage("Enter a category name.");
      return;
    }

    try {
      const response = await fetch("/api/categories/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          platform: newCategoryPlatform,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create category.");
      }

      setCategories((current) => [...current, data.category]);
      updateForm("category", data.category.name);
      setNewCategoryName("");
      setShowCreateCategory(false);
      setMessage("Category created successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create category."
      );
    }
  }
  function updateForm<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(service: Service) {
    setEditingId(service.id);

    setForm({
      name: service.name,
      platform: service.platform,
      category: service.category || "",
      description: service.description || "",
      rate: service.rate,
      min: String(service.min),
      max: String(service.max),
      enabled: service.enabled,
      refill: service.refill,
      providerId: service.providerId || "",
      providerName: service.providerName || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function fetchProviderService() {
    const serviceId = providerServiceId.trim();

    if (!serviceId) {
      setMessage("Enter a MicoSMM service ID first.");
      return;
    }

    setImporting(true);
    setMessage("");
    setImportedService(null);

    try {
      const response = await fetch("/api/admin/micosmm-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "fetch",
          serviceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch provider service.");
      }

      setImportedService(data.service);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to fetch provider service."
      );
    } finally {
      setImporting(false);
    }
  }

  async function importProviderService() {
    if (!importedService) return;

    const markup = Number(providerMarkup);

    if (!Number.isFinite(markup) || markup < 0) {
      setMessage("Enter a valid markup percentage.");
      return;
    }

    setImporting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/micosmm-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "import",
          serviceId: importedService.service,
          markupPercent: markup,
          autoSync: providerAutoSync,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to import provider service.");
      }

      setMessage(
        `Service #${data.service.id} imported successfully at Ã¢â€šÂ¹${data.service.rate}/1k.`
      );
      setProviderServiceId("");
      setProviderMarkup("");
      setImportedService(null);
      await loadServices();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to import provider service."
      );
    } finally {
      setImporting(false);
    }
  }
  const [vipsmmService, setVipsmmService] =
    useState<ImportedProviderService | null>(null);
  const [vipsmmServiceId, setVipsmmServiceId] = useState("");
  const [vipsmmMarkup, setVipsmmMarkup] = useState("25");
  const [vipsmmAutoSync, setVipsmmAutoSync] = useState(true);
  const [vipsmmImporting, setVipsmmImporting] = useState(false);
  const [vipsmmResult, setVipsmmResult] = useState("");

  async function fetchVipsmmService() {
    const serviceId = vipsmmServiceId.trim();

    if (!serviceId) {
      setMessage("Enter a VIPSMMPro service ID first.");
      return;
    }

    setVipsmmImporting(true);
    setMessage("");
    setVipsmmService(null);

    try {
      const response = await fetch("/api/admin/services/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "fetch",
          serviceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to fetch VIPSMMPro service."
        );
      }

      setVipsmmService({ ...data.service, averageTime: data.service.average_time ?? null });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to fetch VIPSMMPro service."
      );
    } finally {
      setVipsmmImporting(false);
    }
  }

  async function importVipsmmService() {
    if (!vipsmmService) return;

    const markup = Number(vipsmmMarkup);

    if (!Number.isFinite(markup) || markup < 0 || markup > 1000) {
      setMessage("Enter a valid markup percentage.");
      return;
    }

    setVipsmmImporting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/services/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "import",
          serviceId: vipsmmService.service,
          markupPercent: markup,
          autoSync: vipsmmAutoSync,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to import VIPSMMPro service."
        );
      }

      setMessage("VIPSMMPro service imported successfully.");
      setVipsmmServiceId("");
      setVipsmmMarkup("");
      setVipsmmService(null);

      await loadServices();
      await loadCategories();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to import VIPSMMPro service."
      );
    } finally {
      setVipsmmImporting(false);
    }
  }
  async function saveService(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        platform: form.platform,
        category: form.category,
        description: form.description,
        rate: form.rate,
        min: form.min,
        max: form.max,
        enabled: form.enabled,
        refill: form.refill,
        providerId: form.providerId,
        providerName: form.providerName,
      };

      const response = await fetch("/api/admin/services", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? {
                id: editingId,
                ...payload,
              }
            : payload
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save service."
        );
      }

      setMessage(
        editingId
          ? `Service #${editingId} updated successfully.`
          : `Service #${data.service.id} created successfully.`
      );

      resetForm();
      await loadServices();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save service."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleService(service: Service) {
    setMessage("");

    try {
      const response = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: service.id,
          enabled: !service.enabled,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update service."
        );
      }

      await loadServices();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update service."
      );
    }
  }

  async function syncOrders() {
    setSyncing(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders/sync", {
        method: "POST",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to sync orders.");
      }

      setMessage(
        `Order sync complete. Checked ${data.checked}, updated ${data.updated}, failed ${data.failed}.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sync orders."
      );
    } finally {
      setSyncing(false);
    }
  }

  async function deleteService(service: Service) {
    const confirmed = window.confirm(
      `Delete "${service.name}"? This only works if the service has no orders.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/services?id=${service.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to delete service."
        );
      }

      setMessage(`Service #${service.id} deleted.`);

      await loadServices();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete service."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#070a11] text-white">
      <header className="border-b border-white/[0.07] bg-[#090c14]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Dream<span className="text-blue-500">SMM</span>
            </h1>

            <p className="text-[11px] text-gray-500">
              Administration Panel
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-400 ring-1 ring-blue-500/20">
            A
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Admin Panel
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              Service Management
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Manage services and provider configuration.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={syncOrders}
              disabled={syncing}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {syncing ? "Syncing..." : "Sync Orders"}
            </button>

            <button
              onClick={loadServices}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              className="ml-4 text-blue-400 hover:text-white"
            >
              ÃƒÆ’Ã¢â‚¬â€
            </button>
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-blue-500/[0.04] p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Import from MicoSMM</h3>
            <p className="mt-1 text-xs text-gray-500">
              Enter only the provider service ID. Details are fetched automatically.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <input
              value={providerServiceId}
              onChange={(e) => setProviderServiceId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchProviderService();
              }}
              className={inputClass}
              placeholder="MicoSMM Service ID e.g. 12345"
              inputMode="numeric"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={providerMarkup}
              onChange={(e) => setProviderMarkup(e.target.value)}
              className={inputClass}
              placeholder="Markup %"
            />

            <button
              type="button"
              onClick={fetchProviderService}
              disabled={importing}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {importing ? "Fetching..." : "Fetch Service"}
            </button>
          </div>

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={providerAutoSync}
              onChange={(e) => setProviderAutoSync(e.target.checked)}
            />
            Automatically update my selling price when provider rate changes
          </label>

          {importedService && (
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">
                    {importedService.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Provider ID #{importedService.service}
                    {importedService.category
                      ? ` Ã‚Â· ${importedService.category}`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={importProviderService}
                  disabled={importing}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {importing ? "Importing..." : "Add Service"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">Provider Rate</p>
                  <p className="mt-1 text-sm font-semibold text-gray-200">
                    Ã¢â€šÂ¹{importedService.rate}/1k
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">Your Markup</p>
                  <p className="mt-1 text-sm font-semibold text-violet-300">
                    {providerMarkup || "0"}%
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">Selling Rate</p>
                  <p className="mt-1 text-sm font-semibold text-green-300">
                    Ã¢â€šÂ¹{(
                      Number(importedService.rate) *
                      (1 + (Number(providerMarkup) || 0) / 100)
                    ).toFixed(4)}
                    /1k
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-[10px] text-gray-600">Average Time</p>
                <p className="mt-1 text-sm font-semibold text-blue-300">
                  {vipsmmService?.averageTime || "N/A"}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">Limits</p>
                  <p className="mt-1 text-sm font-semibold text-gray-200">
                    {importedService.min.toLocaleString()}Ã¢â‚¬â€œ
                    {importedService.max.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>


        <section className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Import from VIPSMMPro
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Enter only the VIPSMMPro service ID. Details are fetched automatically.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <input
              type="number"
              min="0"
              value={vipsmmServiceId}
              onChange={(e) => setVipsmmServiceId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchVipsmmService();
              }}
              className={inputClass}
              placeholder="VIPSMMPro Service ID e.g. 12345"
              inputMode="numeric"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={vipsmmMarkup}
              onChange={(e) => setVipsmmMarkup(e.target.value)}
              className={inputClass}
              placeholder="Markup %"
            />

            <button
              type="button"
              onClick={fetchVipsmmService}
              disabled={vipsmmImporting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {vipsmmImporting ? "Fetching..." : "Fetch Service"}
            </button>
          </div>

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={vipsmmAutoSync}
              onChange={(e) => setVipsmmAutoSync(e.target.checked)}
            />
            Automatically update my selling price when provider rate changes
          </label>

          {vipsmmService && (
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">
                    {vipsmmService.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Provider ID #{vipsmmService.service}
                    {vipsmmService.category
                      ? ` Â· ${vipsmmService.category}`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={importVipsmmService}
                  disabled={vipsmmImporting}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {vipsmmImporting ? "Importing..." : "Add Service"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">
                    Provider Rate
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-200">
                    â‚¹{vipsmmService.rate}/1k
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">
                    Your Markup
                  </p>
                  <p className="mt-1 text-sm font-semibold text-violet-300">
                    {vipsmmMarkup || "0"}%
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">
                    Selling Rate
                  </p>
                  <p className="mt-1 text-sm font-semibold text-green-300">
                    â‚¹{(
                      Number(vipsmmService.rate) *
                      (1 + (Number(vipsmmMarkup) || 0) / 100)
                    ).toFixed(4)}
                    /1k
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">
                    Average Time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-300">
                    {vipsmmService.averageTime || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">
                    Average Time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-300">
                    {vipsmmService.averageTime || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-[10px] text-gray-600">
                    Limits
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-200">
                    {Number(vipsmmService.min).toLocaleString()}â€“
                    {Number(vipsmmService.max).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {vipsmmResult && (
            <div className="mt-4 rounded-xl bg-blue-500/10 px-4 py-3 text-xs text-blue-300">
              {vipsmmResult}
            </div>
          )}
        </section>
        <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
          <section className="h-fit rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingId
                    ? `Edit Service #${editingId}`
                    : "Add Service"}
                </h3>

                <p className="mt-1 text-xs text-gray-600">
                  Provider ID is the provider's service ID.
                </p>
              </div>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-xs text-gray-500 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            <form
              onSubmit={saveService}
              className="mt-5 space-y-4"
            >
              <Field label="Service Name">
                <input
                  value={form.name}
                  onChange={(e) =>
                    updateForm("name", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Instagram Followers"
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Platform">
                  <input
                    value={form.platform}
                    onChange={(e) =>
                      updateForm("platform", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Instagram"
                    required
                  />
                </Field>

 <Field label="Category">
  <div className="flex gap-2">
    <select
      value={form.category}
      onChange={(e) => updateForm("category", e.target.value)}
      className={inputClass}
    >
      <option value="">Select category</option>

      {categories.map((category) => (
        <option key={category.id} value={category.name}>
          {category.name}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={() => setShowCreateCategory((value) => !value)}
      className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/[0.08]"
    >
      + New
    </button>
  </div>

  {showCreateCategory && (
    <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/20 p-3">
      <input
        type="text"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") createCategory();
        }}
        className={inputClass}
        placeholder="Enter new category name"
      />

      <div className="mt-2 flex gap-2">
        <select
          value={newCategoryPlatform}
          onChange={(e) => setNewCategoryPlatform(e.target.value)}
          className={inputClass}
        >
          <option value="Instagram">Instagram</option>
          <option value="YouTube">YouTube</option>
          <option value="TikTok">TikTok</option>
          <option value="Facebook">Facebook</option>
          <option value="Telegram">Telegram</option>
          <option value="Twitter">Twitter</option>
          <option value="Spotify">Spotify</option>
          <option value="Reddit">Reddit</option>
          <option value="Other">Other</option>
        </select>

        <button
          type="button"
          onClick={createCategory}
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500"
        >
          Create
        </button>
      </div>
    </div>
  )}
</Field>
              </div>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                  className={`${inputClass} min-h-20 resize-none`}
                  placeholder="Service description..."
                />
              </Field>

              <Field label="Rate per 1,000">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={form.rate}
                  onChange={(e) =>
                    updateForm("rate", e.target.value)
                  }
                  className={inputClass}
                  placeholder="25"
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Minimum">
                  <input
                    type="number"
                    min="1"
                    value={form.min}
                    onChange={(e) =>
                      updateForm("min", e.target.value)
                    }
                    className={inputClass}
                    placeholder="100"
                    required
                  />
                </Field>

                <Field label="Maximum">
                  <input
                    type="number"
                    min="1"
                    value={form.max}
                    onChange={(e) =>
                      updateForm("max", e.target.value)
                    }
                    className={inputClass}
                    placeholder="100000"
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Provider Name">
                  <input
                    value={form.providerName}
                    onChange={(e) =>
                      updateForm(
                        "providerName",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    placeholder="Provider A"
                  />
                </Field>

                <Field label="Provider Service ID">
                  <input
                    value={form.providerId}
                    onChange={(e) =>
                      updateForm(
                        "providerId",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    placeholder="12345"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-3">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) =>
                      updateForm(
                        "enabled",
                        e.target.checked
                      )
                    }
                  />

                  <span className="text-xs text-gray-300">
                    Enabled
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-3">
                  <input
                    type="checkbox"
                    checked={form.refill}
                    onChange={(e) =>
                      updateForm(
                        "refill",
                        e.target.checked
                      )
                    }
                  />

                  <span className="text-xs text-gray-300">
                    Refill
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Service"
                    : "Create Service"}
              </button>
            </form>
          </section>

          <section>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                Services
              </h3>

              <p className="mt-1 text-xs text-gray-600">
                {services.length} service
                {services.length === 1 ? "" : "s"} in database
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-12 text-center text-sm text-gray-500">
                Loading services...
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c1019] p-12 text-center">
                <p className="font-semibold text-gray-300">
                  No services yet
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Create your first service using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <article
                    key={service.id}
                    className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5 transition hover:border-white/[0.12]"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-blue-400">
                            #{service.id}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              service.enabled
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {service.enabled
                              ? "Enabled"
                              : "Disabled"}
                          </span>

                          {service.refill && (
                            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                              Refill
                            </span>
                          )}
                        </div>

                        <h4 className="mt-2 font-semibold text-gray-200">
                          {service.name}
                        </h4>

                        <p className="mt-1 text-xs text-gray-500">
                          {service.platform}
                          {service.category
                            ? ` Ãƒâ€šÃ‚Â· ${service.category}`
                            : ""}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                          <span className="rounded-lg bg-black/20 px-2 py-1 text-gray-500">
                            Rate ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹{service.rate}/1k
                          </span>

                          <span className="rounded-lg bg-black/20 px-2 py-1 text-gray-500">
                            {service.min.toLocaleString()}ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“
                            {service.max.toLocaleString()}
                          </span>

                          <span className="rounded-lg bg bg-pink-300:/20 px-2 py-1 text-gray-500">
                            {service.providerName ||
                              "No provider"}

                            {service.providerId
                              ? ` Ãƒâ€šÃ‚Â· ID ${service.providerId}`
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() =>
                            toggleService(service)
                          }
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300 hover:bg-white/[0.08]"
                        >
                          {service.enabled
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          onClick={() =>
                            startEdit(service)
                          }
                          className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteService(service)
                          }
                          className="rounded-xl border border-red-500/20 bg-red-500/[0.05] px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}










