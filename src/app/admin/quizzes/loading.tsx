import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export default function AdminQuizzesLoading() {
  return (
    <PageContainer>
      <div className="py-6 space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-neutral-200 rounded-xl" />
            <div className="h-4 w-96 bg-neutral-100 rounded-md" />
          </div>
          <div className="h-10 w-44 bg-neutral-200 rounded-xl" />
        </div>

        {/* Search & Filter Bar Skeleton */}
        <div className="bg-white rounded-3xl p-5 border-2 border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] space-y-4">
          <div className="h-4 w-32 bg-neutral-200 rounded" />
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-11 flex-1 bg-neutral-100 rounded-full border border-neutral-200" />
            <div className="flex gap-2">
              <div className="h-11 w-24 bg-neutral-200 rounded-full" />
              <div className="h-11 w-24 bg-neutral-100 rounded-full" />
              <div className="h-11 w-24 bg-neutral-100 rounded-full" />
            </div>
          </div>
        </div>

        {/* Quiz Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-3xl border-2 border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 bg-neutral-200 rounded-full" />
                  <div className="h-5 w-24 bg-neutral-100 rounded-full" />
                  <div className="h-5 w-16 bg-neutral-100 rounded-full" />
                </div>
                <div className="h-6 w-3/4 max-w-md bg-neutral-200 rounded-lg" />
                <div className="flex items-center gap-4 pt-1">
                  <div className="h-4 w-28 bg-neutral-100 rounded" />
                  <div className="h-4 w-24 bg-neutral-100 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-28 bg-neutral-100 rounded-full" />
                <div className="h-9 w-20 bg-neutral-200 rounded-full" />
                <div className="h-9 w-9 bg-neutral-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
