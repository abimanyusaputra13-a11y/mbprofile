import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export default function AdminAnnouncementsLoading() {
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

        {/* Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-3xl border-2 border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-neutral-200 rounded-full" />
                <div className="h-5 w-28 bg-neutral-100 rounded-full" />
              </div>
              <div className="h-6 w-3/5 bg-neutral-200 rounded-lg" />
              <div className="h-4 w-full bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
