"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from "../helpers/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TablePagination({ currentPage = 1, pageSize = DEFAULT_PAGE_SIZE, totalItems = 0, onPageChange, onPageSizeChange, pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS, className }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-t border-gray-200/80 dark:border-zinc-800/80 bg-[#fafbfd]/90 dark:bg-zinc-900/40 text-xs text-gray-500 dark:text-zinc-400",
        className
      )}
    >
      <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
        <span className="text-xs text-gray-600 dark:text-zinc-400 whitespace-nowrap">
          Showing{" "}
          <strong className="font-semibold text-gray-900 dark:text-zinc-100">{startItem}</strong>
          {" to "}
          <strong className="font-semibold text-gray-900 dark:text-zinc-100">{endItem}</strong>
          {" of "}
          <strong className="font-semibold text-gray-900 dark:text-zinc-100">{totalItems}</strong>
          {" entries"}
        </span>

        {pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange && (
          <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-zinc-800 pl-2.5 sm:pl-3 ml-auto sm:ml-0">
            <span className="hidden xs:inline text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 whitespace-nowrap">
              Per page:
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-auto min-w-0 gap-1.5 px-2 py-0 text-xs font-medium rounded-md border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800/60 focus-visible:ring-primary/20">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent
                align="end"
                side="top"
                className="w-auto min-w-[54px] rounded-md border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-md"
              >
                {pageSizeOptions.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={String(opt)}
                    className="text-xs py-1 px-2 rounded-md font-medium cursor-pointer focus:bg-primary/10 focus:text-primary dark:focus:bg-primary/20 dark:focus:text-primary"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-1.5 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-7 w-7 rounded-md border-gray-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 shadow-2xs"
            title="Previous Page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          <div className="flex items-center gap-1 px-0.5">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
              let pageNum = idx + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + idx;
                if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
              }

              const isActive = pageNum === currentPage;
              return (
                <button
                  key={`page-btn-${pageNum}`}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "flex h-7 min-w-[28px] px-2 items-center justify-center rounded-md text-xs font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/80"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-7 w-7 rounded-md border-gray-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 shadow-2xs"
            title="Next Page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
