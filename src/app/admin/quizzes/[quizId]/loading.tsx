import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export default function AdminQuizEditorLoading() {
  return (
    <PageContainer>
      <div className="py-8 space-y-6 animate-pulse">
        {/* Back Link Skeleton */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="h-4 w-48 bg-neutral-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-neutral-200 rounded-xl" />
            <div className="h-9 w-32 bg-neutral-900/20 rounded-xl" />
          </div>
        </div>

        {/* Quiz Meta Card Skeleton */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)] space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-neutral-200 rounded-lg" />
            <div className="h-6 w-20 bg-neutral-200 rounded-lg" />
          </div>
          <div className="h-8 w-2/3 max-w-md bg-neutral-300 rounded-lg" />
          <div className="h-4 w-full max-w-xl bg-neutral-100 rounded" />
        </div>

        {/* Question Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((q) => (
            <div
              key={q}
              className="bg-white rounded-3xl p-6 border-2 border-black/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-neutral-200 rounded" />
                <div className="h-5 w-16 bg-neutral-200 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-neutral-200 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {[1, 2, 3, 4].map((opt) => (
                  <div key={opt} className="h-10 bg-neutral-100 rounded-xl border border-neutral-200" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
