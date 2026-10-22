import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export default function GlobalLoading() {
  return (
    <div className="py-12 min-h-[60vh] animate-pulse">
      <PageContainer>
        {/* Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="h-4 w-32 bg-blue-100 rounded-full mx-auto" />
          <div className="h-10 w-3/4 sm:w-1/2 bg-neutral-200 rounded-2xl mx-auto" />
          <div className="h-4 w-5/6 sm:w-2/3 bg-neutral-100 rounded-lg mx-auto" />
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border-2 border-black/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 bg-neutral-200 rounded-lg" />
                <div className="h-4 w-16 bg-neutral-100 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-4/5 bg-neutral-200 rounded-md" />
                <div className="h-4 w-2/3 bg-neutral-100 rounded-md" />
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="h-3 w-full bg-neutral-100 rounded" />
                <div className="h-3 w-4/5 bg-neutral-100 rounded" />
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div className="h-4 w-24 bg-neutral-100 rounded" />
                <div className="h-8 w-24 bg-neutral-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
