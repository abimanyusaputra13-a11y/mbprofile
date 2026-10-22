import React from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import { signOutAction } from '@/lib/actions/auth';
import { ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard - Departemen Manajemen Bisnis ITS',
  description: 'Owner-only course content management dashboard',
};

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const auth = await verifyAdminStatus();

  return (
    <div className="min-h-screen bg-neutral-50/70 text-neutral-900 flex flex-col justify-between">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs">
        <PageContainer>
          <div className="flex items-center justify-between h-16">
            {/* Branding & Back to Main Website */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition p-1.5 rounded-lg hover:bg-neutral-100"
                title="Kembali ke Halaman Utama Situs"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Website Publik</span>
              </Link>

              <div className="h-5 w-px bg-neutral-200 hidden sm:block" />

              <Link href="/admin" className="flex items-center gap-2 group">
                <div className="size-8 rounded-xl bg-blue-600 text-white font-black grid place-items-center text-sm shadow-2xs group-hover:bg-blue-700 transition">
                  MB
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-neutral-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                    <span>Admin Kursus & Materi</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded-full border border-blue-200">
                      ITS Surabaya
                    </span>
                  </h1>
                </div>
              </Link>
            </div>

            {/* User status & Logout */}
            {auth.isAdmin && (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span className="font-mono font-medium truncate max-w-[200px]">
                    {auth.user?.email}
                  </span>
                </div>

                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Keluar</span>
                  </button>
                </form>
              </div>
            )}
          </div>
          {auth.isAdmin && <AdminNavBar />}
        </PageContainer>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-12">{children}</main>

      {/* Admin Minimal Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 text-center text-xs text-neutral-500">
        <PageContainer>
          <p>
            Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS) • Panel Kurikulum & Konten Akademik
          </p>
        </PageContainer>
      </footer>
    </div>
  );
}
