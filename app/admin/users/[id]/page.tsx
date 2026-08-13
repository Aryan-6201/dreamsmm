"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  balance: string;
  totalSpent: string;
  lastSeenAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

type Transaction = {
  id: number;
  type: string;
  amount: string;
  note: string | null;
  createdAt: string;
};

type Order = {
  id: number;
  quantity: number;
  charge: string;
  status: string;
  link: string;
  createdAt: string;
  service: {
    name: string;
    platform: string;
  };
};

export default function UserManagementPage() {
  const params = useParams();
  const router = useRouter();

  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  async function loadUser() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/users/${userId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load user.");
        return;
      }

      setUser(data.user);
      setTransactions(data.transactions || []);
      setOrders(data.orders || []);
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  async function updateUser(
    action: string,
    value?: string
  ) {
    setProcessing(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            amount: value,
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Action failed.");
        return;
      }

      setMessage(data.message || "Updated successfully.");

      setAmount("");
      setReason("");

      await loadUser();
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setProcessing(false);
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "Never";

    return new Date(date).toLocaleString();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070a11] p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-500">
            Loading user...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#070a11] p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-red-400">
            {message || "User not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070a11] text-white">
      <header className="border-b border-white/[0.07] bg-[#090c14]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-bold">
              Dream<span className="text-blue-500">SMM</span>
            </h1>

            <p className="text-[11px] text-gray-500">
              User Management
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/users")}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            ← Back to Users
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* User header */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl font-bold text-blue-400">
              {(user.name || user.email)
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {user.name || "Unnamed User"}
                </h2>

                <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
                  {user.role}
                </span>

                <span
                  className={`rounded-md px-2 py-1 text-xs ${
                    user.status === "ACTIVE"
                      ? "bg-green-500/10 text-green-400"
                      : user.status === "SUSPENDED"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {user.status}
                </span>
              </div>

              <p className="mt-1 text-gray-500">
                {user.email}
              </p>

              <p className="mt-2 text-xs text-gray-700">
                ID: {user.id}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs text-gray-600">
                Current Balance
              </p>

              <p className="mt-1 text-3xl font-bold">
                ₹{user.balance}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
            <p className="text-xs text-gray-600">
              Total Spent
            </p>

            <p className="mt-2 text-xl font-bold">
              ₹{user.totalSpent}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
            <p className="text-xs text-gray-600">
              Last Seen
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatDate(user.lastSeenAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
            <p className="text-xs text-gray-600">
              Last Login
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatDate(user.lastLoginAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c1019] p-5">
            <p className="text-xs text-gray-600">
              Joined
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-300">
            {message}
          </div>
        )}

        {/* Balance controls */}
        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0c1019] p-6">
          <h3 className="text-lg font-semibold">
            Balance Management
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Every adjustment should have a reason.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-blue-500/50"
            />

            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-blue-500/50"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={processing || !amount}
              onClick={() =>
                updateUser("ADD_BALANCE", amount)
              }
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
            >
              + Add Balance
            </button>

            <button
              disabled={processing || !amount}
              onClick={() =>
                updateUser("REMOVE_BALANCE", amount)
              }
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
            >
              − Remove Balance
            </button>

            <button
              disabled={processing || !amount}
              onClick={() =>
                updateUser("BONUS", amount)
              }
              className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-500 disabled:opacity-50"
            >
              🎁 Give Bonus
            </button>
          </div>
        </section>

        {/* Account controls */}
        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0c1019] p-6">
          <h3 className="text-lg font-semibold">
            Account Controls
          </h3>

          <div className="mt-5 flex flex-wrap gap-3">
            {user.status === "ACTIVE" ? (
              <button
                disabled={processing}
                onClick={() =>
                  updateUser("SUSPEND")
                }
                className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-3 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20 disabled:opacity-50"
              >
                Suspend User
              </button>
            ) : (
              <button
                disabled={processing}
                onClick={() =>
                  updateUser("ACTIVATE")
                }
                className="rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50"
              >
                Activate User
              </button>
            )}

            <button
              disabled={processing}
              onClick={() =>
                updateUser(
                  user.role === "ADMIN"
                    ? "REMOVE_ADMIN"
                    : "MAKE_ADMIN"
                )
              }
              className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-medium text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
            >
              {user.role === "ADMIN"
                ? "Remove Admin"
                : "Make Admin"}
            </button>
          </div>
        </section>

        {/* Orders */}
        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0c1019] p-6">
          <h3 className="text-lg font-semibold">
            Recent Orders
          </h3>

          <div className="mt-5 overflow-x-auto">
            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-600">
                No orders yet.
              </p>
            ) : (
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-white/[0.07] text-xs text-gray-600">
                  <tr>
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Charge</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/[0.04]"
                    >
                      <td className="py-4">
                        #{order.id}
                      </td>

                      <td className="py-4">
                        {order.service.name}
                        <div className="text-xs text-gray-600">
                          {order.service.platform}
                        </div>
                      </td>

                      <td className="py-4">
                        {order.quantity}
                      </td>

                      <td className="py-4">
                        ₹{order.charge}
                      </td>

                      <td className="py-4">
                        {order.status}
                      </td>

                      <td className="py-4 text-gray-500">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Transactions */}
        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0c1019] p-6">
          <h3 className="text-lg font-semibold">
            Transaction History
          </h3>

          <div className="mt-5 space-y-2">
            {transactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-600">
                No transactions yet.
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col justify-between gap-2 rounded-xl border border-white/[0.05] bg-black/10 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {transaction.type}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      {transaction.note || "No note"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p
                      className={`font-semibold ${
                        Number(transaction.amount) >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ₹{transaction.amount}
                    </p>

                    <p className="text-xs text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}