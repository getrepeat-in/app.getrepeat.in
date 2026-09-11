"use client";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function TableEmpty({
  icon,
  title = "No data available",
  description = "There are no records matching your request.",
  action,
  className
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 sm:p-16 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800/80 text-gray-400 dark:text-zinc-500 mb-4 ring-8 ring-gray-50 dark:ring-zinc-900/50 shadow-xs">
        {icon || <Inbox className="h-7 w-7 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
