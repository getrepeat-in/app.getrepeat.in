"use client";
import { cn } from "@/lib/utils";
import { DENSITY_SKELETON_PADDING, DEFAULT_SKELETON_ROWS } from "../helpers/constants";

export function TableSkeleton({ columns = [], rows = DEFAULT_SKELETON_ROWS, density = "default" }) {
  const paddingClass = DENSITY_SKELETON_PADDING[density] || DENSITY_SKELETON_PADDING.default;

  return (
    <div className="w-full divide-y divide-gray-100 dark:divide-zinc-800/60">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={`skel-row-${rIdx}`} className="flex items-center w-full">
          {columns.map((col, cIdx) => (
            <div
              key={`skel-cell-${rIdx}-${col.key || col.accessorKey || col.field || cIdx}`}
              className={cn("flex items-center flex-1", paddingClass, {
                "justify-end": col.align === "right",
                "justify-center": col.align === "center",
                "justify-start": !col.align || col.align === "left",
              })}
              style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth }}
            >
              <div
                className={cn(
                  "h-4 rounded-md bg-gray-200/70 dark:bg-zinc-800 animate-pulse",
                  cIdx === 0 ? "w-3/4 max-w-[160px]" : "w-1/2 max-w-[120px]"
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
