import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to a local .env file before starting Vite.'
    : null;

const supabase: SupabaseClient | null = supabaseConfigError
  ? null
  : createClient(supabaseUrl!, supabaseAnonKey!);

export default supabase;
