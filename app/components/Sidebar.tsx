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
    const handleOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="fixed left-5 top-5 z-[100]">
      {/* Large menu button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg transition-all duration-200 ${
          open
            ? "border-violet-400 bg-violet-600 text-white shadow-violet-500/25"
            : "border-violet-200 bg-white text-violet-700 shadow-violet-900/10 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50"
        }`}
      >
        <span className="text-[25px] leading-none">{open ? "×" : "☰"}</span>
      </button>

      {/* Navigation panel */}
      {open && (
        <div className="absolute left-0 top-[60px] w-[300px] overflow-hidden rounded-3xl border border-violet-100 bg-white p-3 shadow-[0_24px_70px_rgba(76,29,149,0.18)]">
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 font-black text-white">
              D
            </div>

            <div>
              <p className="text-base font-black text-slate-900">
                Dream<span className="text-violet-600">SMM</span>
              </p>
              <p className="text-[9px] font-bold tracking-[0.16em] text-slate-400">
                SOCIAL MEDIA PANEL
              </p>
            </div>
          </div>

          <p className="px-3 pb-2 pt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Menu
          </p>

          <nav className="space-y-1">
            {menu.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-bold transition-all ${
                    active
                      ? "bg-violet-100 text-violet-800"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-base ${
                      active
                        ? "bg-violet-200 text-violet-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">{item.name}</span>

                  {active && (
                    <span className="h-2 w-2 rounded-full bg-violet-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 border-t border-violet-100 pt-3">
            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Account Balance
              </p>

              <p className="mt-1 text-xl font-black text-violet-800">
                ₹0.00
              </p>

              <Link
                href="/funds"
                onClick={() => setOpen(false)}
                className="mt-3 flex h-10 items-center justify-center rounded-xl bg-violet-600 text-xs font-bold text-white transition hover:bg-violet-700"
              >
                Add Funds
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}