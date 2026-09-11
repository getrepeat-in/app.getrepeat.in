"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { getCellValue } from "../helpers";
import { Skeleton } from "@/components/ui/skeleton";

export function TableMobileCardSkeleton({ rows = 3 }) {
  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800/60">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="p-4 space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Skeleton className="h-5 w-5 rounded shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-md shrink-0" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableMobileCards({
  columns = [],
  data = [],
  isLoading = false,
  emptyState,
  selectable = false,
  selectedRows = new Set(),
  onSelectRow,
  getRowId = (row, idx) => row?._id || row?.id || idx,
  onRowClick,
  renderMobileCard,
  className,
}) {
  if (isLoading) {
    return <TableMobileCardSkeleton rows={data.length > 0 ? Math.min(data.length, 5) : 3} />;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // Identify special columns
  const actionsCol = columns.find(
    (c) =>
      c.key === "actions" ||
      c.key === "action" ||
      c.id === "actions" ||
      c.accessorKey === "actions" ||
      c.align === "right"
  );

  // Identify S.No column
  const snoCol = columns.find(
    (c) => c.key === "sno" || c.key === "sr" || c.key === "index" || c.accessorKey === "sno"
  );

  // Identify Primary Column (first substantive non-sno, non-actions column)
  const primaryCol =
    columns.find(
      (c) =>
        c !== actionsCol &&
        c !== snoCol &&
        !c.hidden
    ) || columns[0];

  // Secondary badge/tag column (e.g., status/type) if exists next to primary
  const detailCols = columns.filter(
    (c) =>
      c !== primaryCol &&
      c !== actionsCol &&
      c !== snoCol &&
      !c.hidden
  );

  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-gray-100 dark:divide-zinc-800/80 bg-white dark:bg-zinc-950",
        className
      )}
    >
      {data.map((row, rIdx) => {
        const rowId = getRowId(row, rIdx);
        const isSelected = selectedRows.has(rowId);

        if (renderMobileCard) {
          return (
            <div
              key={rowId || rIdx}
              onClick={(e) => onRowClick && onRowClick(row, rIdx, e)}
              className={cn(
                "p-4 transition-colors",
                onRowClick && "cursor-pointer hover:bg-gray-50/70 dark:hover:bg-zinc-900/60",
                isSelected && "bg-primary/[0.04] dark:bg-primary/[0.08]"
              )}
            >
              {renderMobileCard(row, rIdx, { columns, isSelected, onSelectRow })}
            </div>
          );
        }

        // Automatic smart card layout
        const primaryVal = getCellValue(row, primaryCol);
        const primaryRender = primaryCol?.render
          ? primaryCol.render(row, rIdx, primaryCol)
          : primaryCol?.cell
          ? primaryCol.cell(primaryVal, row, rIdx)
          : primaryVal !== null && primaryVal !== undefined
          ? String(primaryVal)
          : "—";

        const actionsVal = actionsCol ? getCellValue(row, actionsCol) : null;
        const actionsRender = actionsCol?.render
          ? actionsCol.render(row, rIdx, actionsCol)
          : actionsCol?.cell
          ? actionsCol.cell(actionsVal, row, rIdx)
          : actionsVal;

        const snoVal = snoCol ? getCellValue(row, snoCol) : null;
        const snoRender = snoCol?.render
          ? snoCol.render(row, rIdx, snoCol)
          : snoCol?.cell
          ? snoCol.cell(snoVal, row, rIdx)
          : snoVal ?? (rIdx + 1);

        return (
          <div
            key={rowId || rIdx}
            onClick={(e) => onRowClick && onRowClick(row, rIdx, e)}
            className={cn(
              "p-4 space-y-3 transition-colors",
              onRowClick && "cursor-pointer hover:bg-gray-50/70 dark:hover:bg-zinc-900/60",
              isSelected && "bg-primary/[0.04] dark:bg-primary/[0.08]"
            )}
          >
            {/* Header: S.No (optional) + Select checkbox + Primary Info + Actions */}
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {selectable && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectRow && onSelectRow(rowId, row, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 mt-1 rounded border-gray-300 dark:border-zinc-700 text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
                  />
                )}

                {snoCol && (
                  <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 shrink-0 mt-0.5 min-w-[20px]">
                    #{snoRender}
                  </span>
                )}

                <div className="min-w-0 flex-1 font-semibold text-gray-900 dark:text-zinc-100 leading-snug">
                  {primaryRender}
                </div>
              </div>

              {actionsRender && (
                <div
                  className="shrink-0 flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actionsRender}
                </div>
              )}
            </div>

            {/* Details: Responsive Grid of column pills */}
            {detailCols.length > 0 && (
              <div
                className={cn(
                  "grid gap-2 pt-1 text-xs",
                  detailCols.length === 1 ? "grid-cols-1" : "grid-cols-2"
                )}
              >
                {detailCols.map((col, cIdx) => {
                  const val = getCellValue(row, col);
                  const renderedVal = col.render
                    ? col.render(row, rIdx, col)
                    : col.cell
                    ? col.cell(val, row, rIdx)
                    : val !== null && val !== undefined
                    ? String(val)
                    : "—";

                  const headerLabel =
                    typeof col.header === "function" ? col.header(col) : col.header;

                  return (
                    <div
                      key={col.key || col.accessorKey || col.field || cIdx}
                      className={cn(
                        "flex flex-col gap-1 min-w-0 bg-gray-50/80 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-gray-100/90 dark:border-zinc-800/80",
                        detailCols.length % 2 === 1 && cIdx === detailCols.length - 1 && detailCols.length > 1
                          ? "col-span-2"
                          : ""
                      )}
                    >
                      {headerLabel && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 truncate">
                          {headerLabel}
                        </span>
                      )}
                      <div className="text-gray-800 dark:text-zinc-200 font-medium min-w-0 break-words flex items-center gap-1.5 flex-wrap">
                        {renderedVal}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

