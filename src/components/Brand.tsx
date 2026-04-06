import { Landmark } from 'lucide-react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 grid place-items-center shadow-sm">
        <Landmark className="h-5 w-5 text-white" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Financial</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Role-based dashboard</div>
        </div>
      )}
    </div>
  );
}
