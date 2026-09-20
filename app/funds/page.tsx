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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-4 py-5 text-slate-900 sm:px-6 sm:py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-teal-500/20 blur-xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-xl" />
      </div>
      <div className="relative mx-auto max-w-5xl">
<div className="mt-3 grid items-start gap-3 sm:gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="order-2 rounded-3xl border border-white/10 bg-white/95 p-4 shadow-2xl shadow-black/20 backdrop-blur-sm transition duration-300 hover:-translate-y-1 sm:p-5 lg:order-1 lg:sticky lg:top-5 lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-teal-600">
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
                className="mx-auto aspect-square w-full max-w-[190px] rounded-xl bg-white object-contain shadow-md sm:max-w-none"
              />
            </div>

            <div className="mt-3 rounded-2xl bg-teal-50 p-2.5 sm:mt-4 sm:p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-500">
                UPI ID
              </p>

              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-black text-teal-950">
                  {UPI_ID}
                </p>

                <button
                  type="button"
                  onClick={copyUpi}
                  className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-black text-teal-700 shadow-sm ring-1 ring-teal-100"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-xs font-medium text-slate-400 sm:mt-4">
              Pay exactly <b className="text-teal-700">{displayAmount}</b>
            </p>
          </aside>

          <section className="order-1 overflow-hidden rounded-3xl border border-white/10 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 lg:order-2">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-teal-600">
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
                    Method
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
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
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
                  <label htmlFor="utr" className="text-sm font-black">
                    UPI Transaction Number/UTR
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
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Payment receipt se exact UTR copy karein.
                </p>
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

                <div className="mt-2 flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-teal-600">
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
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-lg font-black outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!validAmount || !validUtr || loading}
                    className="h-12 shrink-0 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-7 text-sm font-black text-white shadow-md shadow-teal-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? "..." : "Pay"}
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(String(preset));
                        setNotice(null);
                      }}
                      className={`rounded-lg border py-2 text-xs font-black transition ${
                        numberAmount === preset
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={!validAmount || !validUtr || loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-sm font-black text-white shadow-lg shadow-teal-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
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

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/95 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-teal-600">
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
                    ? "border-teal-200 bg-teal-50"
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
                    className={`text-lg text-teal-600 transition ${
                      openFaq === index ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {openFaq === index && (
                  <p className="border-t border-teal-100 px-4 pb-4 pt-3 text-xs font-medium leading-5 text-slate-600">
                    {answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

<style>{`
@keyframes premiumFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
main { animation: premiumFade .45s ease-out; }
@media (prefers-reduced-motion: reduce) { main { animation: none; } }
`}</style>
    </main>
  );
}
















