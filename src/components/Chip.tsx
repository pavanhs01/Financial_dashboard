import React from 'react';

export function Chip({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'good' | 'bad' | 'brand';
}) {
  const tones: Record<string, string> = {
    neutral:
      'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:border-white/10',
    good:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/25',
    bad: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/25',
    brand:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-200 dark:border-indigo-500/25',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
