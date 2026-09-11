"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export function TableError({ error, onRetry, className }) {
  const message =
    typeof error === "string"
      ? error
      : error?.message || "An unexpected error occurred while loading data.";

  return (
    <div
      className={cn(
        "m-6 flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-destructive mb-1">Failed to Load Data</h3>
      <p className="text-sm text-gray-600 dark:text-zinc-400 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 border-destructive/30 hover:bg-destructive/10 text-destructive"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
