"use client";

import { useMemo, useState } from "react";

/* ============================================================================
   DREAMSMM â€” ULTRA PREMIUM ADD FUNDS
   ----------------------------------------------------------------------------
   Design goals:
   - Light premium UI
   - Large QR payment experience
   - Amount presets
   - UPI copy interaction
   - UTR validation
   - Step/progress indicators
   - Payment checklist
   - FAQ accordion
   - Responsive/mobile-first layout
   - Loading, success and error states
   - Existing /api/fund-request contract preserved
============================================================================ */

const UPI_ID = "aryan251@ybl";
const QR_IMAGE = "/qr.jpeg";
const MIN_AMOUNT = 10;
const AMOUNT_PRESETS = [50, 100, 250, 500, 1000, 2000];

type NoticeTone = "success" | "error" | "info";

type Notice = {
  tone: NoticeTone;
  text: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    question: "How do I add funds?",
    answer:
      "Choose an amount, scan the UPI QR code, complete the payment, copy the UTR from your payment receipt, then submit the amount and UTR in the verification form.",
  },
  {
    question: "Where can I find my UTR?",
    answer:
      "Open the payment receipt in your UPI application. The UTR, transaction reference, or transaction ID is normally displayed in the receipt details.",
  },
  {
    question: "Why is my balance not credited immediately?",
    answer:
      "This page uses manual deposit verification. Your request remains pending until an admin verifies the submitted payment details.",
  },
  {
    question: "What if I entered the wrong UTR?",
    answer:
      "Do not submit inaccurate transaction information. Check the payment receipt again and enter the exact transaction reference before submitting.",
  },
  {
    question: "What is the minimum deposit?",
    answer: `The minimum deposit amount is ₹${MIN_AMOUNT}.`,
  },
  {
    question: "Can I pay using any UPI application?",
    answer:
      "Use a UPI application that can scan and complete the payment represented by the QR code. The exact interface varies by payment application.",
  },
];

/* ============================================================================
   SMALL UI COMPONENTS
============================================================================ */

function IconSpark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m5 12.5 4.2 4.2L19.5 6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M12 3 20 6v5.5c0 4.7-3.1 7.9-8 9.5-4.9-1.6-8-4.8-8-9.5V6l8-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m8.3 12 2.3 2.3 5.2-5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 17.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 7h13.5A2.5 2.5 0 0 1 20 9.5V13h-4.5a2 2 0 1 1 0-4H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="15.5" cy="11" r=".9" fill="currentColor" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M5 12h13M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M14 5h5v5M19 5l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 10.5v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconQr() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M14 14h3v3h-3zM20 14v3M17 20h3M14 20v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepBadge({
  number,
  active = false,
  complete = false,
}: {
  number: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <span
      className={[
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black transition-all",
        complete
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
          : active
            ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
            : "border border-slate-200 bg-white text-slate-400",
      ].join(" ")}
    >
      {complete ? <IconCheck /> : number}
    </span>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "violet" | "slate" | "amber";
  children: React.ReactNode;
}) {
  const styles = {
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionEyebrow({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function PaymentStep({
  number,
  title,
  description,
  active = false,
  complete = false,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div
      className={[
        "group flex gap-4 rounded-2xl border p-4 transition-all",
        active
          ? "border-violet-200 bg-violet-50/70 shadow-sm"
          : complete
            ? "border-emerald-100 bg-emerald-50/50"
            : "border-slate-100 bg-slate-50/60",
      ].join(" ")}
    >
      <StepBadge number={number} active={active} complete={complete} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-black text-slate-800">{title}</p>

          {complete && <StatusPill tone="green">Done</StatusPill>}

          {active && !complete && (
            <StatusPill tone="violet">Current</StatusPill>
          )}
        </div>

        <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition-all group-hover:bg-violet-100">
        {icon}
      </div>

      <p className="mt-4 text-sm font-black text-slate-800">{title}</p>

      <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function NoticeCard({
  notice,
  onClose,
}: {
  notice: Notice;
  onClose: () => void;
}) {
  const tone = {
    success: {
      wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: "bg-emerald-100 text-emerald-700",
      title: "Request submitted",
    },
    error: {
      wrapper: "border-red-200 bg-red-50 text-red-800",
      icon: "bg-red-100 text-red-700",
      title: "Unable to submit",
    },
    info: {
      wrapper: "border-blue-200 bg-blue-50 text-blue-800",
      icon: "bg-blue-100 text-blue-700",
      title: "Payment information",
    },
  }[notice.tone];

  return (
    <div className={`rounded-2xl border p-4 ${tone.wrapper}`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
        >
          {notice.tone === "success" ? (
            <IconCheck />
          ) : notice.tone === "error" ? (
            "!"
          ) : (
            <IconInfo />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">{tone.title}</p>
          <p className="mt-1 text-xs font-semibold leading-5 opacity-80">
            {notice.text}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-xs font-black opacity-50 transition hover:bg-white/60 hover:opacity-100"
          aria-label="Close message"
        >
          Ã—
        </button>
      </div>
    </div>
  );
}

function AmountPreset({
  value,
  active,
  onClick,
}: {
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2.5 text-xs font-black transition-all",
        active
          ? "border-violet-400 bg-violet-600 text-white shadow-md shadow-violet-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
      ].join(" ")}
    >
      ₹{value.toLocaleString("en-IN")}
    </button>
  );
}

function TrustMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-lg font-black text-slate-900">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border transition-all",
        open
          ? "border-violet-200 bg-violet-50/60"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
        aria-expanded={open}
      >
        <span className="text-sm font-black text-slate-800">
          {item.question}
        </span>

        <span
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-lg font-bold transition-transform",
            open
              ? "rotate-45 border-violet-200 bg-white text-violet-600"
              : "border-slate-200 bg-slate-50 text-slate-400",
          ].join(" ")}
        >
          +
        </span>
      </button>

      {open && (
        <div className="border-t border-violet-100 px-5 pb-5 pt-4">
          <p className="text-xs font-medium leading-6 text-slate-600">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   MAIN PAGE
============================================================================ */

export default function FundsPage() {
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const numericAmount = Number(amount);

  const validAmount =
    Number.isFinite(numericAmount) && numericAmount >= MIN_AMOUNT;

  const hasUtr = utr.trim().length >= 4;

  const amountLabel = useMemo(() => {
    if (!amount) return "₹0.00";

    if (!Number.isFinite(numericAmount)) return "₹0.00";

    return `₹${numericAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [amount, numericAmount]);

  const currentStep = !amount
    ? 1
    : !validAmount
      ? 1
      : !utr.trim()
        ? 2
        : 3;

  const formReady = validAmount && hasUtr && !loading;

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch {
      setNotice({
        tone: "error",
        text: "Your browser did not allow automatic copying. Please copy the UPI ID manually.",
      });
    }
  }

  function chooseAmount(value: number) {
    setAmount(String(value));

    setNotice(null);

    window.setTimeout(() => {
      document
        .getElementById("payment-form")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 20);
  }

  function handleAmountChange(value: string) {
    setAmount(value);

    if (notice) {
      setNotice(null);
    }
  }

  function handleUtrChange(value: string) {
    setUtr(value);

    if (notice?.tone === "error") {
      setNotice(null);
    }
  }

  async function submitRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validAmount) {
      setNotice({
        tone: "error",
        text: `Please enter an amount of at least ₹${MIN_AMOUNT}.`,
      });
      return;
    }

    if (!hasUtr) {
      setNotice({
        tone: "error",
        text: "Please enter a valid UTR or transaction reference from your payment receipt.",
      });
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const response = await fetch("/api/fund-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          utr: utr.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNotice({
          tone: "error",
          text: data?.error || "Something went wrong while submitting your deposit.",
        });
        return;
      }

      setNotice({
        tone: "success",
        text: `Deposit request #${data.deposit.id} submitted successfully. Status: ${data.deposit.status}.`,
      });

      setAmount("");
      setUtr("");
    } catch {
      setNotice({
        tone: "error",
        text: "Could not connect to the server. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7fb] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[32rem] w-[32rem] rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -right-48 top-0 h-[34rem] w-[34rem] rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-[25%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-100/35 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <section className="relative overflow-hidden rounded-[34px] border border-violet-100 bg-white/90 shadow-[0_30px_100px_rgba(76,29,149,0.10)] backdrop-blur-xl">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
          <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-indigo-100/40 blur-3xl" />
          <div className="relative p-5 sm:p-7 lg:p-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-2xl font-black text-white shadow-[0_18px_45px_rgba(124,58,237,0.28)]">₹</div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-violet-700">
                    <IconSpark /> Premium Wallet
                  </div>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Add Funds</h1>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Pay through UPI and submit your transaction reference for verification.</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3.5 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm"><IconShield /></span>
                <div>
                  <p className="text-sm font-black text-emerald-900">Secure Payment</p>
                  <p className="mt-0.5 text-[10px] font-bold text-emerald-600">Manual verification enabled</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="payment-form" className="mt-6 overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 py-6 text-white sm:px-8">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <SectionEyebrow icon={<IconWallet />}>Payment Verification</SectionEyebrow>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Add Money to Wallet</h2>

            </div>
          </div>

          {notice && <div className="px-5 pt-5 sm:px-7"><NoticeCard notice={notice} onClose={() => setNotice(null)} /></div>}

          <form onSubmit={submitRequest} className="space-y-5 p-5 sm:p-7">
            {/* PAYMENT METHOD */}
            <div className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-500">Payment Method</p>
                  <p className="mt-1 text-lg font-black text-violet-950">UPI</p>
                  <p className="mt-0.5 text-xs font-semibold text-violet-600">{UPI_ID}</p>
                </div>
                <button type="button" onClick={copyUpi} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 text-xs font-black text-violet-700 shadow-sm transition hover:bg-violet-50">
                  {copied ? <IconCheck /> : <IconCopy />}{copied ? "Copied" : "Copy UPI"}
                </button>
              </div>
            </div>

            {/* TRANSACTION ID */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="utr" className="text-sm font-black text-slate-800">UTR / Transaction ID</label>
                <StatusPill tone={hasUtr ? "green" : "slate"}>{hasUtr ? "Looks ready" : "Required"}</StatusPill>
              </div>
              <input id="utr" type="text" value={utr} onChange={(e) => handleUtrChange(e.target.value)} placeholder="Enter transaction reference" required autoComplete="off"
                className={["h-14 w-full rounded-2xl border bg-slate-50 px-4 text-sm font-bold tracking-wide text-slate-900 outline-none transition-all placeholder:text-slate-300",
                  hasUtr ? "border-emerald-200 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50" : "border-slate-200 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"].join(" ")} />
              <div className="mt-2 flex items-start gap-2 text-[10px] font-semibold leading-5 text-slate-400"><IconInfo /><span>Find this reference inside your UPI payment receipt.</span></div>
            </div>

            {/* AMOUNT */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="amount" className="text-sm font-black text-slate-800">Amount</label>
                <StatusPill tone="slate">Minimum ₹{MIN_AMOUNT}</StatusPill>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-violet-500">₹</span>
                <input id="amount" type="number" min={MIN_AMOUNT} step="0.01" value={amount} onChange={(e) => handleAmountChange(e.target.value)} placeholder="0.00" required
                  className={["h-14 w-full rounded-2xl border bg-slate-50 pl-10 pr-4 text-lg font-black text-slate-900 outline-none transition-all placeholder:text-slate-300",
                    amount && !validAmount ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100" : "border-slate-200 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"].join(" ")} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {AMOUNT_PRESETS.map((value) => <AmountPreset key={value} value={value} active={numericAmount === value} onClick={() => chooseAmount(value)} />)}
              </div>
              {amount && !validAmount && <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600">Minimum deposit amount is ₹{MIN_AMOUNT}.</div>}
            </div>

            {/* QR BELOW AMOUNT */}
            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-violet-50/40 p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-500">UPI QR</p><p className="mt-1 text-sm font-black text-slate-800">Scan & Pay</p></div>
                <StatusPill tone="green"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />QR Active</StatusPill>
              </div>
              <div className="mx-auto max-w-[280px] rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,0.10)]">
                <img src={QR_IMAGE} alt="UPI Payment QR Code" className="aspect-square w-full rounded-xl object-contain" />
              </div>
              <p className="mt-4 text-center text-[10px] font-semibold text-slate-400">Scan with UPI and pay exactly {amountLabel}.</p>
            </div>

            {/* CHECK */}
            <div className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5">
              <div className="flex items-center justify-between gap-4"><span className="text-xs font-bold text-slate-500">Deposit amount</span><span className="text-xl font-black text-violet-800">{amountLabel}</span></div>
              <div className="my-4 h-px bg-violet-100" />
              <div className="flex items-center justify-between gap-4"><span className="text-xs font-bold text-slate-500">Transaction ID</span><span className={hasUtr ? "text-xs font-black text-emerald-600" : "text-xs font-black text-amber-600"}>{hasUtr ? "Ready" : "Required"}</span></div>
            </div>

            <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm"><IconInfo /></span>
                <div><p className="text-sm font-black text-amber-900">Check before submitting</p><p className="mt-1 text-xs font-medium leading-5 text-amber-800">Make sure your UTR and amount exactly match the UPI payment.</p></div>
              </div>
            </div>

            <button type="submit" disabled={!formReady} className="group flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-5 text-sm font-black text-white shadow-[0_18px_45px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none">
              {loading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Processing Request...</> : <>Check & Submit Deposit <IconArrow /></>}
            </button>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm"><IconClock /></span>
              <p className="text-[10px] font-semibold leading-5 text-slate-500">Your request remains pending until an admin verifies the payment details.</p>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionEyebrow icon={<IconArrow />}>Payment Journey</SectionEyebrow>
          <h3 className="mt-2 text-xl font-black text-slate-900">How to add funds</h3>
          <div className="mt-5 grid gap-3">
            <PaymentStep number="01" title="Choose payment method" description="Use UPI and the displayed UPI ID or QR." active={currentStep === 1} complete={currentStep > 1} />
            <PaymentStep number="02" title="Enter transaction ID" description="Copy the exact UTR from your payment receipt." active={validAmount && !hasUtr} complete={hasUtr} />
            <PaymentStep number="03" title="Enter amount, pay and submit" description="Pay the exact amount, check your details, then submit." active={hasUtr} complete={false} />
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4"><SectionEyebrow icon={<IconSpark />}>Built For Confidence</SectionEyebrow><h2 className="mt-2 text-2xl font-black text-slate-900">A cleaner way to fund your wallet</h2></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<IconQr />} title="Instant QR Access" description="The payment QR stays visible while you complete the payment." />
            <FeatureCard icon={<IconCopy />} title="Quick UPI Copy" description="Copy the payment UPI ID with one tap." />
            <FeatureCard icon={<IconShield />} title="Manual Verification" description="Deposit requests remain pending until payment details are reviewed." />
            <FeatureCard icon={<IconClock />} title="Clear Status" description="Your submission returns a request ID and verification status." />
          </div>
        </section>

        <section className="mt-7 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          <div><SectionEyebrow icon={<IconInfo />}>Help Center</SectionEyebrow><h2 className="mt-2 text-2xl font-black text-slate-900">Frequently asked questions</h2></div>
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {FAQS.map((item, index) => <FaqRow key={item.question} item={item} open={openFaq === index} onToggle={() => setOpenFaq(openFaq === index ? null : index)} />)}
          </div>
        </section>

        <footer className="px-2 pb-6 pt-6 text-center"><p className="text-[10px] font-semibold text-slate-400">DreamSMM Wallet â€¢ UPI Payment â€¢ Manual Deposit Verification</p></footer>
      </div>
    </main>
  );}
