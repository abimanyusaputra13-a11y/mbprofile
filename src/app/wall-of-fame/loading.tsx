import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeading } from '@/components/ui/PageHeading';
import { PlusCircle } from 'lucide-react';

export default function WallOfFameLoading() {
  return (
    <div className="flex flex-col gap-12 pb-20 animate-pulse">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-neutral-200/80">
        <PageContainer>
          <PageHeading
            titlePrefix="Wall of"
            accentWord="Fame"
            description="Etalase apresiasi dedikasi, kejuaraan kompetisi, kepemimpinan, serta capaian prestasi terbaik mahasiswa Departemen Manajemen Bisnis ITS."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold">
                <PlusCircle className="size-3.5" />
                <span>Laporkan Prestasi Mahasiswa</span>
              </span>
            </div>
          </PageHeading>
        </PageContainer>
      </section>

      {/* Filter Skeleton */}
      <section>
        <PageContainer>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-6">
            <div className="max-w-2xl">
              <div className="h-3 w-40 bg-neutral-300 rounded mb-2" />
              <div className="h-11 w-full bg-neutral-100 rounded-2xl border border-neutral-200" />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-neutral-100">
              <div className="h-4 w-28 bg-neutral-200 rounded mr-2" />
              {[1, 2, 3, 4, 5].map((c) => (
                <div key={c} className="h-7 w-24 bg-neutral-100 rounded-full" />
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Achievement Cards Grid Skeleton */}
      <section>
        <PageContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="h-6 w-24 bg-amber-100 rounded-full" />
                    <div className="h-5 w-14 bg-neutral-100 rounded" />
                  </div>

                  <div className="h-5 w-4/5 bg-neutral-300 rounded mb-2" />
                  <div className="h-4 w-3/5 bg-neutral-200 rounded mb-4" />

                  <div className="space-y-2 pt-3 border-t border-neutral-100">
                    <div className="h-3 w-28 bg-neutral-200 rounded" />
                    <div className="h-3.5 w-3/4 bg-neutral-100 rounded" />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="h-3.5 w-28 bg-neutral-200 rounded" />
                  <div className="h-7 w-20 bg-neutral-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
