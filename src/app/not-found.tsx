import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { PRIMARY_NAV_ROUTES } from '@/data/navigation';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center py-20">
      <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />
      <PageContainer size="narrow">
        <div className="text-center space-y-6">
          <div className="grid place-items-center size-20 rounded-3xl bg-blue-50 text-blue-600 border border-blue-200 mx-auto shadow-sm">
            <FileQuestion className="size-10" />
          </div>

          <span className="font-mono text-sm font-bold bg-neutral-900 text-white px-3 py-1 rounded-full uppercase tracking-wider">
            Kesalahan 404 • Halaman Tidak Ditemukan
          </span>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-900">
            Halaman <span className="text-script text-blue-600 font-normal">Belum Tersedia</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto font-light leading-relaxed">
            Alamat URL yang Anda tuju mungkin salah ketik, telah dipindahkan ke direktori baru, atau belum dipublikasikan dalam rilis platform ini.
          </p>

          {/* Recovery navigation shortcuts */}
          <div className="pt-4 max-w-md mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Tautan Cepat yang Tersedia:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PRIMARY_NAV_ROUTES.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 hover:text-blue-600 hover:border-blue-400 transition shadow-2xs"
                >
                  {route.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Link href="/">
              <PrimaryButton variant="brand" size="md" icon={<Home className="size-4" />}>
                Kembali ke Beranda
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
