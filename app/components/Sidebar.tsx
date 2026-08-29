"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Layers3,
  Wallet,
  RotateCcw,
  Headphones,
  ListOrdered,
  Code2,
  UserRound,
  LogOut,
  X,
  ChevronRight,
  Sparkles,
  Users,
  BookOpen,
  PanelLeft,
  Menu,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ============================================================
   MAIN MENU
============================================================ */

const mainItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "New Order",
    href: "/",
    icon: ShoppingCart,
  },
  {
    label: "Services",
    href: "/services",
    icon: Layers3,
  },
  {
    label: "Orders History",
    href: "/orders",
    icon: ListOrdered,
  },
  {
    label: "Balance",
    href: "/funds",
    icon: Wallet,
  },
  {
    label: "Refunds",
    href: "/orders/refunds",
    icon: RotateCcw,
  },
  {
    label: "Support Tickets",
    href: "/tickets",
    icon: Headphones,
    badge: 4,
  },
  {
    label: "Refill",
    href: "/refill",
    icon: RotateCcw,
  },
  {
    label: "Mass Order",
    href: "/massorder",
    icon: ListOrdered,
  },
];

/* ============================================================
   TOOLS
============================================================ */

const toolItems = [
  {
    label: "API",
    href: "/api",
    icon: Code2,
  },
  {
    label: "Child Panel",
    href: "/child-panel",
    icon: PanelLeft,
  },
  {
    label: "Blog",
    href: "/blog",
    icon: BookOpen,
  },
  {
    label: "Affiliates",
    href: "/affiliates",
    icon: Users,
  },
];

/* ============================================================
   SIDEBAR
============================================================ */

export default function Sidebar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  /* ----------------------------------------------------------
     Lock body while mobile sidebar is open
  ---------------------------------------------------------- */

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* ----------------------------------------------------------
     Close mobile menu when resizing to desktop
  ---------------------------------------------------------- */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* ----------------------------------------------------------
     Active route
  ---------------------------------------------------------- */

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }

    if (href === "/orders") {
      return (
        pathname === "/orders" ||
        pathname.startsWith("/orders/")
      );
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="fixed inset-x-0 top-0 z-[90] flex h-[70px] items-center justify-between border-b border-violet-100 bg-white/95 px-4 shadow-[0_6px_28px_rgba(76,29,149,.07)] backdrop-blur-xl lg:hidden">

        <Link
          href="/dashboard"
          onClick={closeMobile}
          className="flex items-center gap-3"
        >
          <Brand />

          <div>
            <p className="text-[16px] font-black tracking-[-.035em] text-slate-950">
              Dream<span className="text-violet-600">SMM</span>
            </p>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.18em] text-slate-400">
              Premium Panel
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700 shadow-sm transition-all duration-200 hover:bg-violet-100 active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

      </header>

      {/* ======================================================
          MOBILE BACKDROP
      ====================================================== */}

      <div
        onClick={() => setMobileOpen(false)}
        className={`
          fixed inset-0 z-[100] bg-slate-950/20 backdrop-blur-[2px]
          transition-opacity duration-300 lg:hidden
          ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[110]
          flex h-screen w-[min(400px,100vw)] max-w-[100vw] flex-col
          overflow-hidden
          border-r border-violet-100
          bg-[#faf9ff]
          shadow-[18px_0_55px_rgba(76,29,149,.10)]
          transition-transform duration-300
          ease-[cubic-bezier(.22,1,.36,1)]
          sm:w-[400px]
          lg:w-[260px]
          lg:translate-x-0

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* ====================================================
            BACKGROUND EFFECTS
        ==================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-violet-200/25 blur-[90px]" />

          <div className="absolute -bottom-32 -right-28 h-80 w-80 rounded-full bg-indigo-100/35 blur-[100px]" />

          <div
            className="absolute inset-0 opacity-[.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle,#7c3aed .7px,transparent .7px)",
              backgroundSize: "22px 22px",
            }}
          />

        </div>

        {/* ====================================================
            BRAND HEADER
        ==================================================== */}

        <div className="relative flex h-[80px] shrink-0 items-center border-b border-violet-100 bg-white/85 px-4 backdrop-blur-xl">

          <Link
            href="/dashboard"
            onClick={closeMobile}
            className="group flex min-w-0 items-center gap-3"
          >

            <Brand />

            <div className="min-w-0">

              <p className="truncate text-[16px] font-black tracking-[-.035em] text-slate-950">
                Dream<span className="text-violet-600">SMM</span>
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,.5)]" />

                <span className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">
                  Online workspace
                </span>

              </div>

            </div>

          </Link>

          {/* Mobile close */}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav
          className="
            relative min-h-0 flex-1
            overflow-y-auto
            overscroll-contain
            px-3 pb-5 pt-5
            [scrollbar-width:thin]
            [scrollbar-color:#ddd6fe_transparent]
          "
        >

          {/* MAIN MENU */}

          <SectionTitle>
            Main Menu
          </SectionTitle>

          <div className="space-y-1.5">

            {mainItems.map((item) => (
              <NavItem
                key={item.href + item.label}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={isActive(item.href)}
                badge={item.badge}
                onClick={closeMobile}
              />
            ))}

          </div>

          {/* DIVIDER */}

          <div className="my-5 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />

          {/* TOOLS */}

          <SectionTitle>
            Tools
          </SectionTitle>

          <div className="space-y-1.5">

            {toolItems.map((item) => (
              <NavItem
                key={item.href}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={isActive(item.href)}
                onClick={closeMobile}
              />
            ))}

          </div>

          {/* ==================================================
              PREMIUM CARD
          ================================================== */}

          <div className="mt-6 rounded-[20px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 shadow-[0_8px_28px_rgba(76,29,149,.055)]">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_7px_18px_rgba(109,40,217,.22)]">
                <Sparkles className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[11px] font-black text-slate-900">
                  Premium Workspace
                </p>

                <p className="mt-1 text-[9px] font-medium leading-4 text-slate-500">
                  Everything you need in one place.
                </p>

              </div>

              <Zap className="h-4 w-4 shrink-0 text-violet-500" />

            </div>

          </div>

        </nav>

        {/* ====================================================
            BOTTOM ACCOUNT
        ==================================================== */}

        <div className="relative shrink-0 border-t border-violet-100 bg-white/90 p-3 backdrop-blur-xl">

          <Link
            href="/account"
            onClick={closeMobile}
            className="group flex min-h-[52px] items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-violet-50"
          >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-violet-100 group-hover:text-violet-600">
              <UserRound className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[12px] font-bold text-slate-800">
                My Account
              </p>

              <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                Profile & settings
              </p>

            </div>

            <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500" />

          </Link>

          <Link
            href="/login"
            onClick={closeMobile}
            className="group mt-0.5 flex min-h-[44px] items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-red-50"
          >

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition group-hover:text-red-500">
              <LogOut className="h-4 w-4" />
            </div>

            <span className="text-[11px] font-bold text-slate-500 transition group-hover:text-red-500">
              Sign out
            </span>

          </Link>

        </div>

      </aside>

      {/* ======================================================
          MOBILE OFFSET
      ====================================================== */}

      <div className="h-[70px] lg:hidden" />
    </>
  );
}

/* =============================================================
   NAV ITEM
============================================================= */

function NavItem({
  label,
  href,
  icon: Icon,
  active,
  badge,
  onClick,
}: {
  label: string;
  href: string;
  icon: React.ElementType;
   active: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group relative flex min-h-[50px] items-center gap-3
        overflow-hidden rounded-[14px] px-3
        transition-all duration-200

        ${
          active
            ? "border border-violet-200 bg-gradient-to-r from-violet-100 via-violet-50 to-white text-violet-800 shadow-[0_7px_22px_rgba(124,58,237,.10)]"
            : "border border-transparent bg-transparent text-slate-700 hover:border-violet-100 hover:bg-white hover:text-violet-700 hover:shadow-[0_5px_18px_rgba(76,29,149,.045)]"
        }
      `}
    >

      {/* Active indicator */}

      {active && (
        <span className="absolute left-0 top-2.5 h-7 w-[3px] rounded-r-full bg-gradient-to-b from-violet-600 to-indigo-600" />
      )}

      {/* Icon */}

      <span
        className={`
          flex h-10 w-10 shrink-0 items-center justify-center
          rounded-xl transition-all duration-200

          ${
            active
              ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_7px_18px_rgba(109,40,217,.22)]"
              : "bg-slate-50 text-slate-600 group-hover:bg-violet-50 group-hover:text-violet-700"
          }
        `}
      >
        <Icon className="h-[19px] w-[19px]" />
      </span>

      {/* Text */}

      <span
        className={`
          flex-1 text-[14px] font-bold leading-none
          ${
            active
              ? "text-violet-800"
              : "text-slate-700"
          }
        `}
      >
        {label}
      </span>

      {/* Badge */}

      {badge !== undefined && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-2 text-[10px] font-black text-white shadow-sm">
          {badge}
        </span>
      )}

      {/* Arrow */}

      <ChevronRight
        className={`
          h-4 w-4 shrink-0 transition-all duration-200

          ${
            active
              ? "text-violet-500"
              : "text-slate-300 opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-violet-500"
          }
        `}
      />

    </Link>
  );
}

/* =============================================================
   SECTION TITLE
============================================================= */

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 px-2">

      <span className="text-[10px] font-black uppercase tracking-[.20em] text-slate-500">
        {children}
      </span>

    </div>
  );
}

/* =============================================================
   BRAND
============================================================= */

function Brand() {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white shadow-[0_8px_22px_rgba(109,40,217,.24)]">

      <span className="relative z-10 text-2xl font-black tracking-tight">D</span>

      <span className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />

      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />

    </div>
  );
}







