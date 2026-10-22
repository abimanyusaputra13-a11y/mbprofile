import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeading } from '@/components/ui/PageHeading';
import { BookOpen, Upload } from 'lucide-react';

export default function MateriDanSoalLoading() {
  return (
    <div className="flex flex-col gap-12 pb-20 animate-pulse">
      {/* Page Header */}
      <section className="relative overflow-hidden border-b border-neutral-200/80">
        <PageContainer>
          <PageHeading
            titlePrefix="Materi &"
            accentWord="Bank Soal"
            description="Pusat kurasi sumber belajar: kumpulan catatan kuliah, slide dosen, modul praktikum, dan arsip Ujian Tengah/Akhir Semester."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900/10 text-xs font-bold text-neutral-400">
                <Upload className="size-3.5" />
                <span>Kontribusi / Unggah Materi</span>
              </span>
            </div>
          </PageHeading>
        </PageContainer>
      </section>

      {/* Interactive System Banner Skeleton */}
      <section className="mb-2">
        <PageContainer>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950 px-2.5 py-0.5 rounded-full border border-black/30">
                  Sistem Pembelajaran Mingguan
                </span>
                <span className="text-xs text-blue-200">Silabus, Dokumen &amp; Kuis Interaktif</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Akses Materi Teks, Berkas Dosen, dan Kuis Evaluasi per Minggu
              </h3>
              <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl">
                Setiap mata kuliah Departemen MB ITS kini terstruktur dalam minggu perkuliahan. Anda dapat mempelajari bahan bacaan, mengunduh salindia kuliah, dan mengerjakan kuis evaluasi otomatis.
              </p>
            </div>
            <div className="h-10 w-44 bg-white/20 rounded-full shrink-0" />
          </div>
        </PageContainer>
      </section>

      {/* Filter Skeleton */}
      <section>
        <PageContainer>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-6">
            <div className="max-w-2xl">
              <div className="h-3 w-32 bg-neutral-300 rounded mb-2" />
              <div className="h-11 w-full bg-neutral-100 rounded-2xl border border-neutral-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-neutral-100">
              <div className="h-10 w-full bg-neutral-100 rounded-xl" />
              <div className="h-10 w-full bg-neutral-100 rounded-xl" />
              <div className="h-10 w-full bg-neutral-100 rounded-xl" />
              <div className="h-10 w-full bg-neutral-100 rounded-xl" />
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Cards Grid Skeleton */}
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
                    <div className="flex gap-1.5">
                      <div className="h-5 w-16 bg-neutral-900/30 rounded-full" />
                      <div className="h-5 w-14 bg-blue-100 rounded-full" />
                      <div className="h-5 w-20 bg-amber-100 rounded-full" />
                    </div>
                    <div className="size-6 bg-neutral-100 rounded-full" />
                  </div>

                  <div className="h-3 w-28 bg-blue-100 rounded mb-2" />
                  <div className="h-5 w-4/5 bg-neutral-300 rounded mb-2" />
                  <div className="h-3.5 w-1/2 bg-neutral-200 rounded" />
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="h-4 w-20 bg-neutral-200 rounded" />
                  <div className="h-8 w-24 bg-neutral-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
