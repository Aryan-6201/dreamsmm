import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-xs font-semibold text-gray-400">
          {label}
        </label>
      )}

      <input
        {...props}
        className={`h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#635bff]/60 focus:bg-white/[0.045] focus:ring-4 focus:ring-[#635bff]/10 ${className}`}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}