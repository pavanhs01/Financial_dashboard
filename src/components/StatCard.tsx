import React from 'react';

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'good' | 'bad' | 'brand';
}) {
  const tones: Record<string, string> = {
    neutral: 'from-white/70 to-white/30 dark:from-white/10 dark:to-white/5',
    good: 'from-emerald-50 to-white dark:from-emerald-500/15 dark:to-white/5',
    bad: 'from-rose-50 to-white dark:from-rose-500/15 dark:to-white/5',
    brand: 'from-indigo-50 to-white dark:from-indigo-500/15 dark:to-white/5',
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-gradient-to-b ${
        tones[tone]
      } p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {value}
          </div>
          {hint ? <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</div> : null}
        </div>
        {icon ? (
          <div className="h-10 w-10 rounded-xl bg-white/70 dark:bg-white/10 border border-zinc-200/70 dark:border-white/10 grid place-items-center">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
