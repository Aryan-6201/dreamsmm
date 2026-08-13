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
];

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

  async function loadOrders(nextPage = page) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: "10",
        status,
      });

      if (search.trim()) {
        params.set("search", search.trim());
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
    `Orders API returned an invalid response (${response.status}).`
  );
}

if (!response.ok) {
  throw new Error(data.error || "Unable to load orders.");
}
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    loadOrders(1);
  }

  const stats = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === "PENDING" || order.status === "PROCESSING"
    ).length;

    const completed = orders.filter(
      (order) => order.status === "COMPLETED"
    ).length;

    return { pending, completed };
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <Sidebar />

      <div className="md:ml-64 p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[30px] border border-white/[0.07] bg-gradient-to-br from-violet-500/[0.10] via-white/[0.025] to-transparent p-6 sm:p-8">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.10] blur-[90px]" />

            <div className="relative">
              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-violet-300/60">
                Order center
              </p>

              <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-3xl font-black tracking-[-0.04em]">
                    My Orders
                  </h1>
                  <p className="mt-2 max-w-xl text-[10px] leading-5 text-gray-500">
                    Track every order, its progress, quantity and current status
                    from one place.
                  </p>
                </div>

                <div className="flex gap-2">
                  <MiniStat label="Showing" value={String(orders.length)} />
                  <MiniStat label="Active" value={String(stats.pending)} />
                  <MiniStat label="Done" value={String(stats.completed)} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-3 backdrop-blur-xl">
            <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order ID, service or target link..."
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-black/20 pl-10 pr-4 text-[10px] text-white outline-none placeholder:text-gray-700 focus:border-violet-400/25"
                />
              </div>

              <button
                type="submit"
                className="h-11 rounded-xl bg-violet-500/10 px-5 text-[9px] font-bold text-violet-200 transition hover:bg-violet-500/20"
              >
                Search
              </button>
            </form>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {statuses.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setStatus(value);
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-[8px] font-bold transition ${
                    status === value
                      ? "border-violet-400/20 bg-violet-400/10 text-violet-200"
                      : "border-white/[0.05] bg-black/10 text-gray-600 hover:text-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-[9px] font-semibold text-red-300">
              {error}
            </div>
          )}

          <div className="mt-5">
            {loading ? (
              <LoadingState />
            ) : orders.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          {!loading && pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-xl border border-white/[0.06] px-4 py-2 text-[8px] font-bold text-gray-500 disabled:opacity-25"
              >
                ← Previous
              </button>

              <span className="text-[8px] text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-xl border border-white/[0.06] px-4 py-2 text-[8px] font-bold text-gray-500 disabled:opacity-25"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.035]">
      <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-violet-400/70 via-indigo-500/30 to-transparent opacity-60" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.07] text-sm text-violet-200">
            {platformIcon(order.service.platform)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] font-black text-violet-300">
                #{order.id}
              </span>
              <StatusBadge status={order.status} />
            </div>

            <h2 className="mt-2 line-clamp-2 text-xs font-black text-gray-200">
              {order.service.name}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[8px] text-gray-600">
              <span>{order.service.platform}</span>
              {order.service.category && (
                <>
                  <span>•</span>
                  <span>{order.service.category}</span>
                </>
              )}
              <span>•</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>

            <p className="mt-2 max-w-xl truncate text-[8px] text-gray-700">
              {order.link}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/[0.05] bg-black/15 p-3 sm:max-w-md lg:min-w-[360px]">
          <Metric label="Quantity" value={order.quantity.toLocaleString()} />
          <Metric label="Charge" value={`₹${order.charge}`} />
          <Metric
            label="Remaining"
            value={
              order.remains === null
                ? "—"
                : order.remains.toLocaleString()
            }
          />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:
      "border-amber-400/15 bg-amber-400/[0.07] text-amber-300",
    PROCESSING:
      "border-blue-400/15 bg-blue-400/[0.07] text-blue-300",
    COMPLETED:
      "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300",
    PARTIAL:
      "border-orange-400/15 bg-orange-400/[0.07] text-orange-300",
    CANCELLED:
      "border-red-400/15 bg-red-400/[0.07] text-red-300",
    REFUNDED:
      "border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-300",
  };

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[7px] font-bold uppercase tracking-[0.08em] ${
        styles[status] || "border-white/[0.06] bg-white/[0.03] text-gray-500"
      }`}
    >
      {status.toLowerCase()}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-gray-700">
        {label}
      </p>
      <p className="mt-1 truncate text-[9px] font-black text-gray-300">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/15 px-3 py-2">
      <p className="text-[6px] uppercase tracking-[0.15em] text-gray-700">
        {label}
      </p>
      <p className="mt-1 text-xs font-black text-gray-300">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-32 animate-pulse rounded-[24px] border border-white/[0.05] bg-white/[0.02]"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.02] p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-black/20 text-gray-600">
        ◇
      </div>
      <h2 className="mt-5 text-sm font-black text-gray-400">
        No orders found
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-[9px] leading-5 text-gray-700">
        Your orders will appear here after you place your first order.
      </p>
    </div>
  );
}

function platformIcon(platform: string) {
  const icons: Record<string, string> = {
    instagram: "◎",
    youtube: "▶",
    facebook: "f",
    tiktok: "♪",
    telegram: "➤",
    twitter: "𝕏",
    x: "𝕏",
  };

  return icons[platform.toLowerCase()] ?? "✦";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}