"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: "⌂" },
  { name: "Services", href: "/services", icon: "◈" },
  { name: "Orders", href: "/orders", icon: "▣" },
  { name: "Add Funds", href: "/funds", icon: "+" },
  { name: "Transactions", href: "/transactions", icon: "↕" },
  { name: "Tickets", href: "/tickets", icon: "?" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div ref={menuRef} className="fixed right-5 top-5 z-[100]">
      {/* Always-fixed menu button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className={`relative z-[120] flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg transition-all duration-300 ${
          open
            ? "border-violet-400 bg-violet-600 text-white shadow-violet-500/30"
            : "border-violet-200 bg-white text-violet-700 shadow-violet-900/10 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50"
        }`}
      >
        <span
          className={`text-[25px] leading-none transition-transform duration-300 ${
            open ? "rotate-90" : "rotate-0"
          }`}
        >
          {open ? "×" : "☰"}
        </span>
      </button>

      {/* Full-screen navigation */}
      {open && (
        <div className="fixed inset-0 z-[110]">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]"
          />

          {/* Full-screen panel */}
          <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-white via-[#faf8ff] to-violet-50 px-5 pb-8 pt-24 sm:px-10 sm:pt-28">
            <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-5xl flex-col">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 text-xl font-black text-white shadow-lg shadow-violet-500/20">
                  D
                </div>

                <div>
                  <p className="text-2xl font-black tracking-tight text-slate-900">
                    Dream<span className="text-violet-600">SMM</span>
                  </p>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
                    SOCIAL MEDIA PANEL
                  </p>
                </div>
              </div>

              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-violet-500">
                Menu
              </p>

              <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {menu.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`group flex min-h-[82px] items-center gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                        active
                          ? "border-violet-200 bg-violet-100 text-violet-800 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg ${
                          active
                            ? "bg-violet-200 text-violet-700"
                            : "bg-slate-100 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span className="flex-1 text-base font-black">
                        {item.name}
                      </span>

                      <span className="text-xl text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-violet-500">
                        →
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-10">
                <div className="flex flex-col gap-4 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Account Balance
                    </p>
                    <p className="mt-1 text-2xl font-black text-violet-800">
                      ₹0.00
                    </p>
                  </div>

                  <Link
                    href="/funds"
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-bold text-white transition hover:bg-violet-700"
                  >
                    Add Funds
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}