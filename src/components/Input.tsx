import React from 'react';

export function Input({
  label,
  hint,
  error,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <label className={`block ${className}`}>
      {label ? <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{label}</div> : null}
      <input
        {...props}
        className={`mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:ring-2 focus:ring-indigo-500/40 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
          error
            ? 'border-rose-300 dark:border-rose-500/40'
            : 'border-zinc-200 dark:border-white/10'
        }`}
      />
      {error ? <div className="mt-1 text-xs text-rose-600 dark:text-rose-300">{error}</div> : null}
      {hint && !error ? <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</div> : null}
    </label>
  );
}

export function Select({
  label,
  hint,
  error,
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <label className={`block ${className}`}>
      {label ? <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{label}</div> : null}
      <select
        {...props}
        className={`mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:ring-2 focus:ring-indigo-500/40 dark:bg-white/5 dark:text-zinc-100 dark:[color-scheme:dark] ${
          error
            ? 'border-rose-300 dark:border-rose-500/40'
            : 'border-zinc-200 dark:border-white/10'
        }`}
      >
        {children}
      </select>
      {error ? <div className="mt-1 text-xs text-rose-600 dark:text-rose-300">{error}</div> : null}
      {hint && !error ? <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</div> : null}
    </label>
  );
}
