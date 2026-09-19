"use client";

import { cn } from "@/lib/utils";
import React, { useState, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { getCellValue, filterTableData, sortTableData, getRowIdentifier } from "./helpers";
import { DENSITY_CELL_PADDING, DENSITY_HEADER_PADDING, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from "./helpers/constants";
import { TableContainer, TableScrollArea, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableToolbar, TableSkeleton, TableEmpty, TableError, TablePagination, TableMobileCards, TableMobileCardSkeleton } from "./fragments";
export { TableContainer, TableScrollArea, Table as TablePrimitive, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableToolbar, TableSkeleton, TableEmpty, TableError, TablePagination, TableMobileCards, TableMobileCardSkeleton } from "./fragments";

export * from "./helpers";
export * from "./helpers/constants";

export { DataTable, DataTable as Table };
export default function DataTable({
  columns = [],
  data = [],
  rows,
  isLoading = false,
  error = null,
  onRetry,
  emptyState,
  renderMobileCard,
  enableMobileCards = true,
  mobileCardClassName,
  renderGrid,
  gridClassName,
  renderGridLoading,

  title,
  subtitle,
  actions,
  toolbar,
  hideToolbar = false,
  searchable = false,
  searchPlaceholder = "Search records...",
  searchQuery: controlledSearchQuery,
  searchValue: controlledSearchValue,
  onSearchChange: controlledOnSearchChange,
  searchKeys = [],
  filterTabs,
  activeFilterTab,
  onFilterTabChange,

  selectable = false,
  selectedRows = [],
  onSelectionChange,
  selectionActions,

  sortable = true,
  defaultSort = null, 
  onSort, 
  manualSorting, 
  pagination = false,
  hidePagination = false,
  pageSize = DEFAULT_PAGE_SIZE,
  limit, 
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  currentPage: controlledPage,
  page, 
  totalItems: controlledTotalItems,
  totalCount, 
  total, 
  onPageChange: controlledOnPageChange,
  onPageSizeChange: controlledOnPageSizeChange,
  onLimitChange, 
  manualPagination, 
  manualFiltering, 

  density = "default",
  variant = "default",
  stickyHeader = false,
  maxHeight,
  onRowClick,
  onRowDoubleClick,
  rowProps,
  rowKey = "_id",
  containerClassName,
  tableClassName,
  headerClassName,
  rowClassName,
  cellClassName,
  footer,
  renderFooter,
  renderExpandedRow,
  expandedRows = [],
}) {
  const sourceData = useMemo(() => rows || data || [], [rows, data]);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const activeSearchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : controlledSearchValue !== undefined ? controlledSearchValue : internalSearchQuery;
  const isServerFiltered = manualFiltering !== undefined ? manualFiltering : Boolean(controlledOnSearchChange);

  const [currentSort, setCurrentSort] = useState(defaultSort || { key: null, direction: null });
  const isServerSorted = manualSorting !== undefined ? manualSorting : Boolean(onSort);

  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(pageSize || DEFAULT_PAGE_SIZE);

  const activePage = controlledPage !== undefined ? controlledPage : page !== undefined ? page : internalPage;
  const activePageSize = limit !== undefined ? limit : (controlledOnPageSizeChange ? pageSize : internalPageSize);
  const activeTotalCount = controlledTotalItems !== undefined ? controlledTotalItems : totalCount !== undefined ? totalCount : total !== undefined ? total : undefined;
  const isServerPaginated = manualPagination !== undefined ? manualPagination : Boolean(controlledOnPageChange || activeTotalCount !== undefined);
  
  const [internalSelected, setInternalSelected] = useState(new Set(selectedRows));
  const getRowId = useCallback((row, idx) => getRowIdentifier(row, idx, rowKey), [rowKey]);

  const handleSort = (col) => {
    if (!col.sortable && !sortable) return;
    const colKey = col.sortKey || col.key || col.accessorKey || col.field;
    if (!colKey) return;

    let nextDirection = "asc";
    if (currentSort.key === colKey) {
      if (currentSort.direction === "asc") nextDirection = "desc";
      else if (currentSort.direction === "desc") nextDirection = null;
    }

    const nextSort = { key: nextDirection ? colKey : null, direction: nextDirection };
    setCurrentSort(nextSort);
    if (onSort) onSort(nextSort);
  };

  const filteredData = useMemo(() => {
    if (isServerFiltered) return sourceData;
    return filterTableData(sourceData, activeSearchQuery, searchKeys, columns);
  }, [sourceData, activeSearchQuery, searchKeys, columns, isServerFiltered]);

  const sortedData = useMemo(() => {
    if (isServerSorted) return filteredData;
    return sortTableData(filteredData, currentSort, onSort);
  }, [filteredData, currentSort, onSort, isServerSorted]);

  const paginatedData = useMemo(() => {
    if (!pagination || isServerPaginated) return sortedData;
    const startIndex = (activePage - 1) * activePageSize;
    return sortedData.slice(startIndex, startIndex + activePageSize);
  }, [sortedData, pagination, isServerPaginated, activePage, activePageSize]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelected = new Set(internalSelected);

    if (isChecked) {
      paginatedData.forEach((row, idx) => {
        newSelected.add(getRowId(row, idx));
      });
    } else {
      paginatedData.forEach((row, idx) => {
        newSelected.delete(getRowId(row, idx));
      });
    }

    setInternalSelected(newSelected);
    if (onSelectionChange) {
      const selectedItems = sourceData.filter((r, idx) => newSelected.has(getRowId(r, idx)));
      onSelectionChange(Array.from(newSelected), selectedItems);
    }
  };

  const handleSelectRow = (rowId, row, e) => {
    e.stopPropagation();
    const newSelected = new Set(internalSelected);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setInternalSelected(newSelected);
    if (onSelectionChange) {
      const selectedItems = sourceData.filter((r, idx) => newSelected.has(getRowId(r, idx)));
      onSelectionChange(Array.from(newSelected), selectedItems);
    }
  };

  const allSelectedOnPage =
    paginatedData.length > 0 &&
    paginatedData.every((r, idx) => internalSelected.has(getRowId(r, idx)));
  const isIndeterminate =
    paginatedData.some((r, idx) => internalSelected.has(getRowId(r, idx))) && !allSelectedOnPage;

  const densityCellClass = DENSITY_CELL_PADDING[density] || DENSITY_CELL_PADDING.default;
  const densityHeaderClass = DENSITY_HEADER_PADDING[density] || DENSITY_HEADER_PADDING.default;

  const visibleColumns = useMemo(() => columns.filter((col) => !col.hidden), [columns]);

  return (
    <div className={cn("w-full min-w-0 flex flex-col space-y-3", containerClassName)}>
      {toolbar ? (
        toolbar
      ) : !hideToolbar ? (
        <TableToolbar
          title={title}
          subtitle={subtitle}
          totalCount={activeTotalCount !== undefined ? activeTotalCount : sourceData.length > 0 ? sourceData.length : undefined}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          searchQuery={activeSearchQuery}
          onSearchChange={(val) => {
            if (controlledOnSearchChange) {
              controlledOnSearchChange(val);
            } else {
              setInternalSearchQuery(val);
              if (pagination && !controlledPage && !page) setInternalPage(1);
            }
          }}
          actions={actions}
          filterTabs={filterTabs}
          activeFilterTab={activeFilterTab}
          onFilterTabChange={(tab) => {
            if (pagination && !controlledPage && !page) setInternalPage(1);
            if (onFilterTabChange) onFilterTabChange(tab);
          }}
          selectedCount={internalSelected.size}
          selectionActions={selectionActions}
          onClearSelection={() => {
            setInternalSelected(new Set());
            if (onSelectionChange) onSelectionChange([], []);
          }}
        />
      ) : null}

      <TableContainer
        className={cn(
          variant === "clean" && "border-none shadow-none bg-transparent dark:bg-transparent",
          containerClassName
        )}
      >
        {error ? (
          React.isValidElement(error) ? error : <TableError error={error} onRetry={onRetry} />
        ) : renderGrid ? (
          isLoading ? (
            renderGridLoading ? (
              renderGridLoading()
            ) : (
              <div className={cn("p-4 sm:p-5 flex-1 overflow-y-auto min-h-0", gridClassName)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div
                      key={item}
                      className="overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border border-border/50 rounded-xl shadow-2xs"
                    >
                      <div className="aspect-square w-full bg-muted/60 animate-pulse" />
                      <div className="p-3.5 space-y-3">
                        <div className="space-y-2">
                          <div className="h-3.5 w-full bg-muted/70 rounded animate-pulse" />
                          <div className="h-3.5 w-3/4 bg-muted/70 rounded animate-pulse" />
                        </div>
                        <div className="h-8 w-full bg-muted/60 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : paginatedData.length === 0 ? (
            <div className="w-full flex-1 flex flex-col">
              {React.isValidElement(emptyState) ? emptyState : <TableEmpty {...emptyState} />}
            </div>
          ) : (
            <div className={cn("p-4 sm:p-5 flex-1 overflow-y-auto min-h-0", gridClassName)}>
              {renderGrid(paginatedData)}
            </div>
          )
        ) : (
          <>
            <div className={cn(enableMobileCards && "hidden md:block")}>
              <TableScrollArea maxHeight={maxHeight}>
                <Table
                  className={cn(
                    variant === "striped" && "[&_tbody_tr:nth-child(even)]:bg-gray-50/40 dark:[&_tbody_tr:nth-child(even)]:bg-zinc-900/30",
                    tableClassName
                  )}
                >
                  <TableHeader sticky={stickyHeader} className={headerClassName}>
                    <tr className="border-b border-gray-200/90 dark:border-zinc-800">
                      {selectable && (
                        <TableHead className="w-10 text-center px-4">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={allSelectedOnPage}
                              ref={(el) => {
                                if (el) el.indeterminate = isIndeterminate;
                              }}
                              onChange={handleSelectAll}
                              className="h-4 w-4 rounded border-gray-300 dark:border-zinc-700 text-primary focus:ring-primary accent-primary cursor-pointer"
                              aria-label="Select all rows"
                            />
                          </div>
                        </TableHead>
                      )}

                      {visibleColumns.map((col, idx) => {
                        const colKey = col.sortKey || col.key || col.accessorKey || col.field;
                        const isColSortable = col.sortable ?? sortable;
                        const isSorted = currentSort.key === colKey;

                        return (
                          <TableHead
                            key={colKey || idx}
                            align={col.align}
                            sticky={col.sticky}
                            className={cn(
                              densityHeaderClass,
                              isColSortable &&
                                "cursor-pointer select-none group/th hover:text-gray-900 dark:hover:text-zinc-100",
                              col.headerClassName
                            )}
                            style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth }}
                            onClick={() => isColSortable && handleSort(col)}
                          >
                            <div
                              className={cn("inline-flex items-center gap-1.5", {
                                "justify-end": col.align === "right",
                                "justify-center": col.align === "center",
                                "justify-start": !col.align || col.align === "left",
                              })}
                            >
                              <span>{typeof col.header === "function" ? col.header(col) : col.header}</span>
                              {isColSortable && (
                                <span className="text-gray-400 dark:text-zinc-500 group-hover/th:text-gray-700 dark:group-hover/th:text-zinc-200 transition-colors">
                                  {isSorted ? (
                                    currentSort.direction === "asc" ? (
                                      <ChevronUp className="h-3.5 w-3.5 text-primary" />
                                    ) : (
                                      <ChevronDown className="h-3.5 w-3.5 text-primary" />
                                    )
                                  ) : (
                                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 group-hover/th:opacity-100" />
                                  )}
                                </span>
                              )}
                            </div>
                          </TableHead>
                        );
                      })}
                    </tr>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="p-0">
                          <TableSkeleton
                            columns={visibleColumns}
                            rows={pageSize > 5 ? 5 : pageSize}
                            density={density}
                          />
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="p-0">
                          {React.isValidElement(emptyState) ? emptyState : <TableEmpty {...emptyState} />}
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((row, rIdx) => {
                        const rowId = getRowId(row, rIdx);
                        const isSelected = internalSelected.has(rowId);
                        const isExpanded = expandedRows.includes(rowId);
                        const customRowClass =
                          typeof rowClassName === "function" ? rowClassName(row, rIdx) : rowClassName;
                        const customRowProps =
                          typeof rowProps === "function" ? rowProps(row, rIdx) : rowProps;

                        return (
                          <React.Fragment key={rowId || rIdx}>
                            <TableRow
                              isSelected={isSelected}
                              isHoverable={Boolean(onRowClick) || Boolean(onRowDoubleClick) || variant !== "clean"}
                              onClick={(e) => onRowClick && onRowClick(row, rIdx, e)}
                              onDoubleClick={(e) => onRowDoubleClick && onRowDoubleClick(row, rIdx, e)}
                              className={cn(
                                (onRowClick || onRowDoubleClick) && "cursor-pointer",
                                variant === "striped" && rIdx % 2 === 1 && "bg-gray-50/40 dark:bg-zinc-900/30",
                                customRowClass
                              )}
                              {...customRowProps}
                            >
                              {selectable && (
                                <TableCell className={cn("w-10 text-center px-4", densityCellClass)}>
                                  <div className="flex items-center justify-center">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => handleSelectRow(rowId, row, e)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-4 w-4 rounded border-gray-300 dark:border-zinc-700 text-primary focus:ring-primary accent-primary cursor-pointer"
                                    />
                                  </div>
                                </TableCell>
                              )}

                              {visibleColumns.map((col, cIdx) => {
                                const value = getCellValue(row, col);
                                const customCellClass =
                                  typeof col.cellClassName === "function"
                                    ? col.cellClassName(value, row, rIdx)
                                    : col.cellClassName;

                                return (
                                  <TableCell
                                    key={`${rowId}-${col.key || col.accessorKey || col.field || cIdx}`}
                                    align={col.align}
                                    sticky={col.sticky}
                                    className={cn(
                                      densityCellClass,
                                      customCellClass,
                                      cellClassName,
                                      col.className
                                    )}
                                    style={{
                                      width: col.width,
                                      minWidth: col.minWidth,
                                      maxWidth: col.maxWidth,
                                    }}
                                  >
                                    {col.render
                                      ? col.render(row, rIdx, col)
                                      : col.cell
                                      ? col.cell(value, row, rIdx)
                                      : value !== null && value !== undefined
                                      ? String(value)
                                      : "—"}
                                  </TableCell>
                                );
                              })}
                            </TableRow>

                            {isExpanded && renderExpandedRow && (
                              <tr className="bg-gray-50/60 dark:bg-zinc-900/40 border-b border-gray-100 dark:border-zinc-800">
                                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="p-4">
                                  {renderExpandedRow(row, rIdx)}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </TableBody>

                  {renderFooter ? (
                    renderFooter(paginatedData, visibleColumns)
                  ) : footer ? (
                    footer
                  ) : null}
                </Table>
              </TableScrollArea>
            </div>

            {/* Mobile Card View */}
            {enableMobileCards && (
              <div className="block md:hidden">
                {isLoading ? (
                  <TableMobileCardSkeleton rows={pageSize > 5 ? 5 : pageSize} />
                ) : paginatedData.length === 0 ? (
                  React.isValidElement(emptyState) ? emptyState : <TableEmpty {...emptyState} />
                ) : (
                  <TableMobileCards
                    columns={visibleColumns}
                    data={paginatedData}
                    selectable={selectable}
                    selectedRows={internalSelected}
                    onSelectRow={handleSelectRow}
                    getRowId={getRowId}
                    onRowClick={onRowClick}
                    renderMobileCard={renderMobileCard}
                    className={mobileCardClassName}
                  />
                )}
              </div>
            )}
          </>
        )}

        {pagination && !hidePagination && !isLoading && !error && (
          <TablePagination
            currentPage={activePage}
            pageSize={activePageSize}
            totalItems={
              activeTotalCount !== undefined ? activeTotalCount : filteredData.length
            }
            pageSizeOptions={pageSizeOptions}
            onPageChange={(p) => {
              if (controlledOnPageChange) controlledOnPageChange(p);
              else setInternalPage(p);
            }}
            onPageSizeChange={(s) => {
              if (controlledOnPageSizeChange) controlledOnPageSizeChange(s);
              else if (onLimitChange) onLimitChange(s);
              else setInternalPageSize(s);
              if (!controlledPage && !page) setInternalPage(1);
            }}
          />
        )}
      </TableContainer>
    </div>
  );
}
