"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-[#635bff] to-[#8b5cf6] text-white shadow-lg shadow-[#635bff]/20 hover:-translate-y-0.5 hover:shadow-[#635bff]/30",
    secondary:
      "border border-white/10 bg-white/[0.05] text-gray-200 hover:bg-white/[0.09]",
    danger:
      "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15",
    ghost:
      "text-gray-400 hover:bg-white/[0.05] hover:text-white",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-6 text-sm",
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}