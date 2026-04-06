import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600 shadow-sm shadow-indigo-600/10',
    secondary:
      'bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15 dark:border-white/10',
    ghost:
      'bg-transparent text-zinc-700 hover:bg-zinc-100 border border-transparent dark:text-zinc-200 dark:hover:bg-white/10',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 border border-rose-600 shadow-sm shadow-rose-600/10',
  };
  const sizes: Record<string, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
