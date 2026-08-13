import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
};

export default function Badge({
  children,
  variant = "neutral",
}: BadgeProps) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/15",
    danger: "bg-red-500/10 text-red-400 border-red-500/15",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/15",
    neutral: "bg-white/[0.05] text-gray-400 border-white/[0.08]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
}