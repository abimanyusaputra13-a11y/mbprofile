import { connection } from 'next/server';
import { createClient } from './server';
import { User } from '@supabase/supabase-js';

export interface AdminAuthResult {
  isAdmin: boolean;
  user: User | null;
  error?: string;
}

/**
 * Checks if the currently authenticated user is an authorized administrator.
 * Validates against the public.admin_users table in Postgres.
 */
export async function verifyAdminStatus(): Promise<AdminAuthResult> {
  await connection();
  const supabase = await createClient();

  if (!supabase) {
    return {
      isAdmin: false,
      user: null,
      error: 'Supabase credentials are not configured.',
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      isAdmin: false,
      user: null,
      error: 'Unauthenticated user.',
    };
  }

  // Check if user is in admin_users table
  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return {
      isAdmin: false,
      user,
      error: 'Unauthorized: User is not registered in admin_users.',
    };
  }

  return {
    isAdmin: true,
    user,
  };
}
