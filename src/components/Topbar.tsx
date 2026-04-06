import { Search, Sun, Moon } from 'lucide-react';
import RoleSwitcher from './RoleSwitcher';
import type { Role } from '../lib/api';

export function Topbar({
  title,
  subtitle,
  query,
  onQuery,
  theme,
  onToggleTheme,
  token,
  role,
  onRoleChanged,
}: {
  title: string;
  subtitle?: string;
  query?: string;
  onQuery?: (v: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  token: string;
  role: Role | null;
  onRoleChanged: (r: Role) => void;
}) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</div> : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {onQuery ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              value={query || ''}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search notes…"
              className="h-10 w-full sm:w-[260px] rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
            />
          </div>
        ) : null}

        <RoleSwitcher token={token} currentRole={role} onRoleChanged={onRoleChanged} />

        <button
          onClick={onToggleTheme}
          className="h-10 w-10 rounded-xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 grid place-items-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
