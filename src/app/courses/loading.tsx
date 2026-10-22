import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function CoursesLoading() {
  return (
    <div className="py-10 min-h-screen">
      <PageContainer>
        <div className="space-y-8">
          {/* Header Banner Skeleton */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-neutral-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                <GraduationCap className="size-4 animate-pulse" />
                <span>Kurikulum &amp; Modul Perkuliahan MB ITS</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Daftar Mata Kuliah &amp; Modul Mingguan
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-light">
                Pilih mata kuliah untuk mengakses silabus resmi, materi bacaan terstruktur tiap minggu, unduhan slide materi/diktat, serta kuis evaluasi mandiri.
              </p>
            </div>

            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <BookOpen className="size-72 text-white" />
            </div>
          </div>

          {/* Skeleton Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-6 w-16 bg-blue-100 rounded-lg" />
                    <div className="h-4 w-20 bg-neutral-200 rounded" />
                  </div>

                  <div className="space-y-2">
                    <div className="h-5 w-4/5 bg-neutral-200 rounded-md" />
                    <div className="h-3 w-1/2 bg-neutral-100 rounded-md" />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="h-3 w-full bg-neutral-100 rounded" />
                    <div className="h-3 w-3/4 bg-neutral-100 rounded" />
                  </div>
                </div>

                <div className="space-y-4 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-neutral-200 rounded" />
                    <div className="h-3 w-16 bg-neutral-200 rounded" />
                  </div>

                  <div className="h-9 w-full bg-neutral-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
