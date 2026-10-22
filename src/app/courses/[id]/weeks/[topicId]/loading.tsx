import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function WeeklyLearningLoading() {
  return (
    <div className="py-8 min-h-screen animate-pulse">
      <PageContainer>
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Silabus Mata Kuliah</span>
          </span>
        </div>

        {/* Topic Header Skeleton */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-6 w-24 bg-blue-600/30 rounded-lg" />
            <div className="h-6 w-32 bg-neutral-200 rounded-full" />
          </div>
          <div className="h-8 sm:h-10 w-3/4 bg-neutral-300 rounded-xl" />
          <div className="h-4 w-2/3 bg-neutral-100 rounded" />
        </div>

        {/* Content Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 border-b border-neutral-200 pb-3">
              <div className="h-9 w-32 bg-neutral-900/30 rounded-xl" />
              <div className="h-9 w-32 bg-neutral-100 rounded-xl" />
              <div className="h-9 w-32 bg-neutral-100 rounded-xl" />
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
              <div className="h-6 w-1/2 bg-neutral-300 rounded-lg mb-6" />
              <div className="space-y-3">
                <div className="h-3.5 w-full bg-neutral-100 rounded" />
                <div className="h-3.5 w-full bg-neutral-100 rounded" />
                <div className="h-3.5 w-4/5 bg-neutral-100 rounded" />
                <div className="h-3.5 w-full bg-neutral-100 rounded" />
                <div className="h-3.5 w-3/4 bg-neutral-100 rounded" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
              <div className="h-4 w-36 bg-neutral-300 rounded" />
              <div className="h-20 w-full bg-neutral-50 rounded-2xl border border-neutral-100" />
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
