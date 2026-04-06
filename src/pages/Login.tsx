import React, { useMemo, useState } from 'react';
import supabase, { supabaseConfigError } from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { Brand } from '../components/Brand';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export default function Login({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (mode === 'signin' ? 'Sign in' : 'Create account'), [mode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError(supabaseConfigError || 'Supabase is not configured');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // If email confirmations are enabled, there may be no session yet.
        // In that case, guide the user to sign in after confirming.
        if (!data.session) {
          setMode('signin');
          setPassword('');
          setError('Account created. Please check your email to confirm, then sign in.');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onAuthed();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-zinc-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <Brand />
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Demo: <span className="font-mono">demo@example.com</span> / <span className="font-mono">password123</span>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-8 shadow-sm">
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Access is controlled by role: Viewer, Analyst, Admin.
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
                <div className="text-xs text-zinc-500">or</div>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signInWithGoogle('Financial')}
                disabled={!supabase}
              >
                Continue with Google
              </Button>

              <button
                type="button"
                onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
                className="w-full text-sm text-indigo-700 hover:underline dark:text-indigo-300"
              >
                {mode === 'signin' ? 'Create an account' : 'Already have an account? Sign in'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-gradient-to-br from-white/70 to-white/30 dark:from-white/10 dark:to-white/5 backdrop-blur-xl p-8 shadow-sm">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">What you can do</div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                Viewer: read-only dashboard + records
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-violet-500" />
                Analyst: read + analytics endpoints
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-fuchsia-500" />
                Admin: full CRUD + user management
              </li>
            </ul>

            <div className="mt-8 rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Backend architecture</div>
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                API routes emulate an Express-style controller/service/middleware layout with role-based checks,
                validation, and analytics aggregations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
