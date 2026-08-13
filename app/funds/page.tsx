"use client";

import { useState } from "react";

export default function FundsPage() {
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/fund-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          utr,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setMessage(
        `Deposit request #${data.deposit.id} submitted successfully. Status: ${data.deposit.status}`
      );

      setAmount("");
      setUtr("");
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b12] p-8 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Add Funds</h1>

        <p className="mt-2 text-gray-400">
          Add money to your DreamSMM account using UPI.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold">
            Manual UPI Payment
          </h2>

          <div className="mt-5 rounded-xl bg-black/20 p-5">
            <p className="text-sm text-gray-400">
              Pay to this UPI ID
            </p>

            <p className="mt-2 text-xl font-bold">
              YOUR-UPI-ID@upi
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Replace this with your real UPI ID before launching.
            </p>
          </div>

          <form onSubmit={submitRequest} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Amount
              </label>

              <input
                type="number"
                min="10"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                UTR / Transaction ID
              </label>

              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter UTR after payment"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-300">
              First make the UPI payment. Then enter the UTR/transaction
              ID above. Your request will remain pending until an admin
              verifies the payment.
            </div>

            {message && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Deposit Request"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}