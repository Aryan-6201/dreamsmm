"use client";

import { useMemo, useState } from "react";

const UPI_ID = "aryan251@ybl";
const QR_IMAGE = "/qr.jpeg";
const MIN_AMOUNT = 10;
const PRESETS = [50, 100, 250, 500, 1000, 2000];

const PAYMENT_METHODS = [
  "PhonePe [JP]",
  "Paytm / Google Pay / PhonePe",
  "Debit / Credit Card — Visa / MasterCard / American Express [Up to 5% Bonus]",
  "Heleket — USDT / BTC / LTC / TRX",
  "Cryptomus — USDT / BTC / LTC / TRX",
  "EasyPaisa / JazzCash / Pakistan Bank Transfer",
  "Bank Transfer — USA / Europe / Mexico",
  "bKash — Bangladesh",
  "GCash Manual — Philippines",
  "EasyPaisa / JazzCash / Coin Pay",
  "Turkey Bank Havale / EFT",
  "Payoneer — 3–5% Bonus",
];

const FAQS = [
  ["UTR kaha milega?", "Payment complete hone ke baad UPI app receipt mein UTR ya Transaction ID milegi."],
  ["Balance kab add hoga?", "Admin payment verify karne ke baad balance add hoga."],
  ["Minimum amount?", `Minimum deposit ₹${MIN_AMOUNT} hai.`],
];

export default function FundsPage() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const numberAmount = Number(amount);
  const validAmount =
    Number.isFinite(numberAmount) && numberAmount >= MIN_AMOUNT;
  const validUtr = utr.trim().length >= 4;

  const displayAmount = useMemo(() => {
    if (!validAmount) return "₹0.00";

    return `₹${numberAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [numberAmount, validAmount]);

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice({
        type: "error",
        text: "UPI ID copy nahi hua. Please manually copy karein.",
      });
    }
  }

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validAmount) {
      setNotice({
        type: "error",
        text: `Minimum amount ₹${MIN_AMOUNT} hai.`,
      });
      return;
    }

    if (!validUtr) {
      setNotice({
        type: "error",
        text: "Valid UTR / Transaction ID enter karein.",
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
          type: "error",
          text: data?.error || "Deposit request submit nahi ho saka.",
        });
        return;
      }

      setNotice({
        type: "success",
        text: `Deposit request #${data.deposit.id} submitted. Status: ${data.deposit.status}.`,
      });

      setAmount("");
      setUtr("");
    } catch {
      setNotice({
        type: "error",
        text: "Server connect nahi hua. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-fuchsia-700 px-5 py-6 text-white shadow-xl shadow-violet-200 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-violet-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Secure UPI payment
              </span>

              <h1 className="mt-3 text-3xl font-black tracking-tight">
                Add Funds
              </h1>

              <p className="mt-1 text-sm font-medium text-violet-100">
                Pay with UPI and submit your payment UTR.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-200">
                Selected amount
              </p>
              <p className="mt-1 text-2xl font-black">{displayAmount}</p>
            </div>
          </div>
        </header>

        <div className="mt-3 grid items-start gap-3 sm:gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-violet-600">
                  Scan & Pay
                </p>
                <p className="mt-1 text-lg font-black">UPI Payment</p>
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">
                Active
              </span>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:mt-4 sm:p-3">
              <img
                src={QR_IMAGE}
                alt="UPI payment QR code"
                className="mx-auto aspect-square w-full max-w-[190px] rounded-xl bg-white object-contain sm:max-w-none"
              />
            </div>

            <div className="mt-3 rounded-2xl bg-violet-50 p-2.5 sm:mt-4 sm:p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                UPI ID
              </p>

              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-black text-violet-950">
                  {UPI_ID}
                </p>

                <button
                  type="button"
                  onClick={copyUpi}
                  className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-black text-violet-700 shadow-sm ring-1 ring-violet-100"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-xs font-medium text-slate-400 sm:mt-4">
              Pay exactly <b className="text-violet-700">{displayAmount}</b>
            </p>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-950/5">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-violet-600">
                Payment verification
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Submit your deposit
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Enter the payment details after completing UPI payment.
              </p>
            </div>

            <form onSubmit={submitRequest} className="space-y-5 p-5 sm:p-7">
              {notice && (
                <div
                  role="alert"
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                    notice.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {notice.text}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="paymentMethod" className="text-sm font-black">
                    Payment Method
                  </label>

                  <span className="text-[11px] font-bold text-slate-400">
                    Select method
                  </span>
                </div>

                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(event) => {
                    setPaymentMethod(event.target.value);
                    setNotice(null);
                  }}
                  className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="amount" className="text-sm font-black">
                    Amount
                  </label>

                  <span className="text-[11px] font-bold text-slate-400">
                    Min. ₹{MIN_AMOUNT}
                  </span>
                </div>

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-violet-600">
                    ₹
                  </span>

                  <input
                    id="amount"
                    type="number"
                    min={MIN_AMOUNT}
                    step="0.01"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setNotice(null);
                    }}
                    placeholder="0.00"
                    required
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-lg font-black outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(String(preset));
                        setNotice(null);
                      }}
                      className={`rounded-xl border py-2.5 text-xs font-black transition ${
                        numberAmount === preset
                          ? "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-200"
                          : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="utr" className="text-sm font-black">
                    UTR / Transaction ID
                  </label>

                  <span
                    className={`text-[11px] font-bold ${
                      validUtr ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {validUtr ? "Ready ✓" : "Required"}
                  </span>
                </div>

                <input
                  id="utr"
                  type="text"
                  value={utr}
                  onChange={(event) => {
                    setUtr(event.target.value);
                    setNotice(null);
                  }}
                  placeholder="Enter UTR or transaction reference"
                  autoComplete="off"
                  required
                  className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />

                <p className="mt-2 text-xs font-medium text-slate-400">
                  Payment receipt se exact UTR copy karein.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Deposit total
                  </span>

                  <span className="text-xl font-black text-violet-700">
                    {displayAmount}
                  </span>
                </div>

                <div className="my-3 h-px bg-slate-200" />

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">
                    UTR verification
                  </span>

                  <span
                    className={
                      validUtr
                        ? "font-black text-emerald-600"
                        : "font-black text-amber-600"
                    }
                  >
                    {validUtr ? "Ready to submit" : "UTR required"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!validAmount || !validUtr || loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Deposit Request <span>→</span>
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-violet-600">
                Help
              </p>
              <h2 className="mt-1 text-xl font-black">Common questions</h2>
            </div>

            <span className="text-xs font-medium text-slate-400">
              Tap to open
            </span>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {FAQS.map(([question, answer], index) => (
              <div
                key={question}
                className={`overflow-hidden rounded-2xl border ${
                  openFaq === index
                    ? "border-violet-200 bg-violet-50"
                    : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-3 p-4 text-left text-xs font-black"
                >
                  <span>{question}</span>

                  <span
                    className={`text-lg text-violet-600 transition ${
                      openFaq === index ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {openFaq === index && (
                  <p className="border-t border-violet-100 px-4 pb-4 pt-3 text-xs font-medium leading-5 text-slate-600">
                    {answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}


