import { createBrowserClient } from '@supabase/ssr';

function normalizeUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!rawUrl || !supabaseAnonKey) {
    // Return dummy or null client when credentials are not configured yet
    return null;
  }

  return createBrowserClient(normalizeUrl(rawUrl), supabaseAnonKey);
}

export const isSupabaseConfigured = () => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};
