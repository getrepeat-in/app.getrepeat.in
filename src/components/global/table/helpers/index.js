export function getCellValue(row, col) {
  if (!row || !col) return "";
  if (typeof col.accessorFn === "function") return col.accessorFn(row);
  if (typeof col.accessor === "function") return col.accessor(row);
  const key = col.key || col.accessorKey || col.accessor || col.field;
  if (typeof key === "function") return key(row);
  if (!key) return "";
  return key.split(".").reduce((acc, part) => (acc !== null && acc !== undefined ? acc[part] : undefined), row);
}

export function filterTableData(data = [], searchQuery = "", searchKeys = [], columns = []) {
  if (!searchQuery.trim()) return data;
  const query = searchQuery.toLowerCase().trim();

  return data.filter((row) => {
    if (searchKeys.length > 0) {
      return searchKeys.some((k) => {
        const val = typeof k === "function" ? k(row) : k.split(".").reduce((acc, p) => acc?.[p], row);
        return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
      });
    }

    return columns.some((col) => {
      const val = getCellValue(row, col);
      return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
    });
  });
}

export function sortTableData(data = [], sortConfig = {}, onSort = null) {
  if (!sortConfig.key || !sortConfig.direction || onSort) return data;

  return [...data].sort((a, b) => {
    const aVal = sortConfig.key.split(".").reduce((acc, p) => acc?.[p], a);
    const bVal = sortConfig.key.split(".").reduce((acc, p) => acc?.[p], b);

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" });
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });
}

export function getRowIdentifier(row, index, rowKey = "_id") {
  if (typeof rowKey === "function") return rowKey(row, index);
  return row?.[rowKey] ?? row?.id ?? row?._id ?? index;
}

export * from "./constants";

