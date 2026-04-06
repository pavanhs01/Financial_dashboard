import { useEffect, useMemo, useRef, useState } from 'react';
import { Shield, Sparkles, Eye } from 'lucide-react';
import supabase from '../lib/supabase';
import { apiJson } from '../lib/api';
import type { Role } from '../lib/api';
import Portal from './Portal';

function roleMeta(role: Role) {
  if (role === 'Admin') {
    return {
      label: 'Admin',
      desc: 'Full access',
      icon: Shield,
      classes:
        'border-rose-200/70 bg-rose-50 text-rose-800 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200',
    };
  }
  if (role === 'Analyst') {
    return {
      label: 'Analyst',
      desc: 'Analytics access',
      icon: Sparkles,
      classes:
        'border-violet-200/70 bg-violet-50 text-violet-800 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-200',
    };
  }
  return {
    label: 'Viewer',
    desc: 'Read only',
    icon: Eye,
    classes:
      'border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200',
  };
}

export default function RoleSwitcher({
  token,
  currentRole,
  onRoleChanged,
}: {
  token: string;
  currentRole: Role | null;
  onRoleChanged: (r: Role) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busyRole, setBusyRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const roles: Role[] = ['Viewer', 'Analyst', 'Admin'];

  const active = useMemo(() => (currentRole ? roleMeta(currentRole) : null), [currentRole]);

  const choose = async (role: Role) => {
    setError(null);
    setBusyRole(role);
    try {
      if (!supabase) throw new Error('Supabase is not configured');
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      const email = data.user?.email;
      if (!userId) throw new Error('Not authenticated');

      await apiJson('/api/role', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, email, role }),
      });

      onRoleChanged(role);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to change role');
    } finally {
      setBusyRole(null);
    }
  };

  const recomputePos = () => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 280;
    const left = Math.min(window.innerWidth - width - 8, Math.max(8, rect.right - width));
    const top = rect.bottom + 8;
    setPos({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    recomputePos();
    const onScroll = () => recomputePos();
    const onResize = () => recomputePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = btnRef.current;
      if (btn && btn.contains(target)) return;
      if (target.closest('[data-role-switcher-menu]')) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          setOpen((v) => {
            const nv = !v;
            if (nv) queueMicrotask(recomputePos);
            return nv;
          });
        }}
        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 h-10 text-sm text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-white/10"
        aria-label="Choose role"
      >
        {active ? (
          <>
            <active.icon className="h-4 w-4" />
            <span className="font-semibold">{active.label}</span>
          </>
        ) : (
          <span className="font-semibold">Role</span>
        )}
        <span className="text-zinc-400">▾</span>
      </button>

      {open && pos ? (
        <Portal>
          <div
            data-role-switcher-menu
            className="fixed w-[280px] rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/95 dark:bg-zinc-950/85 backdrop-blur-xl shadow-lg p-2"
            style={{ top: pos.top, left: pos.left, zIndex: 9999 }}
          >
          <div className="px-2 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200">Select role</div>
          <div className="mt-1 grid gap-2">
            {roles.map((r) => {
              const m = roleMeta(r);
              const Icon = m.icon;
              const isBusy = busyRole === r;
              const isActive = currentRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => choose(r)}
                  disabled={!!busyRole}
                  className={`w-full text-left rounded-2xl border p-3 transition ${m.classes} ${
                    isActive ? 'ring-2 ring-indigo-500/30' : 'hover:brightness-[0.98]'
                  } disabled:opacity-60`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="text-sm font-semibold">
                          {m.label}{' '}
                          {isBusy ? <span className="text-xs font-medium opacity-80">(saving)</span> : null}
                        </div>
                        <div className="text-xs opacity-80">{m.desc}</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold opacity-80">{isActive ? 'Active' : ''}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {error ? (
            <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded-xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10"
          >
            Close
          </button>
          </div>
        </Portal>
      ) : null}
    </div>
  );
}
