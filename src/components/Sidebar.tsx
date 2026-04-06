import { NavLink } from 'react-router-dom';
import { BarChart3, FileText, Settings } from 'lucide-react';
import { Brand } from './Brand';

const nav = [
  { to: '/', label: 'Overview', icon: BarChart3 },
  { to: '/records', label: 'Records', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={`sticky top-0 h-dvh border-r border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-zinc-950/30 backdrop-blur-xl ${
        collapsed ? 'w-[84px]' : 'w-[280px]'
      } transition-[width] duration-200`}
    >
      <div className="flex h-full flex-col">
        <div className="p-4 flex items-center justify-between gap-3">
          <Brand compact={collapsed} />
          <button
            onClick={onToggle}
            className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            <span className="text-sm font-semibold">{collapsed ? '›' : '‹'}</span>
          </button>
        </div>

        <nav className="px-3 pb-4">
          <div className="space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm border transition ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/15'
                      : 'bg-transparent text-zinc-700 dark:text-zinc-200 border-transparent hover:bg-zinc-100 dark:hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mt-auto p-4">
          <div
            className={`rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-gradient-to-br from-white/70 to-white/30 dark:from-white/10 dark:to-white/5 p-4 overflow-hidden ${
              collapsed ? 'px-3 py-3' : ''
            }`}
          >
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">RBAC Enabled</div>
            {!collapsed ? (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Viewer / Analyst / Admin permissions enforced by API.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
