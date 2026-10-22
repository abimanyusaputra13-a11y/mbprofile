import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeading } from '@/components/ui/PageHeading';

export default function DosenLoading() {
  return (
    <div className="flex flex-col gap-12 pb-20 animate-pulse">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-neutral-200/80">
        <PageContainer>
          <PageHeading
            titlePrefix="Direktori Dosen"
            accentWord="Manajemen Bisnis"
            description="Mengenal jajaran dosen, pimpinan departemen, fokus riset penelitian, dan publikasi ilmiah resmi Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS)."
          />
        </PageContainer>
      </section>

      {/* Filter Skeleton */}
      <section>
        <PageContainer>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-6">
            <div className="max-w-2xl">
              <div className="h-3 w-48 bg-neutral-300 rounded mb-2" />
              <div className="h-11 w-full bg-neutral-100 rounded-2xl border border-neutral-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <div className="h-10 w-full bg-neutral-100 rounded-xl" />
              <div className="h-10 w-full bg-neutral-100 rounded-xl" />
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center gap-2 overflow-hidden">
              <div className="h-4 w-24 bg-neutral-200 rounded shrink-0" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((t) => (
                  <div key={t} className="h-7 w-28 bg-neutral-100 rounded-full shrink-0" />
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex justify-between">
              <div className="h-4 w-36 bg-neutral-200 rounded" />
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Lecturers Grid Skeleton */}
      <section>
        <PageContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="size-20 sm:size-22 rounded-2xl bg-neutral-200 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex gap-1.5">
                        <div className="h-5 w-20 bg-blue-100 rounded-full" />
                        <div className="h-5 w-16 bg-amber-100 rounded-full" />
                      </div>
                      <div className="h-5 w-4/5 bg-neutral-300 rounded" />
                      <div className="h-3.5 w-28 bg-neutral-200 rounded font-mono" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-neutral-100">
                    <div className="h-3 w-32 bg-neutral-200 rounded" />
                    <div className="flex flex-wrap gap-1.5">
                      <div className="h-5 w-24 bg-neutral-100 rounded-full" />
                      <div className="h-5 w-20 bg-neutral-100 rounded-full" />
                      <div className="h-5 w-28 bg-neutral-100 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="h-4 w-28 bg-neutral-200 rounded" />
                  <div className="h-8 w-24 bg-blue-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
