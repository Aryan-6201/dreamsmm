"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";

type Ticket = {
  id: number;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
  updatedAt: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTickets() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tickets", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load tickets.");
      }

      setTickets(data.tickets || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load tickets."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function createTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subject.trim() || !message.trim() || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create ticket.");
      }

      setSuccess(`Ticket #${data.ticket.id} created successfully.`);
      setSubject("");
      setMessage("");
      await loadTickets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create support ticket."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <Sidebar />

      <div className="lg:ml-[250px] p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[30px] border border-white/[0.07] bg-gradient-to-br from-blue-500/[0.10] via-white/[0.025] to-transparent p-6 sm:p-8">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/[0.09] blur-[100px]" />

            <div className="relative">
              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-blue-300/60">
                Customer support
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                Support Tickets
              </h1>

              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-gray-500">
                Need help with an order, payment, service or account?
                Create a ticket and keep the conversation in one place.
              </p>
            </div>
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl sm:p-6">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-600">
                New ticket
              </p>

              <h2 className="mt-2 text-lg font-black text-gray-200">
                How can we help?
              </h2>

              <form onSubmit={createTicket} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-[9px] font-bold text-gray-500">
                    Subject
                  </label>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    maxLength={120}
                    placeholder="e.g. Order #1024 is not progressing"
                    className="h-11 w-full rounded-xl border border-white/[0.07] bg-black/20 px-4 text-[10px] text-white outline-none placeholder:text-gray-700 focus:border-blue-400/30"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-bold text-gray-500">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={5000}
                    rows={7}
                    placeholder="Explain the issue with as much detail as possible..."
                    className="w-full resize-none rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-[10px] leading-5 text-white outline-none placeholder:text-gray-700 focus:border-blue-400/30"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-[9px] font-semibold text-red-300">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-[9px] font-semibold text-emerald-300">
                    ✓ {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !subject.trim() || !message.trim()}
                  className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "Creating ticket..." : "Create Support Ticket"}
                </button>
              </form>
            </section>

            <section className="rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-600">
                    Your tickets
                  </p>
                  <h2 className="mt-2 text-lg font-black text-gray-200">
                    Support history
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={loadTickets}
                  className="rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2 text-[8px] font-bold text-gray-500 transition hover:text-gray-300"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-5">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-24 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]"
                      />
                    ))}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] text-gray-600">
                      ?
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-gray-500">
                      No support tickets yet
                    </p>
                    <p className="mt-2 text-[8px] text-gray-700">
                      Your support requests will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const styles = {
    OPEN: "border-amber-400/15 bg-amber-400/[0.06] text-amber-300",
    IN_PROGRESS:
      "border-blue-400/15 bg-blue-400/[0.06] text-blue-300",
    CLOSED:
      "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300",
  };

  return (
    <article className="rounded-2xl border border-white/[0.06] bg-black/10 p-4 transition hover:border-white/[0.1]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[8px] font-black text-blue-300">
              #{ticket.id}
            </span>

            <span
              className={`rounded-full border px-2 py-1 text-[6px] font-bold uppercase tracking-[0.1em] ${
                styles[ticket.status]
              }`}
            >
              {ticket.status.replace("_", " ")}
            </span>
          </div>

          <h3 className="mt-2 text-[10px] font-black text-gray-300">
            {ticket.subject}
          </h3>

          <p className="mt-2 line-clamp-3 text-[8px] leading-5 text-gray-600">
            {ticket.message}
          </p>
        </div>

        <span className="shrink-0 text-[7px] text-gray-700">
          {formatDate(ticket.updatedAt)}
        </span>
      </div>
    </article>
  );
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