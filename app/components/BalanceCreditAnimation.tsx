"use client";

import { useEffect, useState } from "react";
import { Check, Gift, Wallet, Sparkles } from "lucide-react";

type CreditEvent = {
  amount: string;
  eventType: "BALANCE" | "BONUS" | string;
};

export default function BalanceCreditAnimation() {
  const [event, setEvent] = useState<CreditEvent | null>(null);

  useEffect(() => {
    let active = true;

    const checkCredit = async () => {
      try {
        const response = await fetch("/api/balance-credit", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (active && data.event?.amount) {
          setEvent({
            amount: data.event.amount,
            eventType: data.event.eventType || "BALANCE",
          });

          window.setTimeout(() => {
            if (active) setEvent(null);
          }, 3800);
        }
      } catch {
        // Silent polling failure.
      }
    };

    checkCredit();

    const interval = window.setInterval(checkCredit, 3000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!event) return null;

  const isBonus = event.eventType === "BONUS";

  const formattedAmount = Number(event.amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <>
      <div
        className={`fixed inset-0 z-[9998] pointer-events-none backdrop-blur-[2px] ${
          isBonus
            ? "bg-amber-950/15 animate-[creditFade_.35s_ease-out]"
            : "bg-emerald-950/10 animate-[creditFade_.35s_ease-out]"
        }`}
      />

      <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-5">
        <div
          className={`relative w-full max-w-sm overflow-hidden rounded-[34px] border bg-white/95 p-8 text-center backdrop-blur-xl animate-[creditPop_.5s_cubic-bezier(.16,1,.3,1)] ${
            isBonus
              ? "border-amber-200 shadow-[0_30px_100px_rgba(245,158,11,.32)]"
              : "border-emerald-100 shadow-[0_30px_100px_rgba(16,185,129,.30)]"
          }`}
        >
          <div
            className={`absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl ${
              isBonus ? "bg-amber-300/35" : "bg-emerald-300/30"
            }`}
          />

          <div
            className={`absolute -bottom-20 -left-20 h-48 w-48 rounded-full blur-3xl ${
              isBonus ? "bg-yellow-300/25" : "bg-cyan-300/25"
            }`}
          />

          <div
            className={`relative mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] shadow-xl animate-[creditBounce_.8s_ease-out] ${
              isBonus
                ? "bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 shadow-amber-300/50"
                : "bg-emerald-500 shadow-emerald-300/40"
            }`}
          >
            {isBonus ? (
              <Gift
                className="h-12 w-12 text-white"
                strokeWidth={2.5}
              />
            ) : (
              <Check
                className="h-11 w-11 text-white"
                strokeWidth={3}
              />
            )}

            {isBonus && (
              <>
                <Sparkles className="absolute -right-2 -top-2 h-7 w-7 text-amber-500 animate-ping" />
                <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-yellow-500 animate-pulse" />
              </>
            )}
          </div>

          <div className="relative mt-6">
            <div
              className={`flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[.24em] ${
                isBonus ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {isBonus ? (
                <>
                  <Gift className="h-4 w-4" />
                  Bonus Received
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Balance Added
                </>
              )}
            </div>

            <p className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              ₹{formattedAmount}
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              {isBonus
                ? "A special bonus has been added to your wallet!"
                : "Funds have been added to your wallet successfully."}
            </p>
          </div>

          {isBonus ? (
            <>
              <span className="credit-particle bonus-1">✦</span>
              <span className="credit-particle bonus-2">✦</span>
              <span className="credit-particle bonus-3">★</span>
              <span className="credit-particle bonus-4">✦</span>
              <span className="credit-particle bonus-5">★</span>
              <span className="credit-particle bonus-6">✦</span>
              <span className="credit-particle bonus-7">★</span>
              <span className="credit-particle bonus-8">✦</span>
            </>
          ) : (
            <>
              <span className="credit-particle balance-1">₹</span>
              <span className="credit-particle balance-2">+</span>
              <span className="credit-particle balance-3">₹</span>
              <span className="credit-particle balance-4">+</span>
              <span className="credit-particle balance-5">₹</span>
              <span className="credit-particle balance-6">+</span>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes creditPop {
          0% {
            opacity: 0;
            transform: scale(0.72) translateY(30px);
          }
          70% {
            transform: scale(1.04) translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes creditBounce {
          0% {
            transform: scale(0) rotate(-18deg);
          }
          55% {
            transform: scale(1.16) rotate(6deg);
          }
          100% {
            transform: scale(1) rotate(0);
          }
        }

        @keyframes creditFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .credit-particle {
          position: absolute;
          font-weight: 900;
          animation: creditFloat 2.2s ease-out infinite;
        }

        .bonus-1 { left: 10%; top: 20%; color: rgb(245 158 11 / .75); }
        .bonus-2 { left: 22%; top: 67%; color: rgb(234 179 8 / .65); animation-delay: .2s; }
        .bonus-3 { left: 8%; top: 45%; color: rgb(251 191 36 / .7); animation-delay: .4s; }
        .bonus-4 { right: 10%; top: 20%; color: rgb(245 158 11 / .75); animation-delay: .6s; }
        .bonus-5 { right: 21%; top: 68%; color: rgb(234 179 8 / .65); animation-delay: .8s; }
        .bonus-6 { right: 8%; top: 46%; color: rgb(251 191 36 / .7); animation-delay: 1s; }
        .bonus-7 { left: 30%; top: 12%; color: rgb(245 158 11 / .65); animation-delay: 1.2s; }
        .bonus-8 { right: 30%; top: 12%; color: rgb(234 179 8 / .65); animation-delay: 1.4s; }

        .balance-1 { left: 12%; top: 28%; color: rgb(16 185 129 / .65); }
        .balance-2 { left: 23%; top: 65%; color: rgb(16 185 129 / .55); animation-delay: .25s; }
        .balance-3 { right: 14%; top: 25%; color: rgb(16 185 129 / .65); animation-delay: .5s; }
        .balance-4 { right: 24%; top: 68%; color: rgb(16 185 129 / .55); animation-delay: .75s; }
        .balance-5 { left: 7%; top: 48%; color: rgb(16 185 129 / .55); animation-delay: 1s; }
        .balance-6 { right: 7%; top: 48%; color: rgb(16 185 129 / .55); animation-delay: 1.25s; }

        @keyframes creditFloat {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(.65) rotate(-12deg);
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-42px) scale(1.2) rotate(14deg);
          }
        }
      `}</style>
    </>
  );
}
