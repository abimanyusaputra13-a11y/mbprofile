import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ArrowLeft, Calendar, BookOpen } from 'lucide-react';

export default function CourseDetailLoading() {
  return (
    <div className="flex flex-col gap-8 pb-20 animate-pulse">
      {/* Course Header Skeleton */}
      <section className="relative overflow-hidden border-b border-neutral-100 bg-neutral-50/60 pt-8 pb-10">
        <PageContainer>
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
              <ArrowLeft className="size-3.5" />
              <span>Kembali ke Materi &amp; Soal</span>
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-6 w-16 bg-neutral-900/40 rounded-lg" />
                <div className="h-6 w-28 bg-blue-100 rounded-full" />
                <div className="h-6 w-24 bg-amber-100 rounded-full" />
              </div>

              <div className="h-8 sm:h-10 w-3/4 bg-neutral-300 rounded-xl" />
              <div className="space-y-1.5 pt-1">
                <div className="h-3.5 w-full bg-neutral-200 rounded" />
                <div className="h-3.5 w-4/5 bg-neutral-200 rounded" />
              </div>
            </div>

            {/* Quick Stats Card Skeleton */}
            <div className="flex sm:flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] shrink-0 sm:min-w-[200px]">
              <div>
                <div className="h-3 w-16 bg-neutral-200 rounded mb-1" />
                <div className="h-5 w-20 bg-blue-100 rounded" />
              </div>
              <div className="sm:pt-2 sm:border-t sm:border-neutral-100">
                <div className="h-3 w-14 bg-neutral-200 rounded mb-1" />
                <div className="h-5 w-24 bg-neutral-200 rounded" />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Main Content Skeleton */}
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols: Weekly Modules Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="h-6 w-64 bg-neutral-200 rounded-lg mb-2" />
              <div className="h-3.5 w-96 bg-neutral-100 rounded" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-20 bg-blue-200 rounded-lg" />
                        <div className="h-5 w-48 bg-neutral-200 rounded-md" />
                      </div>
                      <div className="h-3 w-3/4 bg-neutral-100 rounded" />
                    </div>
                    <div className="h-8 w-28 bg-neutral-300 rounded-full shrink-0" />
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex flex-wrap gap-2">
                    <div className="h-6 w-24 bg-neutral-100 rounded-lg" />
                    <div className="h-6 w-28 bg-neutral-100 rounded-lg" />
                    <div className="h-6 w-24 bg-neutral-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Supplementary Info Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-3">
              <div className="h-4 w-40 bg-neutral-200 rounded" />
              <div className="space-y-2 pt-2">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-neutral-100">
                    <div className="h-3.5 w-28 bg-neutral-100 rounded" />
                    <div className="h-3.5 w-10 bg-neutral-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-blue-50/70 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-2">
              <div className="h-4 w-36 bg-blue-200 rounded" />
              <div className="h-3 w-full bg-blue-100 rounded" />
              <div className="h-3 w-5/6 bg-blue-100 rounded" />
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
