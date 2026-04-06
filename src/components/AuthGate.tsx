import { useEffect, useState } from 'react';
import supabase, { supabaseConfigError } from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { Button } from './Button';
import { Input } from './Input';
import { Brand } from './Brand';

export default function AuthGate({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const check = async () => {
      const { data } = await client.auth.getSession();
      if (data.session) onDone();
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = supabase;
    if (!client) {
      setError(supabaseConfigError || 'Supabase is not configured');
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setMode('signin');
          setPassword('');
          setInfo('Account created. Check your email to confirm, then sign in.');
          return;
        }
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      onDone();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <Brand />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Access is role-based (Viewer / Analyst / Admin).
          </div>
        </div>
        <Button variant="secondary" size="sm" type="button" onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}>
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </Button>
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-3 items-end">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <div className="mt-3">
        <Button type="button" variant="ghost" onClick={() => signInWithGoogle('Financial')} disabled={!supabase}>
          Continue with Google
        </Button>
      </div>

      {info ? (
        <div className="mt-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
          {info}
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
