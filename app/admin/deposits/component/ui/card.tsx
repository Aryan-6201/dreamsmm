import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-[#0c1019] shadow-[0_8px_40px_rgba(0,0,0,0.12)] ${className}`}
    >
      {children}
    </div>
  );
}