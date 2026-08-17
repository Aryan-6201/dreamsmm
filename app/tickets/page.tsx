/* =========================================================
   DREAMSMM — PREMIUM SUPPORT TICKETS
   Light luxury / violet support workspace
========================================================= */

"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";

type Ticket = {
  id: number;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
  updatedAt: string;
};

type TicketFilter = "ALL" | "OPEN" | "IN_PROGRESS" | "CLOSED";

const filters: Array<[TicketFilter, string]> = [
  ["ALL", "All tickets"],
  ["OPEN", "Open"],
  ["IN_PROGRESS", "In progress"],
  ["CLOSED", "Closed"],
];

const topics = [
  ["◈", "Order issue", "Delayed, stuck or incorrect order", "Order issue"],
  ["₹", "Payment help", "Deposit, payment or balance question", "Payment help"],
  ["✦", "Service question", "Need help with a service", "Service question"],
  ["◎", "Account support", "Something about your account", "Account support"],
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<TicketFilter>("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
        err instanceof Error ? err.message : "Unable to load tickets.",
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

    if (!subject.trim() || !message.trim() || submitting) return;

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
          : "Unable to create support ticket.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      active: tickets.filter((ticket) => ticket.status === "IN_PROGRESS")
        .length,
      closed: tickets.filter((ticket) => ticket.status === "CLOSED").length,
    };
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      if (filter !== "ALL" && ticket.status !== filter) return false;
      if (!query) return true;

      return (
        String(ticket.id).includes(query) ||
        ticket.subject.toLowerCase().includes(query) ||
        ticket.message.toLowerCase().includes(query)
      );
    });
  }, [tickets, filter, search]);

  function chooseTopic(value: string) {
    setSubject(value);
    document.getElementById("ticket-composer")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <Sidebar />

      <div className="min-h-screen lg:ml-[250px]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

          {/* HERO */}

          <section className="relative overflow-hidden rounded-[34px] border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-indigo-50 p-5 shadow-[0_24px_80px_rgba(79,70,229,0.12)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-violet-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3.5 py-2 shadow-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[9px] font-black text-white">
                    ?
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.24em] text-violet-600">
                    Premium customer care
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-bold text-emerald-600">
                    Support online
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-[-0.055em] text-slate-950 sm:text-4xl lg:text-5xl">
                  Support, without the{" "}
                  <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    friction.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
                  Get help with orders, payments, services and your account.
                  Keep every support request organized in one elegant workspace.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <TrustPill icon="✓" text="Secure support" />
                  <TrustPill icon="↗" text="Ticket tracking" />
                  <TrustPill icon="◎" text="Organized history" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                <Stat label="Total" value={String(stats.total)} icon="◎" />
                <Stat label="Open" value={String(stats.open)} icon="!" />
                <Stat label="Active" value={String(stats.active)} icon="↻" />
                <Stat label="Closed" value={String(stats.closed)} icon="✓" />
              </div>
            </div>
          </section>

          {/* QUICK TOPICS */}

          <section className="mt-6">
            <div className="mb-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                Quick start
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                What can we help with?
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {topics.map(([icon, title, description, subjectValue]) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => chooseTopic(subjectValue)}
                  className="group rounded-[22px] border border-slate-200 bg-white p-4 text-left shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_16px_40px_rgba(99,102,241,0.12)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-600 ring-1 ring-violet-100 group-hover:bg-violet-100">
                      {icon}
                    </div>
                    <span className="text-lg font-black text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-500">
                      →
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-black text-slate-800">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[10px] font-medium leading-5 text-slate-400">
                    {description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* MAIN */}

          <section className="mt-6 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">

            {/* COMPOSER */}

            <section
              id="ticket-composer"
              className="overflow-hidden rounded-[30px] border border-violet-100 bg-white shadow-[0_14px_50px_rgba(15,23,42,0.055)]"
            >
              <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-sm font-black text-white shadow-lg shadow-violet-200">
                    +
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600">
                      New conversation
                    </p>
                    <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                      How can we help?
                    </h2>
                    <p className="mt-1.5 text-xs font-medium leading-5 text-slate-500">
                      Tell us what happened and include your order number when
                      relevant.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={createTicket} className="space-y-5 p-5 sm:p-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                      Subject
                    </label>
                    <span className="text-[8px] font-bold text-slate-400">
                      {subject.length}/120
                    </span>
                  </div>

                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    maxLength={120}
                    placeholder="e.g. Order #1024 is not progressing"
                    required
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                      Message
                    </label>
                    <span className="text-[8px] font-bold text-slate-400">
                      {message.length}/5000
                    </span>
                  </div>

                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={5000}
                    rows={8}
                    placeholder="Explain the issue with as much detail as possible..."
                    required
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-violet-600 shadow-sm">
                      i
                    </span>
                    <div>
                      <p className="text-[10px] font-black text-violet-800">
                        Help us resolve it faster
                      </p>
                      <p className="mt-1 text-[9px] font-medium leading-4 text-violet-600/75">
                        Include your order ID, service name and a clear
                        explanation whenever possible.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert type="error" message={error} />
                )}

                {success && (
                  <Alert type="success" message={success} />
                )}

                <button
                  type="submit"
                  disabled={submitting || !subject.trim() || !message.trim()}
                  className="group relative flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-xs font-black text-white shadow-[0_14px_32px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(99,102,241,0.30)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>
                    {submitting ? "Creating ticket..." : "Create Support Ticket"}
                  </span>
                  {!submitting && <span>→</span>}
                </button>
              </form>
            </section>

            {/* HISTORY */}

            <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_14px_50px_rgba(15,23,42,0.055)]">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
                      Your support
                    </p>
                    <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                      Ticket history
                    </h2>
                    <p className="mt-1.5 text-xs font-medium text-slate-400">
                      Review previous conversations and their latest status.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadTickets}
                    disabled={loading}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[9px] font-black text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40"
                  >
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      ⌕
                    </span>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search tickets..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {filters.map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={`shrink-0 rounded-xl border px-3.5 py-2 text-[9px] font-black transition ${
                          filter === value
                            ? "border-violet-200 bg-violet-50 text-violet-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-600"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {loading ? (
                  <Skeleton />
                ) : visibleTickets.length === 0 ? (
                  <EmptyState filtered={Boolean(search.trim()) || filter !== "ALL"} />
                ) : (
                  <div className="space-y-3">
                    {visibleTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        expanded={expandedId === ticket.id}
                        onToggle={() =>
                          setExpandedId((current) =>
                            current === ticket.id ? null : ticket.id,
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </section>

          {/* BENEFITS */}

          <section className="mt-5 grid gap-3 sm:grid-cols-3">
            <Benefit icon="✓" title="Clear communication" text="Keep every issue and support request together." />
            <Benefit icon="↻" title="Easy follow-up" text="Refresh your ticket history whenever you need." />
            <Benefit icon="◎" title="Organized support" text="Search and filter instead of hunting through messages." />
          </section>

          {/* FAQ */}

          <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.045)] sm:p-7">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500">
              Support guide
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Before you open a ticket
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Faq question="What should I include?" answer="Include the order ID when relevant, the service name and a clear explanation of what happened." />
              <Faq question="Can I search old tickets?" answer="Yes. Search by ticket ID, subject or message text." />
              <Faq question="How do I see ticket status?" answer="Every ticket displays its current status with a clear badge." />
              <Faq question="What if I make a mistake?" answer="Create a clear follow-up ticket with the corrected information. Never send passwords or sensitive credentials." />
            </div>
          </section>

          <section className="relative mt-6 overflow-hidden rounded-[30px] bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-5 text-white shadow-[0_22px_55px_rgba(79,70,229,0.20)] sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                  Need a hand?
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  We are one ticket away.
                </h2>
                <p className="mt-2 max-w-xl text-xs font-medium leading-5 text-white/70">
                  Give us the details and keep the conversation inside your
                  support workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  document.getElementById("ticket-composer")?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-white px-6 text-xs font-black text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50"
              >
                Open a Ticket →
              </button>
            </div>
          </section>

          <p className="pb-5 pt-6 text-center text-[9px] font-semibold text-slate-400">
            Keep support messages focused on the issue you need help resolving.
          </p>
        </div>
      </div>
    </main>
  );
}

function TicketCard({
  ticket,
  expanded,
  onToggle,
}: {
  ticket: Ticket;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = statusMeta(ticket.status);

  return (
    <article
      className={`overflow-hidden rounded-[24px] border bg-white transition-all ${
        expanded
          ? "border-violet-200 shadow-[0_14px_40px_rgba(99,102,241,0.09)]"
          : "border-slate-200 shadow-[0_7px_25px_rgba(15,23,42,0.035)] hover:border-violet-200"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 text-left sm:p-5"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${meta.iconClass}`}>
            {meta.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black text-violet-600">
                #{ticket.id}
              </span>
              <StatusBadge status={ticket.status} />
            </div>

            <h3 className="mt-2 truncate text-sm font-black text-slate-900">
              {ticket.subject}
            </h3>

            <p className="mt-1.5 line-clamp-2 text-[10px] font-medium leading-5 text-slate-400">
              {ticket.message}
            </p>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
              Updated
            </p>
            <p className="mt-1 text-[9px] font-bold text-slate-500">
              {formatDate(ticket.updatedAt)}
            </p>
          </div>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-400">
            {expanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
                Conversation
              </p>
              <p className="mt-3 whitespace-pre-wrap text-xs font-medium leading-6 text-slate-600">
                {ticket.message}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-500">
                Ticket details
              </p>
              <div className="mt-4 space-y-3">
                <Detail label="Ticket ID" value={`#${ticket.id}`} />
                <Detail label="Status" value={ticket.status.replace("_", " ")} />
                <Detail label="Created" value={formatDate(ticket.createdAt)} />
                <Detail label="Updated" value={formatDate(ticket.updatedAt)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function statusMeta(status: Ticket["status"]) {
  if (status === "OPEN") {
    return {
      icon: "!",
      iconClass: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
      badge: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      icon: "↻",
      iconClass: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
      badge: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  return {
    icon: "✓",
    iconClass: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const meta = statusMeta(status);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[7px] font-black uppercase tracking-wider ${meta.badge}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.replace("_", " ")}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[9px] font-bold text-violet-500">{label}</span>
      <span className="max-w-[62%] truncate text-right text-[9px] font-black text-violet-800">
        {value}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="min-w-[82px] rounded-2xl border border-white bg-white/85 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-violet-600">{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function TrustPill({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-[9px] font-black text-slate-500 shadow-sm">
      <span className="text-violet-600">{icon}</span>
      {text}
    </span>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-600 ring-1 ring-violet-100">
          {icon}
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-800">{title}</h3>
          <p className="mt-1 text-[9px] font-medium leading-4 text-slate-400">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-violet-200">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs font-black text-slate-800">
        <span>{question}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-black text-violet-600 shadow-sm">
          +
        </span>
      </summary>
      <p className="mt-3 border-t border-slate-200 pt-3 text-[10px] font-medium leading-5 text-slate-500">
        {answer}
      </p>
    </details>
  );
}

function Alert({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  const good = type === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[9px] font-semibold ${
        good
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white font-black shadow-sm">
        {good ? "✓" : "!"}
      </span>
      <span className="pt-1">{message}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-5"
        >
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-100" />
            <div className="flex-1">
              <div className="h-3 w-24 rounded bg-slate-100" />
              <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
              <div className="mt-2 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/60 p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-xl font-black text-violet-500 ring-1 ring-violet-100">
        ?
      </div>
      <h3 className="mt-4 text-sm font-black text-slate-800">
        {filtered ? "No matching tickets" : "No support tickets yet"}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-[10px] font-medium leading-5 text-slate-400">
        {filtered
          ? "Try another search term or status filter."
          : "Create your first support ticket and your conversations will appear here."}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/* =========================================================
   LIGHT PREMIUM SUPPORT DESIGN
   Existing API contract intentionally preserved.
========================================================= */