import React from 'react';

export default function TaskSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200/90 dark:border-neutral-800 p-4 shadow-xs animate-pulse">
      {/* Priority Pill & Action Placeholder */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        <div className="flex gap-1.5">
          <div className="h-4 w-4 bg-neutral-100 dark:bg-neutral-800/80 rounded"></div>
          <div className="h-4 w-4 bg-neutral-100 dark:bg-neutral-800/80 rounded"></div>
        </div>
      </div>

      {/* Title Placeholder */}
      <div className="h-4 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>
      <div className="h-3.5 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded mb-3"></div>

      {/* Description Lines */}
      <div className="space-y-1.5 mb-3.5">
        <div className="h-2.5 w-full bg-neutral-100 dark:bg-neutral-800/60 rounded"></div>
        <div className="h-2.5 w-5/6 bg-neutral-100 dark:bg-neutral-800/60 rounded"></div>
      </div>

      {/* Footer / Due Date & Quick Move */}
      <div className="pt-2 flex items-center justify-between">
        <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        <div className="h-3 w-12 bg-neutral-100 dark:bg-neutral-800/60 rounded"></div>
      </div>
    </div>
  );
}
