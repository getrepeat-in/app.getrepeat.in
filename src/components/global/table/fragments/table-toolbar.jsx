"use client";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export function TableToolbar({ title, subtitle, totalCount, searchable = false, searchPlaceholder = "Search records...", searchQuery = "", onSearchChange, actions, filterTabs, activeFilterTab, onFilterTabChange, selectedCount = 0, onClearSelection, selectionActions, className }) {
  const hasSelected = selectedCount > 0;
  const hasHeaderRow = Boolean(title || subtitle || actions || hasSelected);
  const hasFilterRow = Boolean((filterTabs && filterTabs.length > 0) || searchable);

  if (!hasHeaderRow && !hasFilterRow) return null;

  return (
    <div className={cn("flex flex-col gap-3 w-full min-w-0", className)}>
      {(title || subtitle || actions || hasSelected) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full min-w-0">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
                <span className="truncate">{title}</span>
                {totalCount !== undefined && totalCount !== null && (
                  <span className="inline-flex items-center shrink-0 rounded-md bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 border border-gray-200/60 dark:border-zinc-700/60">
                    {totalCount}
                  </span>
                )}
              </h3>
            )}
            {subtitle && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2 sm:truncate">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end min-w-0 shrink-0">
            {hasSelected ? (
              <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary px-3 py-1.5 rounded-md text-xs font-medium animate-in fade-in duration-150">
                <span>{selectedCount} selected</span>
                {selectionActions}
                {onClearSelection && (
                  <button
                    onClick={onClearSelection}
                    className="ml-1 text-xs opacity-75 hover:opacity-100 underline underline-offset-2 transition-opacity cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            ) : (
              actions
            )}
          </div>
        </div>
      )}

      {(filterTabs || searchable) && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-1 w-full min-w-0">
          {filterTabs && filterTabs.length > 0 ? (
            <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-zinc-900/80 border border-gray-200/60 dark:border-zinc-800 rounded-md overflow-x-auto scrollbar-none max-w-full">
              {filterTabs.map((tab) => {
                const isActive = (activeFilterTab || filterTabs[0].value) === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => onFilterTabChange && onFilterTabChange(tab.value)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0",
                      isActive
                        ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs font-semibold"
                        : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                    )}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={cn("ml-1.5 px-1.5 py-0.2 rounded-full text-[10px]", isActive ? "bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300" : "opacity-60")}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : <div />}

          {searchable && (
            <div className="relative w-full md:w-72 min-w-0 shrink-0">
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3 h-3.5 w-3.5 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-full h-8.5 pl-8.5 pr-8 text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md text-gray-800 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-2xs transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange && onSearchChange("")}
                    className="absolute right-2.5 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
