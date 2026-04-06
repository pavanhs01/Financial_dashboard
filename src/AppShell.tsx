import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import supabase, { supabaseConfigError } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import AuthGate from './components/AuthGate';
import Overview from './pages/Overview';
import Records from './pages/Records';
import Settings from './pages/Settings';
import { apiJson } from './lib/api';
import type { Role } from './lib/api';

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? (saved as any) : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggle } = useTheme();
  const loc = useLocation();

  const [token, setToken] = useState<string | null>(null);
  const [, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const title = useMemo(() => {
    if (loc.pathname === '/') return { t: 'Overview', s: 'Snapshot of totals, trends, and recent activity' };
    if (loc.pathname.startsWith('/records')) return { t: 'Records', s: 'Filter, search, and manage financial transactions' };
    return { t: 'Settings', s: 'Permissions and environment' };
  }, [loc.pathname]);

  const refreshSession = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const t = data.session?.access_token || null;
    setToken(t);
    setEmail(data.session?.user?.email ?? null);
    if (t) {
      try {
        const s = await apiJson<{ user: { id: string; email: string }; role: Role }>('/api/auth-session', {
          headers: { Authorization: `Bearer ${t}` },
        });
        setRole(s.role);
      } catch {
        setRole(null);
      }
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    refreshSession();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshSession();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (supabaseConfigError) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-zinc-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
            <div className="text-lg font-semibold">Local setup required</div>
            <p className="mt-2 text-sm leading-6">
              {supabaseConfigError}
            </p>
            <p className="mt-3 text-sm leading-6">
              Create a <code>.env</code> file with <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>,
              then restart the dev server.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-zinc-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <AuthGate onDone={refreshSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-zinc-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950">
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </div>
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Topbar
              title={title.t}
              subtitle={title.s}
              theme={theme}
              onToggleTheme={toggle}
              token={token}
              role={role}
              onRoleChanged={(r) => setRole(r)}
            />

            <div className="mt-6">
              <Routes>
                <Route path="/" element={<Overview token={token} />} />
                <Route path="/records" element={<Records token={token} role={role || 'Viewer'} />} />
                <Route path="/settings" element={<Settings role={role || 'Viewer'} />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-zinc-950/40 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-3 py-2 flex gap-2 justify-between text-xs">
          <a className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10" href="#/">
            Overview
          </a>
          <a className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10" href="#/records">
            Records
          </a>
        </div>
      </div>
    </div>
  );
}
