"use client";

import { useEffect, useState } from "react";

type Deposit = {
  id: number;
  amount: string;
  utr: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadDeposits() {
    try {
      const response = await fetch("/api/admin/deposits", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load deposits.");
        return;
      }

      setDeposits(data.deposits || []);
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeposits();
  }, []);

  async function processDeposit(
    depositId: number,
    action: "APPROVE" | "REJECT"
  ) {
    const confirmed = window.confirm(
      action === "APPROVE"
        ? "Have you verified the UPI payment? Approve this deposit?"
        : "Are you sure you want to reject this deposit?"
    );

    if (!confirmed) return;

    setProcessing(depositId);
    setMessage("");

    try {
      const response = await fetch("/api/admin/deposits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          depositId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not process deposit.");
        return;
      }

      setMessage(
        action === "APPROVE"
          ? `Deposit #${depositId} approved successfully.`
          : `Deposit #${depositId} rejected.`
      );

      await loadDeposits();
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setProcessing(null);
    }
  }

  const totalPending = deposits.reduce(
    (sum, deposit) => sum + Number(deposit.amount),
    0
  );

  return (
    <main className="min-h-screen bg-[#070a11] text-white">
      {/* Top bar */}
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

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-gray-500">System Admin</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-400 ring-1 ring-blue-500/20">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Admin Panel
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              Deposit Management
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Review and manage manual UPI deposit requests.
            </p>
          </div>

          <button
            onClick={loadDeposits}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending Requests</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                ⏳
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {deposits.length}
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Awaiting verification
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending Amount</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                ₹
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold">
              ₹{totalPending.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Total awaiting approval
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Payment Method</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                UPI
              </div>
            </div>

            <p className="mt-4 text-xl font-bold">
              Manual UPI
            </p>

            <p className="mt-1 text-xs text-gray-600">
              PhonePe · Google Pay · UPI
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              className="ml-4 text-blue-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Deposits */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Pending Deposits
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Verify the UTR against your UPI payment before approving.
              </p>
            </div>

            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
              {deposits.length} pending
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-12 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
              <p className="mt-4 text-sm text-gray-500">
                Loading deposits...
              </p>
            </div>
          ) : deposits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c1019] p-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-2xl">
                ✓
              </div>

              <h3 className="mt-4 font-semibold">
                All caught up
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                There are no pending deposit requests.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="group rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5 transition hover:border-white/[0.12] hover:bg-[#0e121c]"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    {/* User */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 font-semibold text-blue-400">
                        {(deposit.user.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {deposit.user.name || "User"}
                          </h4>

                          <span className="rounded-md bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-yellow-400">
                            Pending
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {deposit.user.email}
                        </p>

                        <p className="mt-2 text-xs text-gray-600">
                          Request #{deposit.id} ·{" "}
                          {new Date(deposit.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="xl:min-w-[150px]">
                      <p className="text-xs uppercase tracking-wider text-gray-600">
                        Amount
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        ₹{deposit.amount}
                      </p>
                    </div>

                    {/* UTR */}
                    <div className="xl:min-w-[220px]">
                      <p className="text-xs uppercase tracking-wider text-gray-600">
                        UTR / Transaction ID
                      </p>

                      <div className="mt-1 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
                        <code className="break-all text-sm text-gray-300">
                          {deposit.utr}
                        </code>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 xl:ml-auto">
                      <button
                        onClick={() =>
                          processDeposit(deposit.id, "REJECT")
                        }
                        disabled={processing === deposit.id}
                        className="rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() =>
                          processDeposit(deposit.id, "APPROVE")
                        }
                        disabled={processing === deposit.id}
                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processing === deposit.id
                          ? "Processing..."
                          : "Approve"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}