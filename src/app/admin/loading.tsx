import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export default function AdminLoading() {
  return (
    <PageContainer>
      <div className="py-8 space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-neutral-300 rounded-lg" />
            <div className="h-4 w-72 bg-neutral-200 rounded" />
          </div>
          <div className="h-10 w-36 bg-neutral-900/30 rounded-xl" />
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((m) => (
            <div
              key={m}
              className="bg-white rounded-2xl p-5 border-2 border-black/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] space-y-2"
            >
              <div className="h-3 w-24 bg-neutral-200 rounded" />
              <div className="h-7 w-16 bg-neutral-300 rounded" />
            </div>
          ))}
        </div>

        {/* Table / List Skeleton */}
        <div className="bg-white rounded-3xl p-6 border-2 border-black/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] space-y-4">
          <div className="h-5 w-40 bg-neutral-300 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className="h-16 w-full bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between px-4"
              >
                <div className="space-y-1">
                  <div className="h-4 w-48 bg-neutral-200 rounded" />
                  <div className="h-3 w-32 bg-neutral-100 rounded" />
                </div>
                <div className="h-8 w-20 bg-neutral-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
