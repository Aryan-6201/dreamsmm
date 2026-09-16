"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Discount = {
  id: number;
  userId: string;
  serviceId: number;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  enabled: boolean;
  expiresAt: string | null;
  user: {
    id: string;
    name: string | null;
    username?: string | null;
    email: string;
  };
  service: {
    id: number;
    name: string;
    platform: string;
    rate: string;
  };
};

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
};

type Service = {
  id: number;
  name: string;
  platform: string;
  rate: string;
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [userId, setUserId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [discountRes, userRes, serviceRes] = await Promise.all([
        fetch("/api/admin/discounts", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/services", { cache: "no-store" }),
      ]);

      const discountData = await discountRes.json().catch(() => ({}));
      const userData = await userRes.json().catch(() => ({}));
      const serviceData = await serviceRes.json().catch(() => ({}));

      if (userRes.ok && Array.isArray(userData.users)) {
        setUsers(userData.users);
      }

      if (serviceRes.ok && Array.isArray(serviceData.services)) {
        setServices(serviceData.services);
      }

      if (discountRes.ok && Array.isArray(discountData.discounts)) {
        setDiscounts(discountData.discounts);
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createDiscount(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!userId || !serviceId || !value) {
      setMessage("Select a user, service and discount value.");
      return;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setMessage("Enter a valid discount value.");
      return;
    }

    if (type === "PERCENTAGE" && numericValue > 100) {
      setMessage("Percentage cannot be more than 100%.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          serviceId: Number(serviceId),
          type,
          value: numericValue,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not save discount.");
        return;
      }

      setMessage("Discount saved successfully.");
      setValue("");
      setExpiresAt("");
      await loadData();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleDiscount(discount: Discount) {
    try {
      const response = await fetch(`/api/admin/discounts/${discount.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !discount.enabled,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not update discount.");
        return;
      }

      await loadData();
    } catch {
      setMessage("Could not update discount.");
    }
  }

  async function deleteDiscount(id: number) {
    if (!confirm("Delete this discount permanently?")) return;

    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not delete discount.");
        return;
      }

      setMessage("Discount deleted.");
      await loadData();
    } catch {
      setMessage("Could not delete discount.");
    }
  }

  const filteredServices = services.filter((service) =>
    `${service.id} ${service.name} ${service.platform}`
      .toLowerCase()
      .includes(serviceSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 text-slate-900">

      {/* TOP BAR */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-violet-200"
            >
              D
            </Link>

            <div>
              <p className="text-lg font-black tracking-tight">
                Dream<span className="text-violet-600">SMM</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">
                Admin Console
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-700 p-6 text-white shadow-xl shadow-violet-200/70 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-violet-100">
                Pricing Control
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                User Service Discounts
              </h1>

              <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-violet-100">
                Give individual customers a special price on specific services
                without changing the price for everyone else.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-200">
                Active discounts
              </p>
              <p className="mt-1 text-2xl font-black">
                {discounts.filter((d) => d.enabled).length}
              </p>
            </div>
          </div>
        </section>

        {/* CREATE CARD */}
        <section className="mt-7 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">

          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-xl text-violet-700 ring-1 ring-violet-100">
              %
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950">
                Create Discount
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                This discount applies only to the selected user and service.
              </p>
            </div>
          </div>

          <form onSubmit={createDiscount} className="mt-7">

            <div className="grid gap-5 lg:grid-cols-2">

              {/* USER */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Customer
                </label>

                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Select customer</option>

                  {users
                    .filter((user) => user.role !== "ADMIN")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                </select>

                <p className="mt-2 text-[11px] text-slate-400">
                  {users.filter((u) => u.role !== "ADMIN").length} customers available
                </p>
              </div>

              {/* SERVICE */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Service
                </label>

                <div className="mt-2 space-y-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-slate-400">
                      ⌕
                    </span>

                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="Search service by name, ID or platform..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </div>

                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="">Select service</option>

                    {filteredServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        #{service.id} — {service.name} · {service.platform}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="mt-2 text-[11px] text-slate-400">
                  {filteredServices.length} of {services.length} services shown
                </p>
              </div>

              {/* TYPE */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Discount Type
                </label>

                <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
                  <button
                    type="button"
                    onClick={() => setType("PERCENTAGE")}
                    className={`rounded-lg px-4 py-2.5 text-sm font-black transition ${
                      type === "PERCENTAGE"
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Percentage %
                  </button>

                  <button
                    type="button"
                    onClick={() => setType("FIXED")}
                    className={`rounded-lg px-4 py-2.5 text-sm font-black transition ${
                      type === "FIXED"
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Fixed ₹
                  </button>
                </div>
              </div>

              {/* VALUE */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Discount Value
                </label>

                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-4 grid place-items-center text-sm font-black text-violet-600">
                    {type === "PERCENTAGE" ? "%" : "₹"}
                  </span>

                  <input
                    type="number"
                    min="0"
                    max={type === "PERCENTAGE" ? 100 : undefined}
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === "PERCENTAGE" ? "10" : "5"}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

              {/* EXPIRY */}
              <div className="lg:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Expiry <span className="font-medium normal-case">(optional)</span>
                </label>

                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Discount"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserId("");
                  setServiceId("");
                  setValue("");
                  setExpiresAt("");
                  setMessage("");
                }}
                className="h-12 rounded-xl bg-slate-100 px-6 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Clear
              </button>
            </div>

            {message && (
              <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700">
                {message}
              </div>
            )}
          </form>
        </section>

        {/* DISCOUNT LIST */}
        <section className="mt-7 rounded-3xl border border-slate-200/80 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Existing Discounts
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Manage user-specific pricing rules.
              </p>
            </div>

            <button
              onClick={loadData}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm font-medium text-slate-500">
              Loading discounts...
            </div>
          ) : discounts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
                %
              </div>
              <h3 className="mt-4 text-sm font-black text-slate-900">
                No discounts yet
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Create your first user-specific service discount above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Service</th>
                    <th className="px-5 py-4">Discount</th>
                    <th className="px-5 py-4">Expires</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {discounts.map((discount) => (
                    <tr
                      key={discount.id}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-violet-50/30"
                    >
                      <td className="px-5 py-5">
                        <div className="font-bold text-slate-900">
                          {discount.user.name || discount.user.email}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">
                          {discount.user.email}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="max-w-[280px] truncate text-sm font-bold text-slate-800">
                          {discount.service.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">
                          #{discount.service.id} · {discount.service.platform}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-xl bg-violet-50 px-3 py-2 text-sm font-black text-violet-700 ring-1 ring-violet-100">
                          {discount.type === "PERCENTAGE"
                            ? `${discount.value}% OFF`
                            : `₹${discount.value} OFF`}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-xs font-medium text-slate-500">
                        {discount.expiresAt
                          ? new Date(discount.expiresAt).toLocaleString()
                          : "No expiry"}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black ${
                            discount.enabled
                              ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                              : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                          }`}
                        >
                          {discount.enabled ? "ACTIVE" : "DISABLED"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleDiscount(discount)}
                            className="rounded-lg bg-violet-50 px-3 py-2 text-[11px] font-black text-violet-700 transition hover:bg-violet-100"
                          >
                            {discount.enabled ? "Disable" : "Enable"}
                          </button>

                          <button
                            onClick={() => deleteDiscount(discount.id)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-black text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}


