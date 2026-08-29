/* =========================================================
   DREAMSMM — ULTRA PREMIUM ORDERS PAGE
   Light UI • Responsive • Existing /api/orders compatible
========================================================= */

"use client";

import { useEffect, useMemo, useState } from "react";
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

const statuses = [
  ["ALL", "All orders"],
  ["PENDING", "Pending"],
  ["PROCESSING", "Processing"],
  ["COMPLETED", "Completed"],
  ["PARTIAL", "Partial"],
  ["CANCELLED", "Cancelled"],
  ["REFUNDED", "Refunded"],
] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function loadOrders(nextPage = page, nextStatus = status, nextSearch = search) {
    setLoading(true);
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
        console.error("Orders API returned non-JSON:", raw);
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
      setError(err instanceof Error ? err.message : "Unable to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders(page, status, search);
    // Intentionally reload only when page/status changes.
    // Search is submitted manually.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    loadOrders(1, status, search);
  }

  function clearSearch() {
    setSearch("");
    setPage(1);
    loadOrders(1, status, "");
  }

  const stats = useMemo(() => {
    const active = orders.filter(
      (order) =>
        order.status === "PENDING" ||
        order.status === "PROCESSING",
    ).length;

    const completed = orders.filter(
      (order) => order.status === "COMPLETED",
    ).length;

    const totalCharge = orders.reduce(
      (sum, order) => sum + Number(order.charge || 0),
      0,
    );

    return {
      active,
      completed,
      totalCharge,
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <Sidebar />

      <div className="min-h-screen md:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          {/* =====================================================
              HERO
          ====================================================== */}
          <section className="relative overflow-hidden rounded-[32px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/80 to-indigo-50/70 p-5 shadow-[0_20px_70px_rgba(79,70,229,0.10)] sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-600">
                      Order center
                    </span>
                  </div>

                  <h1 className="mt-4 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">
                    My Orders
                  </h1>

                  <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500">
                    Track your orders, monitor delivery progress, and quickly
                    inspect the details of every purchase.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <HeroStat
                    label="Showing"
                    value={String(orders.length)}
                    icon="◌"
                  />
                  <HeroStat
                    label="Active"
                    value={String(stats.active)}
                    icon="↗"
                  />
                  <HeroStat
                    label="Completed"
                    value={String(stats.completed)}
                    icon="✓"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              SEARCH + FILTERS
          ====================================================== */}
          <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-4">
            <form
              onSubmit={submitSearch}
              className="flex flex-col gap-3 lg:flex-row"
            >
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order ID, service or target link..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 text-xs font-black text-white shadow-[0_10px_25px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(99,102,241,0.30)]"
              >
                Search Orders
              </button>
            </form>

            <div className="mt-3 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2">
                {statuses.map(([value, label]) => {
                  const active = status === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setStatus(value);
                        setPage(1);
                      }}
                      className={`rounded-xl border px-4 py-2.5 text-[10px] font-black transition ${
                        active
                          ? "border-violet-200 bg-violet-50 text-violet-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-600"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* =====================================================
              QUICK SUMMARY
          ====================================================== */}
          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Total orders"
              value={String(pagination.total)}
              description="Across your account"
              icon="◎"
            />
            <SummaryCard
              label="On this page"
              value={String(orders.length)}
              description="Currently displayed"
              icon="▦"
            />
            <SummaryCard
              label="Active orders"
              value={String(stats.active)}
              description="Pending or processing"
              icon="↻"
            />
            <SummaryCard
              label="Page charges"
              value={`₹${stats.totalCharge.toFixed(2)}`}
              description="Visible orders only"
              icon="₹"
            />
          </section>

          {/* =====================================================
              ERROR
          ====================================================== */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-black">
                !
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* =====================================================
              ORDER LIST
          ====================================================== */}
          <section className="mt-5">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                  Order history
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  Your recent orders
                </h2>
              </div>

              {!loading && pagination.total > 0 && (
                <p className="text-[10px] font-bold text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              )}
            </div>

            {loading ? (
              <LoadingState />
            ) : orders.length === 0 ? (
              <EmptyState hasSearch={Boolean(search.trim()) || status !== "ALL"} />
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    expanded={expandedId === order.id}
                    onToggle={() =>
                      setExpandedId((current) =>
                        current === order.id ? null : order.id,
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* =====================================================
              PAGINATION
          ====================================================== */}
          {!loading && pagination.totalPages > 1 && (
            <section className="mt-5 flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="px-2 text-[10px] font-bold text-slate-400">
                Showing page{" "}
                <span className="font-black text-slate-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-black text-slate-700">
                  {pagination.totalPages}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-2.5 text-[10px] font-black text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((value) => value + 1)}
                  className="flex-1 rounded-xl bg-violet-600 px-5 py-2.5 text-[10px] font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none"
                >
                  Next →
                </button>
              </div>
            </section>
          )}

          <p className="mt-6 pb-4 text-center text-[9px] font-semibold text-slate-400">
            Orders update according to the latest information available from
            your account.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   HERO STAT
========================================================= */

function HeroStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="min-w-[82px] rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black text-violet-500">{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-black tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="group rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_14px_35px_rgba(99,102,241,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-[10px] font-semibold text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-600 transition group-hover:bg-violet-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ORDER CARD
========================================================= */

function OrderCard({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const platform = order.service?.platform || "Other";
  const category = order.service?.category || "Other";
  const status = normalizeStatus(order.status);

  return (
    <article
      className={`overflow-hidden rounded-[26px] border bg-white shadow-[0_10px_35px_rgba(15,23,42,0.045)] transition ${
        expanded
          ? "border-violet-200 shadow-[0_16px_45px_rgba(99,102,241,0.10)]"
          : "border-slate-200 hover:border-violet-200 hover:shadow-[0_14px_40px_rgba(99,102,241,0.08)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 text-left sm:p-5"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 text-lg font-black text-violet-600 ring-1 ring-violet-100 sm:h-14 sm:w-14">
            {platformIcon(platform)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="min-w-0 truncate text-sm font-black text-slate-900 sm:text-base">
                {order.service?.name || "Unknown service"}
              </h3>

              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[8px] font-black text-slate-500">
                #{order.id}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-violet-50 px-2 py-1 text-[9px] font-bold text-violet-600">
                {platform}
              </span>

              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                {category}
              </span>

              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-base font-black text-slate-900">
              ₹{Number(order.charge || 0).toFixed(2)}
            </p>

            <p className="mt-1 text-[9px] font-bold text-slate-400">
              {Number(order.quantity || 0).toLocaleString()} units
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoPill
            label="Quantity"
            value={Number(order.quantity || 0).toLocaleString()}
          />
          <InfoPill
            label="Start"
            value={
              order.startCount === null
                ? "—"
                : Number(order.startCount).toLocaleString()
            }
          />
          <InfoPill
            label="Remaining"
            value={
              order.remains === null
                ? "—"
                : Number(order.remains).toLocaleString()
            }
          />
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
              Status
            </p>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[9px] font-semibold text-slate-400">
            {order.link}
          </p>

          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${
              expanded
                ? "border-violet-200 bg-violet-50 text-violet-600"
                : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            {expanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 pb-5 pt-4 sm:px-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
                Target link
              </p>

              <p className="mt-2 break-all text-xs font-semibold leading-5 text-slate-600">
                {order.link}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <DetailRow
                  label="Order ID"
                  value={`#${order.id}`}
                />
                <DetailRow
                  label="Provider ID"
                  value={order.providerId || "Not assigned"}
                />
                <DetailRow
                  label="Created"
                  value={formatDate(order.createdAt)}
                />
                <DetailRow
                  label="Updated"
                  value={formatDate(order.updatedAt)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
                Order summary
              </p>

              <div className="mt-4 space-y-3">
                <DetailRow
                  label="Quantity"
                  value={Number(order.quantity || 0).toLocaleString()}
                  light
                />
                <DetailRow
                  label="Start count"
                  value={
                    order.startCount === null
                      ? "—"
                      : Number(order.startCount).toLocaleString()
                  }
                  light
                />
                <DetailRow
                  label="Remaining"
                  value={
                    order.remains === null
                      ? "—"
                      : Number(order.remains).toLocaleString()
                  }
                  light
                />

                <div className="border-t border-violet-100 pt-3">
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-violet-500">
                      Charge
                    </span>
                    <span className="text-xl font-black text-violet-800">
                      ₹{Number(order.charge || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   INFO PILL
========================================================= */

function InfoPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
  light = false,
}: {
  label: string;
  value: string;
  light?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`text-[9px] font-bold ${
          light ? "text-violet-500" : "text-slate-400"
        }`}
      >
        {label}
      </span>

      <span
        className={`max-w-[65%] truncate text-right text-[10px] font-black ${
          light ? "text-violet-800" : "text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(status: string) {
  return String(status || "PENDING").toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:
      "border-amber-200 bg-amber-50 text-amber-700",
    PROCESSING:
      "border-blue-200 bg-blue-50 text-blue-700",
    COMPLETED:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    PARTIAL:
      "border-orange-200 bg-orange-50 text-orange-700",
    CANCELLED:
      "border-red-200 bg-red-50 text-red-700",
    REFUNDED:
      "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[8px] font-black uppercase tracking-wider ${
        styles[status] ||
        "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[26px] border border-slate-200 bg-white p-5"
        >
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-100" />

            <div className="flex-1">
              <div className="h-4 w-2/3 rounded bg-slate-100" />
              <div className="mt-3 h-3 w-1/3 rounded bg-slate-100" />

              <div className="mt-5 grid grid-cols-4 gap-2">
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-10 rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl font-black text-violet-500">
        ◎
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-900">
        {hasSearch ? "No matching orders" : "No orders yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-5 text-slate-400">
        {hasSearch
          ? "Try a different search term or switch the status filter."
          : "Your orders will appear here after you place your first order."}
      </p>
    </div>
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
  if (value.includes("spotify")) return "◉";
  if (value.includes("linkedin")) return "in";
  if (value.includes("reddit")) return "●";

  return "✦";
}

/* =========================================================
   DATE
========================================================= */

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}