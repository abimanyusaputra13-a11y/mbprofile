'use client';

import React, { useState, useActionState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInAction } from '@/lib/actions/auth';
import { PageContainer } from '@/components/layout/PageContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Badge } from '@/components/ui/Badge';
import { Lock, Mail, KeyRound, AlertCircle, ShieldAlert } from 'lucide-react';

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [state, formAction, isPending] = useActionState(signInAction, null);
  const [email, setEmail] = useState('abimanyusaputra13@gmail.com');
  const [password, setPassword] = useState('admin123');

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xl space-y-5">
      {/* Dev Quick Credential Helper */}
      <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold">Akun Admin Terverifikasi:</p>
          <p className="text-[11px] text-blue-700 font-mono">abimanyusaputra13@gmail.com • kata sandi: admin123</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmail('abimanyusaputra13@gmail.com');
            setPassword('admin123');
          }}
          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition cursor-pointer shrink-0"
        >
          Isi Otomatis
        </button>
      </div>

      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-950">Gagal Masuk</p>
            <p className="mt-0.5 leading-relaxed">{state.error}</p>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectPath} />

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
            Alamat Email Admin
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Mail className="size-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mb.its.ac.id"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
            Kata Sandi
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <KeyRound className="size-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        <div className="pt-2">
          <PrimaryButton
            type="submit"
            variant="brand"
            size="md"
            disabled={isPending}
            className="w-full justify-center"
          >
            {isPending ? 'Memvalidasi Kredensial...' : 'Masuk ke Dashboard'}
          </PrimaryButton>
        </div>
      </form>

      {/* Security Information Note */}
      <div className="pt-4 border-t border-neutral-100 flex items-start gap-2.5 text-[11px] text-neutral-500 leading-relaxed">
        <ShieldAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          Halaman ini dilindungi oleh Row Level Security (RLS) dan verifikasi identitas tabel <code>admin_users</code>. Hanya akun pemilik website yang telah disetujui yang dapat mengakses data draf dan melakukan perubahan konten.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <PageContainer size="narrow">
      <div className="max-w-md mx-auto my-8">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-grid place-items-center size-14 rounded-2xl bg-blue-600 text-white shadow-md mb-4">
            <Lock className="size-7" />
          </div>
          <Badge variant="yellow" size="sm" className="mb-2">
            Owner & Administrator Area
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Masuk ke Admin Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Kelola kurikulum, RPS, rangkuman materi, dan berkas lampiran Departemen Manajemen Bisnis ITS.
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center text-sm text-neutral-400">
            Memuat form login...
          </div>
        }>
          <AdminLoginForm />
        </Suspense>
      </div>
    </PageContainer>
  );
}
