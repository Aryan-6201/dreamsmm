"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: "⌂" },
  { name: "Services", href: "/services", icon: "◈" },
  { name: "Orders", href: "/orders", icon: "▣" },
  { name: "Add Funds", href: "/funds", icon: "＋" },
  { name: "Transactions", href: "/transactions", icon: "↕" },
  { name: "Tickets", href: "/tickets", icon: "□" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] border-r border-white/[0.07] bg-[#080b12] lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-white/[0.07] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#635bff] to-[#925cf6] font-bold text-white shadow-lg shadow-[#635bff]/20">
              D
            </div>

            <div>
              <div className="text-lg font-extrabold tracking-tight">
                Dream<span className="text-[#8b7cff]">SMM</span>
              </div>

              <div className="text-[9px] tracking-[0.18em] text-gray-600">
                SOCIAL MEDIA PANEL
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600">
            Menu
          </p>

          <div className="space-y-1">
            {menu.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#635bff]/15 to-[#8b5cf6]/5 text-white shadow-inner"
                      : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-200"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-base transition ${
                      active
                        ? "bg-[#635bff]/15 text-[#8b7cff]"
                        : "bg-white/[0.03] text-gray-600 group-hover:text-gray-300"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">{item.name}</span>

                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8b7cff] shadow-[0_0_10px_#8b7cff]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Support */}
          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600">
            Support
          </p>

          <Link
            href="/tickets"
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-white/[0.04] hover:text-gray-200"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.03] text-gray-600 group-hover:text-gray-300">
              ?
            </span>

            <span>Help Center</span>
          </Link>
        </nav>

        {/* Balance */}
        <div className="border-t border-white/[0.07] p-4">
          <div className="rounded-2xl border border-[#635bff]/10 bg-gradient-to-br from-[#635bff]/10 to-[#925cf6]/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
              Account Balance
            </p>

            <p className="mt-2 text-xl font-bold text-white">
              ₹0.00
            </p>

            <Link
              href="/funds"
              className="mt-3 flex h-9 items-center justify-center rounded-lg bg-[#635bff] text-xs font-semibold text-white transition hover:bg-[#7169ff]"
            >
              Add Funds
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#635bff]/10 text-sm font-bold text-[#8b7cff]">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-300">
                Account
              </p>

              <p className="text-xs text-gray-600">
                User account
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}