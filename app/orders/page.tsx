/* =========================================================
   DREAMSMM — ORDERS PAGE
   Screenshot-inspired SMM panel UI
   Existing /api/orders + /api/orders/sync compatible
========================================================= */

"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";

type Order = {
  id: number;
  link: string;
  quantity: number;
  charge: string;
  status: string;
  startCount: number | null;
  remains: number | null;
  providerId: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    name: string;
    platform: string;
    category: string | null;
    refill: boolean | string | null;
  };
};

type OrdersResponse = {
  success: boolean;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
};

const filters = [
  ["ALL", "☷", "All"],
  ["PENDING", "◌", "Pending"],
  ["PROCESSING", "◔", "Processing"],
  ["COMPLETED", "✓", "Completed"],
  ["PARTIAL", "◉", "Partial"],
  ["CANCELLED", "×", "Canceled"],
  ["REFUNDED", "♨", "Refunds"],
] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(
    async (
      nextPage: number,
      nextStatus: string,
      nextSearch: string,
      silent = false,
    ) => {
      if (!silent) setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: "10",
          status: nextStatus,
        });

        if (nextSearch.trim()) {
          params.set("search", nextSearch.trim());
        }

        const response = await fetch(`/api/orders?${params.toString()}`, {
          cache: "no-store",
        });

        const raw = await response.text();

        let data: OrdersResponse;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(
            `Orders API returned an invalid response (${response.status}).`,
          );
        }

        if (!response.ok) {
          throw new Error(data.error || "Unable to load orders.");
        }

        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setPagination(
          data.pagination || {
            page: nextPage,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load orders.",
        );
        if (!silent) setOrders([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadOrders(page, status, search);
  }, [page, status, search, loadOrders]);

  useEffect(() => {
    let stopped = false;

    const syncAndRefresh = async () => {
      if (document.visibilityState !== "visible") return;

      setSyncing(true);

      try {
        await fetch("/api/orders/sync", {
          method: "POST",
          cache: "no-store",
        });
      } catch {
        // Keep the last known orders if provider sync fails.
      }

      if (!stopped) {
        await loadOrders(page, status, search, true);
      }

      if (!stopped) setSyncing(false);
    };

    const interval = window.setInterval(syncAndRefresh, 5000);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [page, status, search, loadOrders]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function changeStatus(nextStatus: string) {
    setStatus(nextStatus);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <Sidebar />

      <div className="min-h-screen md:ml-64">
        <div className="mx-auto max-w-[1600px] px-3 py-3 sm:px-5 lg:px-7 lg:py-5">
          {/* MAIN CARD */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-5">
            {/* SEARCH */}
            <form
              onSubmit={submitSearch}
              className="flex h-[54px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 shadow-inner"
            >
              <div className="flex min-w-0 flex-1 items-center">
                <span className="px-4 text-xl text-slate-400">⌕</span>

                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search"
                  className="h-full min-w-0 flex-1 bg-transparent pr-3 text-base font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="m-1 flex w-[115px] shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-sm font-bold text-white shadow-[0_7px_18px_rgba(20,184,166,0.20)] transition hover:-translate-y-0.5 hover:from-teal-600 hover:to-cyan-600"
              >
                <span className="text-xl">⌕</span>
                Search
              </button>
            </form>

            {/* FILTERS */}
            <div className="mt-4 overflow-x-auto px-0.5 pb-1">
              <div className="flex min-w-max gap-3">
                {filters.map(([value, icon, label]) => {
                  const active = status === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => changeStatus(value)}
                      className={[
                        "flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition",
                        active
                          ? "bg-teal-500 text-white shadow-[0_6px_18px_rgba(20,184,166,0.22)]"
                          : "border-slate-200 bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 hover:shadow-md",
                      ].join(" ")}
                    >
                      <span className="text-base">{icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SMALL META ROW */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <span
                  className={`h-2 w-2 rounded-full ${
                    syncing ? "animate-pulse bg-amber-400" : "bg-emerald-500"
                  }`}
                />
                {syncing ? "Syncing orders..." : "Orders are up to date"}
              </div>

              <div className="text-[11px] font-bold text-slate-400">
                {pagination.total.toLocaleString("en-IN")} total orders
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* TABLE */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
              <table className="w-full min-w-[1120px] table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-teal-100 bg-gradient-to-r from-teal-50/80 via-white to-cyan-50/50">
                    <TableHeader>ID</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Link</TableHeader>
                    <TableHeader>Charge</TableHeader>
                    <TableHeader>Start count</TableHeader>
                    <TableHeader>Quantity</TableHeader>
                    <TableHeader>Service</TableHeader>
                    <TableHeader>Remains</TableHeader>
                    <th className="w-[118px] whitespace-nowrap px-2.5 py-3 text-left text-[13px] font-black text-slate-800">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <LoadingRows />
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-20 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                          ◎
                        </div>
                        <p className="mt-4 text-sm font-black text-slate-600">
                          No orders found
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          Try a different search or status filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {!loading && pagination.totalPages > 1 && (
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold text-slate-400">
                  Page{" "}
                  <span className="font-black text-slate-700">
                    {pagination.page}
                  </span>{" "}
                  of{" "}
                  <span className="font-black text-slate-700">
                    {pagination.totalPages}
                  </span>
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:border-teal-300 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setPage((p) =>
                        Math.min(pagination.totalPages, p + 1),
                      )
                    }
                    className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </section>

          <p className="mt-5 pb-4 text-center text-[9px] font-semibold text-slate-400">
            Orders automatically refresh with the latest provider status.
          </p>
        </div>
      </div>
    </main>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-2.5 py-3 text-left text-[13px] font-black text-slate-800">
      {children}
    </th>
  );
}

function OrderRow({ order }: { order: Order }) {
  const status = normalizeStatus(order.status);

  return (
    <tr className="border-b border-slate-100/90 transition duration-200 hover:bg-teal-50/35">
      <td className="px-2.5 py-4 align-top text-[13px] font-semibold text-slate-700">
        {order.id}
      </td>

      <td className="w-[110px] px-3 py-4 align-top text-[12px] font-medium leading-5 text-slate-600">
        {formatDate(order.createdAt)}
      </td>

      <td className="w-[280px] max-w-[280px] px-2.5 py-4 align-top">
        <a
          href={order.link}
          target="_blank"
          rel="noreferrer"
          className="block break-all text-[13px] font-medium leading-5 text-teal-700 underline decoration-teal-200 underline-offset-2 transition hover:text-teal-900"
        >
          🔗 {order.link}
        </a>
      </td>

      <td className="px-2.5 py-4 align-top text-[13px] font-semibold text-slate-700">
        {order.charge}
      </td>

      <td className="px-2.5 py-4 align-top text-[13px] font-semibold text-slate-700">
        {order.startCount === null
          ? "—"
          : Number(order.startCount).toLocaleString("en-IN")}
      </td>

      <td className="px-2.5 py-4 align-top text-[13px] font-semibold text-slate-700">
        {Number(order.quantity || 0).toLocaleString("en-IN")}
      </td>

      <td className="w-[260px] max-w-[260px] px-2.5 py-4 align-top">
        <div className="break-words whitespace-normal text-[13px] font-semibold leading-5 text-slate-700">
          {order.service?.name || "Unknown service"}
        </div>
      </td>

      <td className="px-2.5 py-4 align-top text-[13px] font-semibold text-slate-700">
        {order.remains === null
          ? "—"
          : Number(order.remains).toLocaleString("en-IN")}
      </td>

      <td className="px-3 py-4 align-top">
        <StatusBadge status={status} />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-[#f4ad18]",
    PROCESSING: "bg-teal-500",
    COMPLETED: "bg-[#19b879]",
    PARTIAL: "bg-[#ed9225]",
    CANCELLED: "bg-[#e84b4b]",
    REFUNDED: "bg-[#6b7280]",
  };

  const labels: Record<string, string> = {
    PENDING: "Pending",
    PROCESSING: "In progress",
    COMPLETED: "Completed",
    PARTIAL: "Partial",
    CANCELLED: "Canceled",
    REFUNDED: "Refunded",
  };

  return (
    <span
      className={`inline-flex min-w-[100px] items-center justify-center rounded-full px-3.5 py-2 text-[11px] font-extrabold text-white shadow-[0_5px_14px_rgba(15,23,42,0.10)] ${
        styles[status] || "bg-slate-500"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, row) => (
        <tr key={row} className="border-b border-slate-100">
          {Array.from({ length: 9 }).map((__, cell) => (
            <td key={cell} className="px-3 py-5">
              <div
                className={`h-3 animate-pulse rounded bg-slate-100 ${
                  cell === 2
                    ? "w-64"
                    : cell === 6
                      ? "w-40"
                      : "w-16"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function normalizeStatus(status: string) {
  return String(status || "PENDING").toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  const datePart = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return (
    <>
      <span className="block">{datePart}</span>
      <span className="block">{timePart}</span>
    </>
  );
}
