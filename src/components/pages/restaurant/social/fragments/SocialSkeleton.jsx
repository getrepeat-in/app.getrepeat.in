"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SocialSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8.5 w-24 rounded-lg" />
          <Skeleton className="h-8.5 w-24 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-border/40 p-3 rounded-xl shadow-2xs">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border border-border/50 rounded-xl shadow-2xs"
          >
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-3 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <div className="pt-2 space-y-1.5">
                  <Skeleton className="h-2.5 w-24 rounded" />
                  <Skeleton className="h-3 w-36 rounded" />
                </div>
              </div>
              <Skeleton className="h-8 w-full rounded-lg mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
