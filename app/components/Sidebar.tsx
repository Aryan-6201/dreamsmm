 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] border-r border-violet-100 bg-[#f8f5ff] text-slate-800 shadow-[8px_0_30px_rgba(76,29,149,0.06)] lg:block">
      <div className="flex h-full flex-col">

        <div className="flex h-20 items-center border-b border-violet-100 bg-white/70 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 font-bold text-white shadow-lg shadow-violet-500/20">
              D
            </div>

            <div>
              <div className="text-lg font-extrabold text-slate-900">
                Dream<span className="text-violet-600">SMM</span>
              </div>

              <div className="text-[9px] font-semibold tracking-[0.18em] text-slate-400">
                SOCIAL MEDIA PANEL
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
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
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-violet-100 text-violet-800 shadow-sm"
                      : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${
                      active
                        ? "bg-violet-200 text-violet-700"
                        : "bg-slate-100 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">{item.name}</span>

                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-violet-100 bg-white/50 p-4">
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Account Balance
            </p>

            <p className="mt-2 text-xl font-bold text-violet-800">
              ₹0.00
            </p>

            <Link
              href="/funds"
              className="mt-3 flex h-9 items-center justify-center rounded-lg bg-violet-600 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Add Funds
            </Link>
          </div>
        </div>

      </div>
    </aside>
  );
}
