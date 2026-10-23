import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export default function AdminCourseDetailLoading() {
  return (
    <PageContainer>
      <div className="py-8 space-y-6 animate-pulse">
        {/* Top bar skeleton: Breadcrumb / Back button */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-neutral-200 rounded" />
            <div className="h-4 w-44 bg-neutral-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-neutral-200 rounded-xl" />
            <div className="h-9 w-32 bg-neutral-900/20 rounded-xl" />
          </div>
        </div>

        {/* Title & Metadata Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)] space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-6 w-20 bg-neutral-200 rounded-lg" />
            <div className="h-6 w-28 bg-neutral-200 rounded-lg" />
            <div className="h-6 w-16 bg-neutral-200 rounded-lg" />
          </div>
          <div className="h-8 w-3/4 max-w-lg bg-neutral-300 rounded-lg" />
          <div className="h-4 w-full max-w-2xl bg-neutral-100 rounded" />
          <div className="h-4 w-2/3 max-w-xl bg-neutral-100 rounded" />
        </div>

        {/* Tabs Bar Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
          {[1, 2, 3, 4, 5, 6].map((tab) => (
            <div key={tab} className="h-10 w-32 bg-neutral-200 rounded-xl shrink-0" />
          ))}
        </div>

        {/* Tab Content Skeleton */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)] space-y-6">
          <div className="h-6 w-48 bg-neutral-300 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-neutral-200 rounded" />
              <div className="h-11 w-full bg-neutral-100 rounded-xl border border-neutral-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-neutral-200 rounded" />
              <div className="h-11 w-full bg-neutral-100 rounded-xl border border-neutral-200" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-neutral-200 rounded" />
            <div className="h-28 w-full bg-neutral-100 rounded-xl border border-neutral-200" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
