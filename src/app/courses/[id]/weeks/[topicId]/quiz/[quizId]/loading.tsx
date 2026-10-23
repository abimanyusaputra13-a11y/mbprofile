import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export default function StudentQuizLoading() {
  return (
    <PageContainer>
      <div className="py-8 sm:py-12 max-w-3xl mx-auto space-y-6 animate-pulse">
        {/* Back Link */}
        <div className="h-4 w-48 bg-neutral-200 rounded" />

        {/* Intro Card Skeleton */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-black/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)] space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 bg-neutral-200 rounded-lg" />
            <div className="h-6 w-24 bg-neutral-200 rounded-lg" />
          </div>

          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-neutral-300 rounded-lg" />
            <div className="h-4 w-full bg-neutral-100 rounded" />
            <div className="h-4 w-2/3 bg-neutral-100 rounded" />
          </div>

          {/* Rules / Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-neutral-100">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
                <div className="h-3 w-16 bg-neutral-200 rounded" />
                <div className="h-5 w-24 bg-neutral-300 rounded" />
              </div>
            ))}
          </div>

          {/* Form Inputs Skeleton */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-neutral-200 rounded" />
              <div className="h-11 w-full bg-neutral-50 rounded-xl border border-neutral-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-36 bg-neutral-200 rounded" />
              <div className="h-11 w-full bg-neutral-50 rounded-xl border border-neutral-200" />
            </div>
            <div className="h-12 w-full bg-neutral-900/20 rounded-full mt-4" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
