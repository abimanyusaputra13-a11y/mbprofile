'use server';

import { createClient } from '@/lib/supabase/server';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';

export interface AuthActionState {
  error?: string;
  success?: boolean;
}

/**
 * Sign in admin with Email and Password
 */
export async function signInAction(prevState: AuthActionState | null, formData: FormData): Promise<AuthActionState> {
  const email = (formData.get('email') as string)?.trim();
  const password = (formData.get('password') as string);
  const redirectTo = (formData.get('redirect') as string) || '/admin';

  if (!email || !password) {
    return { error: 'Harap masukkan email dan kata sandi.' };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: 'Konfigurasi Supabase belum dipasang pada .env.local.' };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: `Gagal masuk: ${signInError.message}` };
  }

  // Verify that the authenticated user is registered in admin_users
  const adminCheck = await verifyAdminStatus();
  if (!adminCheck.isAdmin) {
    // If authenticated user is NOT in admin_users, immediately sign them out
    await supabase.auth.signOut();
    return { error: 'Akses ditolak: Akun Anda bukan administrator terdaftar.' };
  }

  redirect(redirectTo);
}

/**
 * Sign out action
 */
export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect('/admin/login');
}
