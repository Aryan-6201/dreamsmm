"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";

type Transaction = {
  id: number;
  type: string;
  amount: string;
  note: string | null;
  createdAt: string;
};

type WalletResponse = {
  success: boolean;
  wallet: {
    balance: string;
    totalSpent: string;
  };
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
};

const filters = [
  ["ALL", "All activity"],
  ["DEPOSIT", "Deposits"],
  ["ORDER", "Orders"],
  ["REFUND", "Refunds"],
  ["BONUS", "Bonuses"],
  ["ADJUSTMENT", "Adjustments"],
  ["WITHDRAWAL", "Withdrawals"],
];

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState("0.00");
  const [totalSpent, setTotalSpent] = useState("0.00");
  const [type, setType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWallet(nextPage = page, nextType = type) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: "10",
        type: nextType,
      });

      const response = await fetch(`/api/transactions?${params.toString()}`, {
        cache: "no-store",
      });

      const data: WalletResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load wallet.");
      }

      setBalance(data.wallet.balance);
      setTotalSpent(data.wallet.totalSpent);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load wallet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWallet(page, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type]);

  const summary = useMemo(() => {
    const deposits = transactions
      .filter((item) => item.type === "DEPOSIT")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const refunds = transactions
      .filter((item) => item.type === "REFUND")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return { deposits, refunds };
  }, [transactions]);

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <Sidebar />

      <div className="md:ml-64 p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[30px] border border-white/[0.07] bg-gradient-to-br from-emerald-400/[0.10] via-white/[0.025] to-transparent p-6 sm:p-8">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-emerald-400/[0.08] blur-[100px]" />
            <div className="absolute -bottom-28 left-20 h-56 w-56 rounded-full bg-violet-500/[0.06] blur-[90px]" />

            <div className="relative">
              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-emerald-300/60">
                Wallet center
              </p>

              <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                  <p className="text-[9px] font-semibold text-gray-600">
                    Available balance
                  </p>
                  <h1 className="mt-1 text-4xl font-black tracking-[-0.05em] text-white">
                    ₹{balance}
                  </h1>
                  <p className="mt-2 text-[9px] text-gray-600">
                    Your wallet is updated after approved deposits and completed
                    wallet transactions.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Summary label="Total spent" value={`₹${totalSpent}`} />
                  <Summary
                    label="Page deposits"
                    value={`₹${summary.deposits.toFixed(2)}`}
                  />
                  <Summary
                    label="Page refunds"
                    value={`₹${summary.refunds.toFixed(2)}`}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-3 backdrop-blur-xl">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setType(value);
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-[8px] font-bold transition ${
                    type === value
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                      : "border-white/[0.05] bg-black/10 text-gray-600 hover:text-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-[9px] font-semibold text-red-300">
              {error}
            </div>
          )}

          <section className="mt-5">
            {loading ? (
              <Loading />
            ) : transactions.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            )}
          </section>

          {!loading && pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-xl border border-white/[0.06] px-4 py-2 text-[8px] font-bold text-gray-500 disabled:opacity-25"
              >
                â† Previous
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
                Next â†’
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  const positive = ["DEPOSIT", "REFUND", "BONUS", "ADJUSTMENT"].includes(
    transaction.type
  );

  const styles: Record<string, string> = {
    DEPOSIT: "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300",
    ORDER: "border-violet-400/15 bg-violet-400/[0.06] text-violet-300",
    REFUND: "border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300",
    BONUS: "border-amber-400/15 bg-amber-400/[0.06] text-amber-300",
    ADJUSTMENT: "border-blue-400/15 bg-blue-400/[0.06] text-blue-300",
    WITHDRAWAL: "border-red-400/15 bg-red-400/[0.06] text-red-300",
  };

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.035]">
      <div
        className={`absolute inset-y-0 left-0 w-[2px] ${
          positive ? "bg-emerald-400/50" : "bg-violet-400/40"
        }`}
      />

      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm ${
            styles[transaction.type] ||
            "border-white/[0.06] bg-white/[0.03] text-gray-400"
          }`}
        >
          {iconFor(transaction.type)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[10px] font-black text-gray-300">
              {labelFor(transaction.type)}
            </h2>

            <span className="rounded-full border border-white/[0.05] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.1em] text-gray-600">
              #{transaction.id}
            </span>
          </div>

          <p className="mt-1 truncate text-[8px] text-gray-600">
            {transaction.note || "Wallet transaction"}
          </p>

          <p className="mt-1 text-[7px] text-gray-700">
            {formatDate(transaction.createdAt)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-sm font-black ${
              positive ? "text-emerald-300" : "text-gray-300"
            }`}
          >
            {positive ? "+" : "-"}₹{transaction.amount}
          </p>

          <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-gray-700">
            {transaction.type}
          </p>
        </div>
      </div>
    </article>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[86px] rounded-2xl border border-white/[0.06] bg-black/15 px-3 py-3">
      <p className="text-[6px] uppercase tracking-[0.12em] text-gray-700">
        {label}
      </p>
      <p className="mt-1 truncate text-[9px] font-black text-gray-300">
        {value}
      </p>
    </div>
  );
}

function Loading() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-[82px] animate-pulse rounded-[24px] border border-white/[0.05] bg-white/[0.02]"
        />
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.02] p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-black/20 text-gray-600">
        â—‡
      </div>
      <h2 className="mt-5 text-sm font-black text-gray-400">
        No transactions yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-[9px] leading-5 text-gray-700">
        Deposits, orders, refunds and bonuses will appear here.
      </p>
    </div>
  );
}

function labelFor(type: string) {
  const labels: Record<string, string> = {
    DEPOSIT: "Deposit",
    ORDER: "Order payment",
    REFUND: "Refund",
    BONUS: "Bonus",
    ADJUSTMENT: "Balance adjustment",
    WITHDRAWAL: "Withdrawal",
  };

  return labels[type] || "Transaction";
}

function iconFor(type: string) {
  const icons: Record<string, string> = {
    DEPOSIT: "ï¼‹",
    ORDER: "âˆ’",
    REFUND: "â†©",
    BONUS: "âœ¦",
    ADJUSTMENT: "Â±",
    WITHDRAWAL: "â†‘",
  };

  return icons[type] || "â€¢";
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
