"use client";

import { useEffect, useState } from "react";

type Popup = {
  id: number;
  title: string;
  message: string;
  imageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  targetType: "ALL" | "SPECIFIC";
  active: boolean;
  showOnce: boolean;
  expiresAt: string | null;
  type?: "ANNOUNCEMENT" | "SUCCESS" | "OFFER" | "WARNING" | "MAINTENANCE";
  theme?: "CYAN" | "VIOLET" | "GREEN" | "ORANGE" | "RED" | "DARK";
  priority?: number;
  autoClose?: number | null;
};

export default function UserPopup() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    async function loadPopup() {
      try {
        const response = await fetch("/api/popups", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        const nextPopup = Array.isArray(data?.popups)
          ? data.popups[0]
          : data?.popup;

        if (!nextPopup) return;

        setPopup(nextPopup);

        requestAnimationFrame(() => {
          setTimeout(() => setVisible(true), 80);
        });
      } catch {
        // Ignore popup loading errors.
      }
    }

    loadPopup();
  }, []);

  function closePopup() {
    if (!popup) return;

    trackEvent("DISMISS");

    setClosing(true);
    setVisible(false);

    setTimeout(async () => {
      try {
        await fetch("/api/popups/dismiss", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            popupId: popup.id,
          }),
        });
      } catch {
        // Ignore dismissal errors.
      }

      setPopup(null);
      setClosing(false);
    }, 300);
  }

  function trackEvent(type: "CLICK" | "DISMISS") {
    if (!popup) return;

    fetch("/api/popups/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ popupId: popup.id, type }),
    }).catch(() => {});
  }

  function openButton() {
    if (!popup?.buttonUrl) return;

    trackEvent("CLICK");

    if (
      popup.buttonUrl.startsWith("http://") ||
      popup.buttonUrl.startsWith("https://")
    ) {
      window.open(
        popup.buttonUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      window.location.href = popup.buttonUrl;
    }
  }

  useEffect(() => {
    if (!popup?.autoClose || popup.autoClose <= 0 || !visible) {
      setRemaining(null);
      return;
    }

    setRemaining(popup.autoClose);

    const started = Date.now();

    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = Math.max(popup.autoClose! - elapsed, 0);

      setRemaining(left);

      if (left <= 0) {
        window.clearInterval(timer);
        closePopup();
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [popup?.id, popup?.autoClose, visible]);

  const theme = popup?.theme || "CYAN";

  const themeConfig = {
    CYAN: {
      glow: "from-cyan-400/30 to-blue-500/20",
      accent: "from-cyan-400 via-blue-500 to-cyan-400",
      badge: "bg-cyan-50 text-cyan-700 border-cyan-100",
      button: "bg-cyan-600 hover:bg-cyan-700",
      icon: "🔷",
    },
    VIOLET: {
      glow: "bg-violet-500/20",
      accent: "via-violet-400",
      badge: "bg-violet-50 text-violet-700 border-violet-100",
      button: "bg-violet-600 hover:bg-violet-700",
      icon: "✦",
    },
    GREEN: {
      glow: "bg-emerald-500/20",
      accent: "via-emerald-400",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      button: "bg-emerald-600 hover:bg-emerald-700",
      icon: "✓",
    },
    ORANGE: {
      glow: "bg-orange-500/20",
      accent: "via-orange-400",
      badge: "bg-orange-50 text-orange-700 border-orange-100",
      button: "bg-orange-500 hover:bg-orange-600",
      icon: "⚡",
    },
    RED: {
      glow: "bg-red-500/20",
      accent: "via-red-400",
      badge: "bg-red-50 text-red-700 border-red-100",
      button: "bg-red-600 hover:bg-red-700",
      icon: "!",
    },
    DARK: {
      glow: "bg-slate-500/20",
      accent: "via-slate-300",
      badge: "bg-slate-800 text-slate-200 border-slate-700",
      button: "bg-slate-900 hover:bg-slate-800",
      icon: "◉",
    },
  }[theme];

  if (!popup) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden p-4 transition-all duration-500 ${
        visible && !closing
          ? "bg-slate-950/65 backdrop-blur-xl"
          : "bg-transparent backdrop-blur-0"
      }`}
    >
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-[130px] transition-all duration-700 ${
          visible
            ? "scale-100 opacity-100"
            : "scale-50 opacity-0"
        }`}
      />

      <div
        className={`relative w-full max-w-[470px] overflow-hidden rounded-[34px] border border-white/30 bg-white shadow-[0_40px_120px_rgba(0,0,0,.4)] transition-all duration-500 ${
          visible && !closing
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[.92] opacity-0"
        }`}
      >
        <div className={`absolute inset-x-0 top-0 z-30 h-[2px] bg-gradient-to-r from-transparent ${themeConfig.accent} to-transparent`} />

        {/* Floating iOS-style sparkle */}
        <div
          className={`pointer-events-none absolute right-7 top-7 z-30 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20 text-2xl shadow-xl backdrop-blur-xl transition-all duration-700 ${
            visible
              ? "translate-y-0 rotate-0 opacity-100"
              : "-translate-y-5 rotate-12 opacity-0"
          }`}
        >
          ✨
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close announcement"
          className="group absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white shadow-lg backdrop-blur-xl transition duration-300 hover:scale-110 hover:bg-black/35"
        >
          <span className="text-[22px] font-light leading-none transition duration-300 group-hover:rotate-90">
            ×
          </span>
        </button>

        {/* Hero */}
        {popup.imageUrl ? (
          <div className="relative h-[235px] overflow-hidden bg-slate-950">
            <img
              src={popup.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />

            <div className="absolute bottom-6 left-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-black text-cyan-300 shadow-lg backdrop-blur-xl">
                  D
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
                    DreamSMM
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
                    <span className="text-[9px] font-medium text-slate-300">
                      Official announcement
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-[220px] overflow-hidden bg-[#07111f]">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="absolute right-8 top-9 h-28 w-28 rounded-full border border-white/10" />
            <div className="absolute right-14 top-15 h-16 w-16 rounded-full border border-cyan-300/10" />

            {/* iPhone-style notification icon */}
            <div className="absolute right-10 top-20 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/10 text-3xl shadow-2xl backdrop-blur-xl">
              🔔
            </div>

            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#07111f] to-transparent" />

            <div className="absolute bottom-7 left-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg font-black text-cyan-300 shadow-xl backdrop-blur-xl">
                  D
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
                    DreamSMM
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Official announcement
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />

                <span className="text-[10px] font-semibold text-slate-400">
                  Important update
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative px-7 pb-7 pt-6">
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${themeConfig.badge}`}>
            <span className="text-sm">✨</span>

            <span className="text-[9px] font-black uppercase tracking-[0.16em]">
              {popup.type || "ANNOUNCEMENT"}
            </span>
          </div>

          <h2 className="text-[26px] font-black leading-[1.12] tracking-[-0.035em] text-slate-950">
            {popup.title}
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-[14px] leading-6 text-slate-500">
            {popup.message}
          </p>

          {popup.buttonText && popup.buttonUrl && (
            <button
              type="button"
              onClick={openButton}
              className={`group mt-6 flex w-full items-center justify-center gap-3 rounded-[18px] px-5 py-4 text-sm font-bold text-white shadow-[0_14px_35px_rgba(7,17,31,.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(7,17,31,.32)] ${themeConfig.button}`}
            >
              <span>{popup.buttonText}</span>

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-base transition duration-300 group-hover:translate-x-1 group-hover:bg-white/15">
                →
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={closePopup}
            className="mt-3 w-full rounded-[18px] px-5 py-3 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
          >
            Maybe later
          </button>

          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-slate-100" />

            <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-slate-300">
              DreamSMM • Official
            </span>

            <span className="h-px w-8 bg-slate-100" />
          </div>
        </div>

        <div className="h-[3px] w-full bg-slate-100">
          <div className="h-full w-1/3 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
        </div>
      </div>
    </div>
  );
}