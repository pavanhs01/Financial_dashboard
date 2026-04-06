import supabase, { supabaseConfigError } from './supabase';

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function buildGoogleUrl(appName: string) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const redirectUri = import.meta.env.VITE_GOOGLE_AUTH_PROXY as string | undefined;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!clientId || !redirectUri) return null;
  const state = btoa(JSON.stringify({ origin: window.location.origin, appName, supabaseUrl, supabaseAnonKey }));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(state)}`;
}

export function signInWithGoogle(appName = 'Financial') {
  const url = buildGoogleUrl(appName);
  const client = supabase;
  if (!client) {
    console.warn('[google-auth]', supabaseConfigError || 'Supabase is not configured');
    return;
  }
  if (!url) {
    console.warn('[google-auth] Missing VITE_GOOGLE_CLIENT_ID or VITE_GOOGLE_AUTH_PROXY');
    return;
  }

  window.open(url, 'google-auth', isMobile() ? '' : 'width=500,height=600');

  const handler = async (event: MessageEvent) => {
    if ((event.data as any)?.type === 'google-auth-denied') {
      window.removeEventListener('message', handler);
      return;
    }
    if ((event.data as any)?.type !== 'google-auth-success') return;
    window.removeEventListener('message', handler);

    const d: any = event.data;
    if (d.access_token && d.refresh_token) {
      const { error } = await client.auth.setSession({ access_token: d.access_token, refresh_token: d.refresh_token });
      if (error) console.error('[google-auth] setSession failed:', error.message);
    } else if (d.id_token) {
      const { error } = await client.auth.signInWithIdToken({ provider: 'google', token: d.id_token });
      if (error) console.error('[google-auth] signInWithIdToken failed:', error.message);
    }
  };

  window.addEventListener('message', handler);
}

export async function handleGoogleRedirect() {
  if (!supabase) return;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('google_id_token');
  if (!token) return;
  window.history.replaceState({}, '', window.location.pathname);
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
  if (error) {
    console.error('[google-auth] signInWithIdToken failed:', error.message);
    return;
  }
  try {
    window.close();
  } catch {}
}
