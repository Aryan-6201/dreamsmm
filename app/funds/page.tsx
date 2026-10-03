"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_UPI_ID = "aryan251@ybl";
const DEFAULT_QR_IMAGE = "/qr.jpeg";
const DEFAULT_PAYMENT_NAME = "Aryan";
const DEFAULT_PAYMENT_DESCRIPTION = "Scan the QR code using any UPI app and complete your payment. After payment, enter the exact UTR / Transaction ID below and submit your deposit request."
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
  const [paymentSettings, setPaymentSettings] = useState({
    payment_upi_id: DEFAULT_UPI_ID,
    payment_description: DEFAULT_PAYMENT_DESCRIPTION,
    payment_name: DEFAULT_PAYMENT_NAME,
    payment_qr: DEFAULT_QR_IMAGE,
  });
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/payment-settings", {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.settings) {
          setPaymentSettings(data.settings);
        }
      })
      .catch(() => {
        // Keep default payment settings if the API is unavailable.
      });
  }, []);
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
      await navigator.clipboard.writeText(paymentSettings.payment_upi_id);
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

      setShowSuccessAnimation(true);
      window.setTimeout(() => setShowSuccessAnimation(false), 3200);

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

  const successOverlay = showSuccessAnimation ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="fund-coin fund-coin-1">₹</span>
          <span className="fund-coin fund-coin-2">₹</span>
          <span className="fund-coin fund-coin-3">₹</span>
          <span className="fund-coin fund-coin-4">₹</span>
          <span className="fund-coin fund-coin-5">₹</span>
        </div>
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 fund-success-pop">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-3xl font-black text-white">
            ✓
          </div>
        </div>
        <p className="relative mt-5 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Payment Submitted</p>
        <h2 className="relative mt-2 text-3xl font-black text-slate-950">₹{numberAmount.toLocaleString("en-IN")}</h2>
        <p className="relative mt-2 text-sm font-medium text-slate-500">Your deposit request has been submitted successfully.</p>
      </div>
    </div>
  ) : null;

  return (    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-4 py-5 text-slate-900 sm:px-6 sm:py-8">
      <style>{`
        @keyframes fundSuccessPop {
          0% { transform: scale(.5); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fundCoinBurst {
          0% { transform: translate(0, 20px) scale(.4) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(var(--coin-x), var(--coin-y)) scale(1) rotate(360deg); opacity: 0; }
        }
        .fund-success-pop {
          animation: fundSuccessPop .55s cubic-bezier(.2,.8,.2,1) both;
        }
        .fund-coin {
          position: absolute;
          left: 50%;
          top: 42%;
          font-size: 24px;
          font-weight: 900;
          color: #10b981;
          animation: fundCoinBurst 1.8s ease-out forwards;
        }
        .fund-coin-1 { --coin-x: -130px; --coin-y: -90px; animation-delay: .05s; }
        .fund-coin-2 { --coin-x: 120px; --coin-y: -100px; animation-delay: .12s; }
        .fund-coin-3 { --coin-x: -150px; --coin-y: 30px; animation-delay: .18s; }
        .fund-coin-4 { --coin-x: 145px; --coin-y: 35px; animation-delay: .08s; }
        .fund-coin-5 { --coin-x: -80px; --coin-y: 105px; animation-delay: .2s; }
      `}</style>
      {successOverlay}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-teal-500/20 blur-xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-xl" />
      </div>
          <div className="mt-3 grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_1fr]">
            <section className="order-1 h-[325.43px] w-full max-w-[928.4px] overflow-hidden rounded-3xl border border-white/10 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 lg:order-1">
              <form onSubmit={submitRequest} className="space-y-3 p-4 sm:p-5">
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
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
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
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
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

                <div className="mt-1 flex gap-2">
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
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-lg font-black outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!validAmount || !validUtr || loading}
                    className="h-10 shrink-0 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-7 text-sm font-black text-white shadow-md shadow-teal-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? "..." : "Pay"}
                  </button>
                </div>

                <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-6">
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
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </section>

          <aside className="order-2 rounded-3xl border border-white/10 bg-white/95 p-4 shadow-2xl shadow-black/20 backdrop-blur-sm transition duration-300 lg:order-1 lg:sticky lg:top-5 lg:p-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <img
                src={paymentSettings.payment_qr}
                alt="UPI payment QR code"
                className="mx-auto block h-auto w-full max-w-[300px] rounded-xl bg-white object-contain shadow-lg sm:max-w-[320px]"
              />
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
              <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">
                {paymentSettings.payment_description}
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-teal-50 p-2.5 sm:p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-500">
                UPI ID
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-black text-teal-950">
                  {paymentSettings.payment_upi_id}
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
          </aside>
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

<style>{`
@keyframes premiumFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
main { animation: premiumFade .45s ease-out; }
@media (prefers-reduced-motion: reduce) { main { animation: none; } }
`}</style>
    </main>
  );
}
















