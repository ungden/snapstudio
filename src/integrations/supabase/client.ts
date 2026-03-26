import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getEnvVars() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment. ' +
      'See .env.example for reference.'
    );
  }
  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseBrowserClient() {
  const env = getEnvVars();
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

// Create a singleton instance for consistent usage
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const env = getEnvVars();
    supabaseInstance = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return supabaseInstance;
}